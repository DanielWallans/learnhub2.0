import { AnimatePresence, motion } from 'motion/react';
import { Check, Clock, FileText, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuickDelete } from '@/components/ui/quick-delete';
import { categoria } from '@/features/tarefas/lib/constants';
import { hojeIso, rotuloData } from '@/features/tarefas/lib/datas';

// Uma tarefa da lista: marcar como feita, destacar, abrir para editar e excluir
export function TaskItem({ tarefa, mostrarData, onToggle, onImportante, onEditar, onExcluir }) {
  const cat = categoria(tarefa.categoria);
  const Icone = cat.icone;
  const feita = !!tarefa.concluida;
  const atrasada = !feita && tarefa.data && tarefa.data < hojeIso();

  return (
    <motion.li
      layout
      layoutId={`tarefa-${tarefa.id}`}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
      className="group flex items-start gap-3 border-b border-ink-800/70 py-3 last:border-0"
    >
      <button
        onClick={() => onToggle(tarefa)}
        aria-label={feita ? 'Marcar como pendente' : 'Marcar como feita'}
        className={cn(
          "relative mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-colors before:absolute before:-inset-2.5 before:content-['']",
          feita ? 'border-lime bg-lime text-ink-950' : 'border-ink-600 hover:border-ink-300'
        )}
      >
        <AnimatePresence>
          {feita && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 600, damping: 22 }}>
              <Check className="h-3 w-3" strokeWidth={3.5} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <button onClick={() => onEditar(tarefa)} className="min-w-0 flex-1 text-left">
        <p
          className={cn(
            'text-[15px] leading-snug transition-colors',
            feita ? 'text-ink-500 line-through decoration-ink-600' : 'text-ink-50'
          )}
        >
          {tarefa.titulo}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
          {mostrarData && tarefa.data && (
            <span className={cn(atrasada ? 'font-medium text-ink-50' : '')}>
              {atrasada ? `Atrasada · ${rotuloData(tarefa.data)}` : rotuloData(tarefa.data)}
            </span>
          )}
          {tarefa.hora && (
            <span className="flex items-center gap-1 font-mono text-ink-300">
              <Clock className="h-3 w-3" /> {tarefa.hora}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Icone className="h-3 w-3" /> {cat.valor}
          </span>
          {tarefa.notas && <FileText className="h-3 w-3" aria-label="Tem anotações" />}
        </p>
      </button>

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={() => onImportante(tarefa)}
          aria-label={tarefa.importante ? 'Tirar destaque' : 'Marcar como importante'}
          className={cn(
            "relative rounded-md p-1.5 transition before:absolute before:-inset-1 before:content-['']",
            tarefa.importante
              ? 'text-lime'
              : 'text-ink-600 opacity-0 hover:text-ink-200 group-hover:opacity-100 [@media(hover:none)]:opacity-100'
          )}
        >
          <Star className={cn('h-4 w-4', tarefa.importante && 'fill-current')} />
        </button>
        <QuickDelete label={`Excluir ${tarefa.titulo}`} onClick={() => onExcluir(tarefa)} />
      </div>
    </motion.li>
  );
}
