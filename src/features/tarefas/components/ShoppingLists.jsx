import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { addDoc, collection, deleteDoc, doc, setDoc, updateDoc } from '@/lib/db';
import { ArrowUp, Check, Copy, MessageCircle, Pencil, Plus, RotateCcw, Share2, ShoppingCart, Trash2 } from 'lucide-react';
import { db } from '@/lib/db';
import { COL } from '@/lib/collections';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { TextField } from '@/components/ui/field';
import { EmptyState, Progress } from '@/components/ui/primitives';
import { QuickDelete } from '@/components/ui/quick-delete';
import { useFeedback } from '@/components/ui/feedback';
import {
  TIPOS_LISTA,
  agruparPorSecao,
  interpretarItens,
  listaComoTexto,
  novoId,
  registrarFrequentes,
  semAcento,
  tipoLista,
  tipoPeloNome,
} from '@/features/tarefas/lib/listas';

// Um item: toque em qualquer lugar da linha marca como "no carrinho"
function Item({ item, onToggle, onExcluir }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
      className="group flex items-center gap-3 border-b border-ink-800/70 last:border-0"
    >
      <button onClick={() => onToggle(item)} className="flex min-w-0 flex-1 items-center gap-3 py-3 text-left [@media(pointer:coarse)]:py-3.5">
        <span
          className={cn(
            'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 transition-colors',
            item.feito ? 'border-lime bg-lime text-ink-950' : 'border-ink-600 group-hover:border-ink-300'
          )}
        >
          {item.feito && <Check className="h-3 w-3" strokeWidth={3.5} />}
        </span>
        <span className={cn('min-w-0 flex-1 truncate text-[15px]', item.feito ? 'text-ink-500 line-through decoration-ink-600' : 'text-ink-50')}>
          {item.nome}
        </span>
        {item.qtd && (
          <span className={cn('shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-xs', item.feito ? 'border-ink-800 text-ink-600' : 'border-ink-700 text-ink-200')}>
            {item.qtd}
          </span>
        )}
      </button>
      <QuickDelete label={`Excluir ${item.nome}`} onClick={() => onExcluir(item)} />
    </motion.li>
  );
}

export function ShoppingLists({ user, listas, carregando, ativaId, onSelecionar }) {
  const { toast, confirm } = useFeedback();
  const [texto, setTexto] = useState('');
  const [dialogo, setDialogo] = useState(null); // { modo: 'nova' | 'renomear', nome, id? }

  const ordenadas = useMemo(() => [...listas].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)), [listas]);
  const lista = ordenadas.find((l) => l.id === ativaId) || ordenadas[0] || null;
  const tipo = lista ? tipoLista(lista.tipo) : null;
  const itens = lista?.itens || [];
  const pendentes = itens.filter((i) => !i.feito);
  const noCarrinho = itens.filter((i) => i.feito);
  const previa = useMemo(() => (lista && texto.trim() ? interpretarItens(texto, lista.tipo) : []), [texto, lista]);

  // O que a pessoa costuma comprar e ainda não está na lista
  const sugestoes = useMemo(() => {
    if (!lista) return [];
    const naLista = new Set(itens.map((i) => semAcento(i.nome)));
    return Object.entries(lista.frequentes || {})
      .filter(([chave]) => !naLista.has(chave))
      .sort((a, b) => b[1].vezes - a[1].vezes)
      .slice(0, 12)
      .map(([, v]) => v);
  }, [lista, itens]);

  const salvarItens = (novosItens, extra = {}) =>
    updateDoc(doc(db, COL.listas, lista.id), { itens: novosItens, atualizadoEm: Date.now(), ...extra });

  const criarLista = async (nome, tipoValor) => {
    const nomeFinal = nome.trim() || tipoLista(tipoValor).nome;
    const ref = await addDoc(collection(db, COL.listas), {
      userId: user.uid,
      nome: nomeFinal,
      tipo: tipoValor || tipoPeloNome(nomeFinal),
      itens: [],
      frequentes: {},
      createdAt: Date.now(),
      atualizadoEm: Date.now(),
    });
    onSelecionar(ref.id);
    return ref.id;
  };

  const adicionar = async (novos) => {
    if (!lista || !novos.length) return;
    // Item que já está na lista: só atualiza a quantidade e volta para pendente
    const atualizados = [...itens];
    novos.forEach((n) => {
      const idx = atualizados.findIndex((i) => semAcento(i.nome) === semAcento(n.nome));
      if (idx >= 0) atualizados[idx] = { ...atualizados[idx], qtd: n.qtd || atualizados[idx].qtd, feito: false };
      else atualizados.push({ id: novoId(), nome: n.nome, qtd: n.qtd || '', secao: n.secao, feito: false });
    });
    try {
      await salvarItens(atualizados, { frequentes: registrarFrequentes(lista.frequentes, novos) });
    } catch {
      toast({ title: 'Não foi possível adicionar', tone: 'error' });
    }
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (!previa.length) return;
    await adicionar(previa);
    setTexto('');
  };

  const alternar = (item) => salvarItens(itens.map((i) => (i.id === item.id ? { ...i, feito: !i.feito } : i)));

  const excluirItem = async (item) => {
    const anteriores = itens;
    await salvarItens(itens.filter((i) => i.id !== item.id));
    toast({ title: 'Item removido', description: item.nome, duration: 5000, action: { label: 'Desfazer', onClick: () => salvarItens(anteriores) } });
  };

  const limparCarrinho = async () => {
    const anteriores = itens;
    await salvarItens(pendentes);
    toast({
      title: `${noCarrinho.length} ${noCarrinho.length === 1 ? 'item saiu' : 'itens saíram'} da lista`,
      description: 'Eles continuam nas sugestões para a próxima compra.',
      duration: 6000,
      action: { label: 'Desfazer', onClick: () => salvarItens(anteriores) },
    });
  };

  const desmarcarTudo = () => salvarItens(itens.map((i) => ({ ...i, feito: false })));

  const excluirLista = async () => {
    const ok = await confirm({
      title: `Excluir a lista "${lista.nome}"?`,
      description: 'Os itens e as sugestões desta lista somem. Não dá para desfazer.',
      confirmLabel: 'Excluir',
      destructive: true,
    });
    if (!ok) return;
    const { id, ...dados } = lista;
    await deleteDoc(doc(db, COL.listas, id));
    onSelecionar(null);
    toast({ title: 'Lista excluída', description: lista.nome, action: { label: 'Desfazer', onClick: () => setDoc(doc(db, COL.listas, id), dados) } });
  };

  const compartilhar = async () => {
    const textoLista = listaComoTexto(lista);
    if (navigator.share) {
      try {
        await navigator.share({ title: lista.nome, text: textoLista });
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(textoLista);
      toast({ title: 'Lista copiada', description: 'Cole onde quiser.', tone: 'success' });
    } catch {
      toast({ title: 'Não foi possível copiar', tone: 'error' });
    }
  };

  const whatsapp = () => window.open(`https://wa.me/?text=${encodeURIComponent(listaComoTexto(lista))}`, '_blank', 'noopener');

  const salvarDialogo = async (e) => {
    e.preventDefault();
    const nome = dialogo.nome.trim();
    if (!nome) return;
    try {
      if (dialogo.modo === 'nova') await criarLista(nome);
      else await updateDoc(doc(db, COL.listas, dialogo.id), { nome, atualizadoEm: Date.now() });
      setDialogo(null);
    } catch {
      toast({ title: 'Não foi possível salvar', tone: 'error' });
    }
  };

  const dialogoNode = (
    <Dialog
      open={!!dialogo}
      onClose={() => setDialogo(null)}
      title={dialogo?.modo === 'renomear' ? 'Renomear lista' : 'Nova lista'}
      description={dialogo?.modo === 'nova' ? 'Nomes com "mercado", "feira" ou "farmácia" já separam os itens por seção.' : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={() => setDialogo(null)}>Cancelar</Button>
          <Button type="submit" form="lista-form">{dialogo?.modo === 'renomear' ? 'Salvar' : 'Criar lista'}</Button>
        </>
      }
    >
      {dialogo && (
        <form id="lista-form" onSubmit={salvarDialogo}>
          <TextField
            label="Nome"
            autoFocus
            placeholder="Mercado, Farmácia, Feira de sábado..."
            value={dialogo.nome}
            onChange={(e) => setDialogo({ ...dialogo, nome: e.target.value })}
            required
          />
        </form>
      )}
    </Dialog>
  );

  if (carregando) return null;

  // Sem nenhuma lista: atalhos para criar as mais comuns
  if (!lista) {
    return (
      <div>
        <EmptyState
          icon={ShoppingCart}
          title="Nenhuma lista ainda"
          description="Crie a lista e vá anotando durante a semana. No mercado, é só tocar em cada item conforme for pegando."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.values(TIPOS_LISTA).map((t) => (
            <button
              key={t.valor}
              onClick={() => (t.valor === 'outra' ? setDialogo({ modo: 'nova', nome: '' }) : criarLista(t.nome, t.valor))}
              className="group flex flex-col items-start gap-3 rounded-xl border border-ink-800 p-4 text-left transition-colors hover:border-ink-600 hover:bg-ink-900"
            >
              <t.icone className="h-5 w-5 text-ink-400 transition-colors group-hover:text-lime" />
              <span className="text-sm font-medium text-ink-50">{t.rotulo}</span>
              <span className="font-mono text-[11px] text-ink-500">{t.exemplo}</span>
            </button>
          ))}
        </div>
        {dialogoNode}
      </div>
    );
  }

  const progresso = itens.length ? Math.round((noCarrinho.length / itens.length) * 100) : 0;
  const grupos = agruparPorSecao(pendentes, lista.tipo);

  return (
    <div>
      {/* Listas */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {ordenadas.map((l) => {
          const T = tipoLista(l.tipo).icone;
          const ativa = l.id === lista.id;
          const faltam = (l.itens || []).filter((i) => !i.feito).length;
          return (
            <button
              key={l.id}
              onClick={() => onSelecionar(l.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors',
                ativa ? 'border-ink-50 bg-ink-50 text-ink-950' : 'border-ink-800 text-ink-300 hover:border-ink-600 hover:text-ink-50'
              )}
            >
              <T className="h-3.5 w-3.5" /> {l.nome}
              <span className={cn('font-mono text-[11px]', ativa ? 'text-ink-600' : 'text-ink-500')}>{faltam}</span>
            </button>
          );
        })}
        <button
          onClick={() => setDialogo({ modo: 'nova', nome: '' })}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-dashed border-ink-700 px-3.5 py-2 text-sm text-ink-400 transition-colors hover:border-ink-500 hover:text-ink-50"
        >
          <Plus className="h-3.5 w-3.5" /> Nova lista
        </button>
      </div>

      {/* Cabeçalho da lista */}
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <button onClick={() => setDialogo({ modo: 'renomear', nome: lista.nome, id: lista.id })} className="group flex items-center gap-2 text-left">
            <h2 className="truncate text-2xl font-medium tracking-tight text-ink-50">{lista.nome}</h2>
            <Pencil className="h-3.5 w-3.5 text-ink-600 transition-colors group-hover:text-ink-200" />
          </button>
          <p className="mt-1 text-sm text-ink-400">
            {itens.length === 0
              ? 'Lista vazia'
              : pendentes.length === 0
                ? 'Tudo no carrinho'
                : `Faltam ${pendentes.length} de ${itens.length}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={whatsapp} disabled={!pendentes.length}>
            <MessageCircle /> WhatsApp
          </Button>
          <Button variant="outline" size="sm" onClick={compartilhar} disabled={!pendentes.length}>
            {typeof navigator !== 'undefined' && navigator.share ? <Share2 /> : <Copy />} {typeof navigator !== 'undefined' && navigator.share ? 'Compartilhar' : 'Copiar'}
          </Button>
          <Button variant="danger" size="sm" onClick={excluirLista} aria-label="Excluir lista">
            <Trash2 />
          </Button>
        </div>
      </div>
      {itens.length > 0 && <Progress className="mt-4" value={progresso} />}

      {/* Adicionar vários itens de uma vez */}
      <form onSubmit={enviar} className="group mt-8">
        <div className="flex items-center gap-3 border-b-2 border-ink-700 pb-3 transition-colors focus-within:border-lime">
          <Plus className="h-5 w-5 shrink-0 text-ink-500 transition-colors group-focus-within:text-lime" />
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={`Adicione: ${tipo.exemplo}`}
            aria-label="Adicionar itens"
            enterKeyHint="done"
            className="min-w-0 flex-1 bg-transparent text-lg text-ink-50 placeholder:text-ink-600 focus:outline-none"
          />
          <Button type="submit" size="icon" disabled={!previa.length} aria-label="Adicionar itens">
            <ArrowUp />
          </Button>
        </div>
        <div className="mt-3 min-h-[28px]">
          <AnimatePresence mode="wait" initial={false}>
            {previa.length > 0 ? (
              <motion.div key="previa" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-ink-500">Vai adicionar:</span>
                {previa.map((p, i) => (
                  <span key={i} className="flex items-center gap-1.5 rounded-full bg-ink-800 px-2.5 py-1 text-ink-50">
                    {p.qtd && <span className="font-mono text-lime">{p.qtd}</span>}
                    {p.nome}
                    {lista.tipo !== 'outra' && <span className="text-ink-500">· {p.secao}</span>}
                  </span>
                ))}
              </motion.div>
            ) : (
              <motion.p key="dica" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-ink-500">
                Separe por vírgula. Quantidade antes do nome: <span className="font-mono text-ink-300">2 leite</span>, <span className="font-mono text-ink-300">1kg de arroz</span>.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Sugestões do que costuma comprar */}
      {sugestoes.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs text-ink-500">Você costuma comprar</p>
          <div className="flex flex-wrap gap-1.5">
            {sugestoes.map((s) => (
              <button
                key={s.nome}
                onClick={() => adicionar([s])}
                className="flex items-center gap-1 rounded-full border border-ink-800 px-2.5 py-1.5 text-xs text-ink-300 transition-colors hover:border-lime/40 hover:text-ink-50"
              >
                <Plus className="h-3 w-3" /> {s.nome}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Itens por seção, na ordem do corredor */}
      <div className="mt-10">
        {itens.length === 0 ? (
          <EmptyState icon={tipo.icone} title="Nada na lista ainda" description="Escreva vários itens de uma vez no campo acima, separados por vírgula." />
        ) : (
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-x-12">
            <div className="flex flex-col gap-8">
              {grupos.map(([secao, lista_]) => (
                <section key={secao}>
                  {lista.tipo !== 'outra' && (
                    <h3 className="flex items-baseline gap-2 border-b border-ink-800 pb-2 text-sm font-medium text-ink-50">
                      {secao} <span className="font-mono text-xs text-ink-500">{lista_.length}</span>
                    </h3>
                  )}
                  <ul>
                    <AnimatePresence initial={false}>
                      {lista_.map((item) => (
                        <Item key={item.id} item={item} onToggle={alternar} onExcluir={excluirItem} />
                      ))}
                    </AnimatePresence>
                  </ul>
                </section>
              ))}
              {pendentes.length === 0 && (
                <EmptyState icon={Check} title="Tudo no carrinho" description="Limpe o carrinho para começar a próxima compra." />
              )}
            </div>

            {noCarrinho.length > 0 && (
              <section>
                <h3 className="flex items-center gap-2 border-b border-ink-800 pb-2 text-sm font-medium text-ink-400">
                  No carrinho <span className="font-mono text-xs text-ink-500">{noCarrinho.length}</span>
                  <span className="ml-auto flex gap-1">
                    <Button variant="ghost" size="sm" onClick={desmarcarTudo}>
                      <RotateCcw /> Desmarcar
                    </Button>
                    <Button variant="outline" size="sm" onClick={limparCarrinho}>
                      <Check /> Limpar carrinho
                    </Button>
                  </span>
                </h3>
                <ul>
                  <AnimatePresence initial={false}>
                    {noCarrinho.map((item) => (
                      <Item key={item.id} item={item} onToggle={alternar} onExcluir={excluirItem} />
                    ))}
                  </AnimatePresence>
                </ul>
              </section>
            )}
          </div>
        )}
      </div>

      {dialogoNode}
    </div>
  );
}
