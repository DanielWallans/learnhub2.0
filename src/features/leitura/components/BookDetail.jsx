import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Pencil, X, Plus, Clock, ExternalLink, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { Badge, Progress } from '@/components/ui/primitives';
import { statusLeitura, statusTone, calcularProgresso } from '@/features/leitura/lib/constants';
import { Cover } from '@/features/leitura/components/BookCover';
import { Stars } from '@/features/leitura/components/Stars';
import { lojasParaLivro, nomeDaLoja } from '@/features/leitura/lib/busca';

export function BookDetail({ livro, onProgresso, onCapitulo, onStatus, onAvaliar, onSalvarAnotacao, onApagarAnotacao, onEditar, onRemover, onCapaEncontrada }) {
  const [texto, setTexto] = useState('');
  const [capitulo, setCapitulo] = useState('');
  const [pagina, setPagina] = useState('');
  const prog = calcularProgresso(livro);
  const lojas = livro.tipo && livro.tipo !== 'Livro' && !livro.linkCompra ? [] : lojasParaLivro(livro);
  const lojaSalva = nomeDaLoja(livro.linkCompra);

  const submit = async (e) => {
    e.preventDefault();
    const ok = await onSalvarAnotacao({ texto, capitulo, pagina });
    if (ok) {
      setTexto('');
      setCapitulo('');
      setPagina('');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4">
        <div className="h-36 w-24 shrink-0 overflow-hidden rounded-md shadow-[0_20px_40px_-12px_rgba(0,0,0,0.9)] ring-1 ring-ink-700">
          <Cover livro={livro} onCapaEncontrada={onCapaEncontrada} />
        </div>
        <div className="min-w-0 flex-1">
          <Badge tone={statusTone[livro.status] || 'default'}>{livro.status}</Badge>
          <h2 className="mt-2 text-lg font-medium leading-snug tracking-tight text-ink-50">{livro.titulo}</h2>
          <p className="mt-1 text-sm text-ink-400">{livro.autor || 'Autor desconhecido'}</p>
          <div className="mt-3">
            <Stars value={livro.avaliacao || 0} onChange={(n) => onAvaliar(livro.id, n)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3">
        {[
          { label: 'Páginas', value: livro.paginasTotal || 0 },
          { label: 'Lido', value: `${prog}%` },
          { label: 'Anotações', value: (livro.anotacoes || []).length }
        ].map((s) => (
          <div key={s.label} className="border-l border-ink-800 pl-3">
            <p className="font-mono text-2xl tracking-tight text-ink-50 tabular-nums">{s.value}</p>
            <p className="text-xs text-ink-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-2 flex justify-between text-xs text-ink-400">
          <span>
            {livro.paginasLidas || 0} de {livro.paginasTotal || 0} páginas
          </span>
          <span className="font-mono text-ink-200">{prog}%</span>
        </div>
        <Progress value={prog} />
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Field label="Página">
            <Input
              type="number"
              min="0"
              max={livro.paginasTotal}
              value={livro.paginasLidas}
              onChange={(e) => onProgresso(livro.id, parseInt(e.target.value) || 0)}
            />
          </Field>
          <Field label="Capítulo">
            <Input
              placeholder="Cap. 4"
              value={livro.capituloAtual || ''}
              onChange={(e) => onCapitulo(livro.id, e.target.value)}
            />
          </Field>
          <Field label="Status">
            <Select value={livro.status} onChange={(e) => onStatus(livro.id, e.target.value)}>
              {statusLeitura.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>
        </div>
      </div>

      {livro.descricao && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-ink-50">Descrição</h3>
          <p className="line-clamp-6 text-sm leading-relaxed text-ink-400">{livro.descricao}</p>
        </div>
      )}

      {lojas.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink-50">
            <ShoppingBag className="h-4 w-4 text-ink-400" /> Onde comprar
          </h3>
          <div className="flex flex-wrap gap-2">
            {livro.linkCompra && (
              <a
                href={livro.linkCompra}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-lime px-3 text-xs font-medium text-ink-950 transition-colors hover:bg-[#D4FF4A] [@media(pointer:coarse)]:h-10"
              >
                <ExternalLink className="h-3.5 w-3.5" /> {lojaSalva ? `Abrir na ${lojaSalva}` : 'Abrir meu link'}
              </a>
            )}
            {lojas
              .filter((l) => !livro.linkCompra || l.nome !== lojaSalva)
              .map((l) => (
                <a
                  key={l.nome}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-ink-700 px-3 text-xs text-ink-100 transition-colors hover:border-ink-500 hover:bg-ink-850 [@media(pointer:coarse)]:h-10"
                >
                  {l.nome} <ExternalLink className="h-3 w-3 text-ink-500" />
                </a>
              ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-medium text-ink-50">Anotações e resumos</h3>
        <form onSubmit={submit} className="flex flex-col gap-2">
          <Textarea
            rows={3}
            placeholder="Um resumo, uma citação ou uma ideia sobre o livro"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <Input placeholder="Capítulo" value={capitulo} onChange={(e) => setCapitulo(e.target.value)} />
            <Input type="number" placeholder="Pág." className="w-24" value={pagina} onChange={(e) => setPagina(e.target.value)} />
            <Button type="submit" size="md" variant="secondary">
              <Plus /> Salvar
            </Button>
          </div>
        </form>

        <div className="mt-3 flex flex-col gap-2">
          {(!livro.anotacoes || livro.anotacoes.length === 0) ? (
            <p className="py-4 text-center text-sm text-ink-500">Nenhuma anotação ainda.</p>
          ) : (
            <AnimatePresence initial={false}>
              {livro.anotacoes.map((anot) => (
                <motion.div
                  key={anot.id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  className="group border-l-2 border-ink-700 py-1 pl-4 transition-colors hover:border-lime"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                      {anot.capitulo && <Badge>Cap. {anot.capitulo}</Badge>}
                      {anot.pagina > 0 && <Badge tone="muted">pág. {anot.pagina}</Badge>}
                    </div>
                    <button
                      onClick={() => onApagarAnotacao(anot.id)}
                      className="rounded p-1 text-ink-500 opacity-0 transition hover:text-ink-50 group-hover:opacity-100 [@media(hover:none)]:opacity-100 [@media(pointer:coarse)]:p-2.5"
                      aria-label="Apagar anotação"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-200">{anot.texto}</p>
                  <p className="mt-2 flex items-center gap-1 font-mono text-[11px] text-ink-500">
                    <Clock className="h-3 w-3" /> {new Date(anot.data).toLocaleDateString('pt-BR')}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-ink-800 pt-4">
        <Button variant="outline" size="sm" onClick={() => onEditar(livro)}>
          <Pencil /> Editar
        </Button>
        <Button variant="danger" size="sm" className="ml-auto" onClick={() => onRemover(livro.id)}>
          <Trash2 /> Remover
        </Button>
      </div>
    </div>
  );
}
