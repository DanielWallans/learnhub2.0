import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CalendarClock,
  Check,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Flag,
  Link2,
  ListChecks,
  NotebookPen,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Target,
  Trash2,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/field';
import { EmptyState, Progress, Segmented } from '@/components/ui/primitives';
import { QuickDelete } from '@/components/ui/quick-delete';
import { brl } from '@/features/financas/lib/constants';
import { useMostrarValores, VALOR_OCULTO } from '@/features/financas/lib/useMostrarValores';
import {
  STATUS,
  area as areaDe,
  atrasado,
  dataCurta,
  diasAte,
  formatarHoras,
  hojeIso,
  novoId,
  prioridade as prioridadeDe,
  progresso,
  rotuloPrazo,
  totalGasto,
  totalHoras,
} from '@/features/projetos/lib/constants';

const ABAS = [
  { value: 'visao', label: 'Visão geral', icon: Target },
  { value: 'etapas', label: 'Etapas', icon: ListChecks },
  { value: 'diario', label: 'Diário', icon: NotebookPen },
  { value: 'links', label: 'Links', icon: Link2 },
  { value: 'orcamento', label: 'Orçamento', icon: Wallet },
];

const linkValido = (url) => {
  const u = url.trim();
  if (!u) return '';
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
};
const host = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

function Numero({ label, valor, detalhe, destaque }) {
  return (
    <div className="border-l border-ink-800 pl-4">
      <p className="text-xs text-ink-400">{label}</p>
      <p className={cn('mt-1.5 font-mono text-xl tracking-tight tabular-nums sm:text-2xl', destaque ? 'text-lime' : 'text-ink-50')}>{valor}</p>
      {detalhe && <p className="mt-1 text-xs text-ink-500">{detalhe}</p>}
    </div>
  );
}

/* ---------------- Etapas ---------------- */

function Etapa({ etapa, primeira, ultima, onAlterar, onMover, onExcluir, onTarefa }) {
  const [editando, setEditando] = useState(false);
  const [titulo, setTitulo] = useState(etapa.titulo);
  const dias = diasAte(etapa.prazo);
  const late = !etapa.feita && dias !== null && dias < 0;

  const salvar = () => {
    setEditando(false);
    const t = titulo.trim();
    if (t && t !== etapa.titulo) onAlterar({ titulo: t });
    else setTitulo(etapa.titulo);
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
      className="group flex items-start gap-3 border-b border-ink-800/70 py-3 last:border-0"
    >
      <button
        onClick={() => onAlterar({ feita: !etapa.feita, feitaEm: etapa.feita ? null : Date.now() })}
        aria-label={etapa.feita ? 'Marcar como pendente' : 'Marcar como feita'}
        className={cn(
          "relative mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 transition-colors before:absolute before:-inset-2.5 before:content-['']",
          etapa.feita ? 'border-lime bg-lime text-ink-950' : 'border-ink-600 hover:border-ink-300'
        )}
      >
        {etapa.feita && <Check className="h-3 w-3" strokeWidth={3.5} />}
      </button>

      <div className="min-w-0 flex-1">
        {editando ? (
          <Input
            autoFocus
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onBlur={salvar}
            onKeyDown={(e) => {
              if (e.key === 'Enter') salvar();
              if (e.key === 'Escape') {
                setTitulo(etapa.titulo);
                setEditando(false);
              }
            }}
            className="h-9 sm:h-9"
          />
        ) : (
          <button onClick={() => setEditando(true)} className="block w-full text-left" title="Clique para editar">
            <span className={cn('text-[15px] leading-snug', etapa.feita ? 'text-ink-500 line-through decoration-ink-600' : 'text-ink-50')}>
              {etapa.titulo}
            </span>
          </button>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
          <label
            className={cn(
              'relative flex cursor-pointer items-center gap-1 rounded-md border px-1.5 py-0.5',
              late ? 'border-ink-50 bg-ink-50 text-ink-950' : etapa.prazo ? 'border-ink-700 text-ink-300' : 'border-dashed border-ink-700 text-ink-500 hover:text-ink-200'
            )}
          >
            <CalendarClock className="h-3 w-3" />
            {etapa.prazo ? (etapa.feita ? dataCurta(etapa.prazo) : rotuloPrazo(etapa.prazo)) : 'Prazo'}
            <input
              type="date"
              value={etapa.prazo || ''}
              onChange={(e) => onAlterar({ prazo: e.target.value })}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Prazo da etapa"
            />
          </label>
          {etapa.tarefaId ? (
            <span className="flex items-center gap-1 text-ink-400">
              <ListChecks className="h-3 w-3" /> Nas suas tarefas
            </span>
          ) : (
            !etapa.feita && (
              <button onClick={onTarefa} className="flex items-center gap-1 text-ink-500 transition-colors hover:text-lime">
                <ListChecks className="h-3 w-3" /> Enviar para Tarefas
              </button>
            )
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100">
        <button onClick={() => onMover(-1)} disabled={primeira} className="rounded p-1.5 text-ink-500 hover:text-ink-50 disabled:opacity-30" aria-label="Subir etapa">
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => onMover(1)} disabled={ultima} className="rounded p-1.5 text-ink-500 hover:text-ink-50 disabled:opacity-30" aria-label="Descer etapa">
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
        <QuickDelete label={`Excluir ${etapa.titulo}`} onClick={onExcluir} className="ml-1" />
      </div>
    </motion.li>
  );
}

/* ---------------- Tela de detalhe ---------------- */

export function ProjectDetail({ projeto, onAtualizar, onEditar, onExcluir, onVoltar, onEnviarTarefa, toast }) {
  const [aba, setAba] = useState('visao');
  const [novaEtapa, setNovaEtapa] = useState('');
  const [ocultarFeitas, setOcultarFeitas] = useState(false);
  const [registro, setRegistro] = useState({ texto: '', horas: '', data: hojeIso() });
  const [link, setLink] = useState({ titulo: '', url: '' });
  const [gasto, setGasto] = useState({ descricao: '', valor: '' });
  const [mostrarValores, alternarValores] = useMostrarValores();

  const A = areaDe(projeto.area);
  const etapas = projeto.etapas || [];
  const diario = useMemo(() => [...(projeto.diario || [])].sort((a, b) => (b.data || '').localeCompare(a.data || '') || b.criadoEm - a.criadoEm), [projeto.diario]);
  const links = projeto.links || [];
  const gastos = projeto.gastos || [];
  const prog = progresso(projeto);
  const feitas = etapas.filter((e) => e.feita).length;
  const horas = totalHoras(projeto);
  const gastoTotal = totalGasto(projeto);
  const previsto = Number(projeto.orcamento) || 0;
  const late = atrasado(projeto);
  const dinheiro = (v) => (mostrarValores ? brl(v) : VALOR_OCULTO);

  const contagem = { etapas: etapas.length ? `${feitas}/${etapas.length}` : undefined, diario: diario.length || undefined, links: links.length || undefined, orcamento: gastos.length || undefined };

  /* Etapas */
  const salvarEtapas = (lista) => onAtualizar({ etapas: lista });
  const adicionarEtapas = (e) => {
    e.preventDefault();
    // Colar várias linhas cria uma etapa por linha
    const titulos = novaEtapa.split('\n').map((t) => t.replace(/^[-*•\d.)\s]+/, '').trim()).filter(Boolean);
    if (!titulos.length) return;
    salvarEtapas([...etapas, ...titulos.map((titulo) => ({ id: novoId(), titulo, feita: false, prazo: '' }))]);
    setNovaEtapa('');
  };
  const alterarEtapa = (id, campos) => {
    const lista = etapas.map((e) => (e.id === id ? { ...e, ...campos } : e));
    // Última etapa marcada: oferece concluir o projeto
    if (campos.feita && lista.every((e) => e.feita) && projeto.status !== 'concluido') {
      toast({
        title: 'Todas as etapas feitas',
        description: 'Quer marcar o projeto como concluído?',
        duration: 8000,
        action: { label: 'Concluir', onClick: () => onAtualizar({ status: 'concluido', concluidoEm: Date.now() }) },
      });
    }
    onAtualizar({ etapas: lista });
  };
  const moverEtapa = (idx, dir) => {
    const lista = [...etapas];
    const [item] = lista.splice(idx, 1);
    lista.splice(idx + dir, 0, item);
    salvarEtapas(lista);
  };
  const excluirEtapa = (etapa) => {
    const anteriores = etapas;
    salvarEtapas(etapas.filter((e) => e.id !== etapa.id));
    toast({ title: 'Etapa excluída', description: etapa.titulo, duration: 5000, action: { label: 'Desfazer', onClick: () => salvarEtapas(anteriores) } });
  };
  const enviarTarefa = async (etapa) => {
    const tarefaId = await onEnviarTarefa(etapa);
    if (tarefaId) alterarEtapa(etapa.id, { tarefaId });
  };

  /* Diário */
  const registrar = (e) => {
    e.preventDefault();
    if (!registro.texto.trim()) return;
    const h = parseFloat(String(registro.horas).replace(',', '.')) || 0;
    onAtualizar({
      diario: [...(projeto.diario || []), { id: novoId(), texto: registro.texto.trim(), horas: h, data: registro.data || hojeIso(), criadoEm: Date.now() }],
    });
    setRegistro({ texto: '', horas: '', data: hojeIso() });
  };
  const excluirRegistro = (r) => {
    const anteriores = projeto.diario || [];
    onAtualizar({ diario: anteriores.filter((x) => x.id !== r.id) });
    toast({ title: 'Registro excluído', duration: 5000, action: { label: 'Desfazer', onClick: () => onAtualizar({ diario: anteriores }) } });
  };

  /* Links */
  const adicionarLink = (e) => {
    e.preventDefault();
    const url = linkValido(link.url);
    if (!url) return;
    onAtualizar({ links: [...links, { id: novoId(), titulo: link.titulo.trim() || host(url), url }] });
    setLink({ titulo: '', url: '' });
  };

  /* Orçamento */
  const adicionarGasto = (e) => {
    e.preventDefault();
    const valor = parseFloat(String(gasto.valor).replace(/\./g, '').replace(',', '.')) || parseFloat(gasto.valor) || 0;
    if (!gasto.descricao.trim() || !valor) return;
    onAtualizar({ gastos: [...gastos, { id: novoId(), descricao: gasto.descricao.trim(), valor, data: hojeIso() }] });
    setGasto({ descricao: '', valor: '' });
  };
  const excluirGasto = (g) => {
    onAtualizar({ gastos: gastos.filter((x) => x.id !== g.id) });
    toast({ title: 'Gasto removido', description: g.descricao, duration: 5000, action: { label: 'Desfazer', onClick: () => onAtualizar({ gastos }) } });
  };

  const etapasVisiveis = ocultarFeitas ? etapas.filter((e) => !e.feita) : etapas;
  const proximas = etapas.filter((e) => !e.feita).slice(0, 4);

  return (
    <div>
      {/* Cabeçalho */}
      <button onClick={onVoltar} className="-ml-1 flex items-center gap-1.5 rounded-md px-1 py-1 text-sm text-ink-400 transition-colors hover:text-ink-50">
        <ArrowLeft className="h-4 w-4" /> Todos os projetos
      </button>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <p className="flex flex-wrap items-center gap-2 text-sm text-ink-400">
            <A.icone className="h-4 w-4" /> {projeto.area}
            {projeto.prioridade === 'alta' && (
              <span className="flex items-center gap-1 text-lime">
                <Flag className="h-3.5 w-3.5 fill-current" /> Prioridade alta
              </span>
            )}
            {projeto.prioridade === 'baixa' && <span className="text-ink-500">· Prioridade {prioridadeDe('baixa').nome.toLowerCase()}</span>}
            {(projeto.tags || []).map((t) => (
              <span key={t} className="rounded-md bg-ink-800 px-1.5 py-0.5 text-xs text-ink-300">#{t}</span>
            ))}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink-50 sm:text-4xl">{projeto.nome}</h2>
          {projeto.descricao && <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-300">{projeto.descricao}</p>}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => onAtualizar({ fixado: !projeto.fixado })}>
            {projeto.fixado ? <PinOff /> : <Pin />} {projeto.fixado ? 'Desafixar' : 'Fixar'}
          </Button>
          <Button variant="outline" size="sm" onClick={onEditar}>
            <Pencil /> Editar
          </Button>
          <Button variant="danger" size="sm" onClick={onExcluir} aria-label="Excluir projeto">
            <Trash2 />
          </Button>
        </div>
      </div>

      {/* Status: um toque muda a coluna do quadro */}
      <div className="-mx-4 mt-6 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <Segmented
          size="sm"
          layoutId={`status-${projeto.id}`}
          value={projeto.status}
          onChange={(v) => onAtualizar({ status: v, concluidoEm: v === 'concluido' ? Date.now() : null })}
          options={STATUS.map((s) => ({ value: s.valor, label: s.curto, icon: s.icone }))}
        />
      </div>

      {/* Progresso */}
      <div className="mt-8">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm text-ink-400">Progresso</span>
          <span className={cn('font-mono text-3xl tracking-tight tabular-nums', prog === 100 ? 'text-lime' : 'text-ink-50')}>{prog}%</span>
        </div>
        <Progress value={prog} className="h-2" />
      </div>

      {/* Abas */}
      <div className="-mx-4 mt-10 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <Segmented
          layoutId="projeto-aba"
          value={aba}
          onChange={setAba}
          options={ABAS.map((a) => ({ ...a, count: contagem[a.value] }))}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={aba} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="mt-8">
          {aba === 'visao' && (
            <div className="flex flex-col gap-10">
              <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4">
                <Numero label="Etapas" valor={`${feitas}/${etapas.length}`} detalhe={etapas.length ? `${etapas.length - feitas} pendentes` : 'nenhuma ainda'} />
                <Numero
                  label="Prazo"
                  valor={projeto.prazo ? dataCurta(projeto.prazo) : '—'}
                  detalhe={projeto.status === 'concluido' ? 'concluído' : projeto.prazo ? rotuloPrazo(projeto.prazo) : 'sem prazo'}
                  destaque={late}
                />
                <Numero label="Tempo dedicado" valor={formatarHoras(horas)} detalhe={`${diario.length} ${diario.length === 1 ? 'registro' : 'registros'} no diário`} />
                <Numero
                  label="Gasto"
                  valor={dinheiro(gastoTotal)}
                  detalhe={previsto ? `de ${dinheiro(previsto)} previstos` : 'sem orçamento'}
                  destaque={previsto > 0 && gastoTotal > previsto}
                />
              </div>

              <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
                <section>
                  <h3 className="flex items-center gap-2 border-b border-ink-800 pb-2 text-sm font-medium text-ink-50">
                    <Target className="h-4 w-4 text-ink-400" /> Objetivo
                  </h3>
                  {projeto.objetivo ? (
                    <p className="mt-3 text-[15px] leading-relaxed text-ink-100">{projeto.objetivo}</p>
                  ) : (
                    <button onClick={onEditar} className="mt-3 text-sm text-ink-500 underline-offset-4 hover:text-ink-100 hover:underline">
                      Defina como saber que o projeto terminou
                    </button>
                  )}
                  <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-ink-500">Início</dt>
                      <dd className="mt-0.5 text-ink-200">{projeto.dataInicio ? dataCurta(projeto.dataInicio) : '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ink-500">Status</dt>
                      <dd className="mt-0.5 text-ink-200">{STATUS.find((s) => s.valor === projeto.status)?.curto}</dd>
                    </div>
                  </dl>
                </section>

                <section>
                  <h3 className="flex items-center gap-2 border-b border-ink-800 pb-2 text-sm font-medium text-ink-50">
                    <ListChecks className="h-4 w-4 text-ink-400" /> Próximas etapas
                    <button onClick={() => setAba('etapas')} className="ml-auto text-xs font-normal text-ink-500 hover:text-ink-100">
                      Ver todas
                    </button>
                  </h3>
                  {proximas.length ? (
                    <ul>
                      {proximas.map((e) => (
                        <li key={e.id} className="flex items-center gap-3 border-b border-ink-800/70 py-2.5 last:border-0">
                          <button
                            onClick={() => alterarEtapa(e.id, { feita: true, feitaEm: Date.now() })}
                            className="h-[18px] w-[18px] shrink-0 rounded-md border-2 border-ink-600 transition-colors hover:border-lime"
                            aria-label={`Marcar ${e.titulo} como feita`}
                          />
                          <span className="min-w-0 flex-1 truncate text-sm text-ink-100">{e.titulo}</span>
                          {e.prazo && <span className="shrink-0 font-mono text-[11px] text-ink-500">{rotuloPrazo(e.prazo)}</span>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-ink-500">{etapas.length ? 'Todas as etapas foram feitas.' : 'Divida o projeto em etapas na aba Etapas.'}</p>
                  )}
                </section>
              </div>

              {diario[0] && (
                <section>
                  <h3 className="flex items-center gap-2 border-b border-ink-800 pb-2 text-sm font-medium text-ink-50">
                    <NotebookPen className="h-4 w-4 text-ink-400" /> Último registro
                    <span className="ml-auto font-mono text-xs font-normal text-ink-500">{dataCurta(diario[0].data)}</span>
                  </h3>
                  <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-200">{diario[0].texto}</p>
                </section>
              )}
            </div>
          )}

          {aba === 'etapas' && (
            <div className="max-w-3xl">
              <form onSubmit={adicionarEtapas} className="group">
                <div className="flex items-start gap-3 border-b-2 border-ink-700 pb-3 transition-colors focus-within:border-lime">
                  <Plus className="mt-1 h-5 w-5 shrink-0 text-ink-500 transition-colors group-focus-within:text-lime" />
                  <textarea
                    rows={1}
                    value={novaEtapa}
                    onChange={(e) => setNovaEtapa(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) adicionarEtapas(e);
                    }}
                    placeholder="Nova etapa. Cole uma lista para criar várias de uma vez"
                    aria-label="Nova etapa"
                    className="min-h-[28px] min-w-0 flex-1 resize-none bg-transparent text-lg text-ink-50 placeholder:text-ink-600 focus:outline-none"
                  />
                  <Button type="submit" size="icon" disabled={!novaEtapa.trim()} aria-label="Adicionar etapa">
                    <ArrowUp />
                  </Button>
                </div>
              </form>

              {etapas.length > 0 && (
                <div className="mt-6 flex items-center justify-between text-xs text-ink-500">
                  <span>
                    {feitas} de {etapas.length} feitas
                  </span>
                  {feitas > 0 && (
                    <button onClick={() => setOcultarFeitas((v) => !v)} className="flex items-center gap-1.5 hover:text-ink-100">
                      {ocultarFeitas ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      {ocultarFeitas ? 'Mostrar feitas' : 'Ocultar feitas'}
                    </button>
                  )}
                </div>
              )}

              {etapas.length === 0 ? (
                <EmptyState icon={ListChecks} title="Nenhuma etapa ainda" description="Quebre o projeto em passos pequenos. Cada etapa marcada aumenta o progresso." />
              ) : (
                <ul className="mt-2">
                  <AnimatePresence initial={false}>
                    {etapasVisiveis.map((e) => {
                      const idx = etapas.findIndex((x) => x.id === e.id);
                      return (
                        <Etapa
                          key={e.id}
                          etapa={e}
                          primeira={idx === 0}
                          ultima={idx === etapas.length - 1}
                          onAlterar={(campos) => alterarEtapa(e.id, campos)}
                          onMover={(dir) => moverEtapa(idx, dir)}
                          onExcluir={() => excluirEtapa(e)}
                          onTarefa={() => enviarTarefa(e)}
                        />
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          )}

          {aba === 'diario' && (
            <div className="max-w-3xl">
              <form onSubmit={registrar} className="rounded-xl border border-ink-800 p-4">
                <Textarea
                  rows={3}
                  placeholder="O que você fez, decidiu ou aprendeu hoje no projeto"
                  value={registro.texto}
                  onChange={(e) => setRegistro({ ...registro, texto: e.target.value })}
                  className="border-0 bg-transparent px-0 focus:ring-0"
                />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Input
                    type="date"
                    value={registro.data}
                    onChange={(e) => setRegistro({ ...registro, data: e.target.value })}
                    className="w-auto"
                    aria-label="Data do registro"
                  />
                  <Input
                    inputMode="decimal"
                    placeholder="Horas"
                    title="Horas dedicadas (ex.: 1,5)"
                    value={registro.horas}
                    onChange={(e) => setRegistro({ ...registro, horas: e.target.value })}
                    className="w-36"
                    icon={Clock}
                    aria-label="Horas dedicadas"
                  />
                  <Button type="submit" className="ml-auto" disabled={!registro.texto.trim()}>
                    <Plus /> Registrar
                  </Button>
                </div>
              </form>

              {horas > 0 && (
                <p className="mt-6 text-sm text-ink-400">
                  <span className="font-mono text-ink-50">{formatarHoras(horas)}</span> dedicadas no total
                </p>
              )}

              {diario.length === 0 ? (
                <EmptyState icon={NotebookPen} title="Diário vazio" description="Anote o que foi feito a cada sessão. Fica fácil retomar depois de uma pausa e ver quanto tempo o projeto levou." />
              ) : (
                <ol className="mt-6 border-l border-ink-800">
                  <AnimatePresence initial={false}>
                    {diario.map((r) => (
                      <motion.li
                        key={r.id}
                        layout
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 24 }}
                        className="group relative pb-6 pl-6 last:pb-0"
                      >
                        <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-ink-950 bg-ink-500 group-first:bg-lime" />
                        <div className="flex items-center gap-3 text-xs text-ink-500">
                          <span className="font-mono">{dataCurta(r.data)}</span>
                          {r.horas > 0 && (
                            <span className="flex items-center gap-1 font-mono text-ink-300">
                              <Clock className="h-3 w-3" /> {formatarHoras(r.horas)}
                            </span>
                          )}
                          <QuickDelete label="Excluir registro" onClick={() => excluirRegistro(r)} className="ml-auto" />
                        </div>
                        <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-100">{r.texto}</p>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ol>
              )}
            </div>
          )}

          {aba === 'links' && (
            <div className="max-w-3xl">
              <form onSubmit={adicionarLink} className="flex flex-col gap-2 sm:flex-row">
                <Input placeholder="https://..." value={link.url} onChange={(e) => setLink({ ...link, url: e.target.value })} className="sm:flex-[2]" aria-label="Endereço" />
                <Input placeholder="Nome (opcional)" value={link.titulo} onChange={(e) => setLink({ ...link, titulo: e.target.value })} className="sm:flex-1" aria-label="Nome do link" />
                <Button type="submit" disabled={!link.url.trim()}>
                  <Plus /> Adicionar
                </Button>
              </form>
              <p className="mt-2 text-xs text-ink-500">Repositório, design no Figma, pasta no Drive, documento, referência, loja...</p>

              {links.length === 0 ? (
                <EmptyState icon={Link2} title="Nenhum link" description="Guarde aqui tudo que você precisa abrir para trabalhar no projeto." />
              ) : (
                <ul className="mt-6">
                  {links.map((l) => (
                    <li key={l.id} className="group flex items-center gap-3 border-b border-ink-800/70 last:border-0">
                      <a href={l.url} target="_blank" rel="noreferrer" className="flex min-w-0 flex-1 items-center gap-3 py-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink-800 text-ink-400 transition-colors group-hover:border-lime/40 group-hover:text-lime">
                          <Link2 className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-ink-50">{l.titulo}</span>
                          <span className="block truncate font-mono text-[11px] text-ink-500">{host(l.url)}</span>
                        </span>
                        <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-ink-600 group-hover:text-ink-200" />
                      </a>
                      <QuickDelete label={`Remover ${l.titulo}`} onClick={() => onAtualizar({ links: links.filter((x) => x.id !== l.id) })} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {aba === 'orcamento' && (
            <div className="max-w-3xl">
              <div className="flex items-start justify-between gap-4">
                <div className="grid flex-1 grid-cols-2 gap-y-6 sm:grid-cols-3">
                  <Numero label="Previsto" valor={previsto ? dinheiro(previsto) : '—'} />
                  <Numero label="Gasto" valor={dinheiro(gastoTotal)} destaque={previsto > 0 && gastoTotal > previsto} />
                  {previsto > 0 && (
                    <Numero
                      label={gastoTotal > previsto ? 'Acima do previsto' : 'Restante'}
                      valor={dinheiro(Math.abs(previsto - gastoTotal))}
                      detalhe={`${Math.round((gastoTotal / previsto) * 100)}% usado`}
                    />
                  )}
                </div>
                <button
                  onClick={alternarValores}
                  className="rounded p-2 text-ink-400 transition-colors hover:text-ink-50"
                  aria-label={mostrarValores ? 'Ocultar valores' : 'Mostrar valores'}
                >
                  {mostrarValores ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {previsto > 0 && <Progress className="mt-6" value={(gastoTotal / previsto) * 100} tone={gastoTotal > previsto ? 'neutral' : 'accent'} />}
              {!previsto && (
                <button onClick={onEditar} className="mt-4 text-sm text-ink-500 underline-offset-4 hover:text-ink-100 hover:underline">
                  Definir o orçamento previsto
                </button>
              )}

              <form onSubmit={adicionarGasto} className="mt-8 flex flex-col gap-2 sm:flex-row">
                <Input placeholder="Com o que gastou" value={gasto.descricao} onChange={(e) => setGasto({ ...gasto, descricao: e.target.value })} className="sm:flex-[2]" aria-label="Descrição do gasto" />
                <Input inputMode="decimal" placeholder="Valor (R$)" value={gasto.valor} onChange={(e) => setGasto({ ...gasto, valor: e.target.value })} className="sm:w-36" aria-label="Valor" />
                <Button type="submit" disabled={!gasto.descricao.trim() || !gasto.valor}>
                  <Plus /> Adicionar
                </Button>
              </form>

              {gastos.length === 0 ? (
                <EmptyState icon={Wallet} title="Nenhum gasto" description="Registre o que for gastando: material, curso, domínio, fornecedor. O total aparece na visão geral." />
              ) : (
                <ul className="mt-6">
                  {[...gastos].reverse().map((g) => (
                    <li key={g.id} className="group flex items-center gap-3 border-b border-ink-800/70 py-3 last:border-0">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-ink-50">{g.descricao}</p>
                        <p className="text-xs text-ink-500">{dataCurta(g.data)}</p>
                      </div>
                      <span className="font-mono text-sm tabular-nums text-ink-200">{dinheiro(g.valor)}</span>
                      <QuickDelete label={`Remover ${g.descricao}`} onClick={() => excluirGasto(g)} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
