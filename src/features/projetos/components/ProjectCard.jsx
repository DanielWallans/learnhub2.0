import { motion } from 'motion/react';
import { CalendarClock, Flag, ListChecks, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { area, atrasado, diasAte, progresso, proximaEtapa, rotuloPrazo, status } from '@/features/projetos/lib/constants';

// Card de um projeto no quadro (arrastável no computador) ou na lista
export function ProjectCard({ projeto, onAbrir, arrastavel, onArrastar, compacto }) {
  const A = area(projeto.area);
  const S = status(projeto.status);
  const prog = progresso(projeto);
  const etapas = projeto.etapas || [];
  const feitas = etapas.filter((e) => e.feita).length;
  const proxima = proximaEtapa(projeto);
  const late = atrasado(projeto);
  const dias = diasAte(projeto.prazo);
  const urgente = !late && dias !== null && dias <= 3 && projeto.status !== 'concluido';

  return (
    <motion.div
      layout
      layoutId={`projeto-${projeto.id}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
    >
      <button
        type="button"
        onClick={() => onAbrir(projeto)}
        draggable={arrastavel}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/projeto', projeto.id);
          e.dataTransfer.effectAllowed = 'move';
          onArrastar?.(projeto.id);
        }}
        onDragEnd={() => onArrastar?.(null)}
        className={cn(
          'group block w-full rounded-xl border bg-ink-900 p-4 text-left transition-colors hover:border-ink-600 hover:bg-ink-850 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime/60',
          projeto.status === 'concluido' ? 'border-ink-800/60' : 'border-ink-800',
          arrastavel && 'cursor-grab active:cursor-grabbing'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-ink-400">
            <A.icone className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{projeto.area}</span>
            {compacto && (
              <>
                <span className="text-ink-700">·</span>
                <S.icone className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{S.curto}</span>
              </>
            )}
          </span>
          <span className="flex shrink-0 items-center gap-1.5">
            {projeto.prioridade === 'alta' && projeto.status !== 'concluido' && (
              <Flag className="h-3.5 w-3.5 fill-lime text-lime" aria-label="Prioridade alta" />
            )}
            {projeto.fixado && <Pin className="h-3.5 w-3.5 fill-ink-200 text-ink-200" aria-label="Fixado" />}
          </span>
        </div>

        <p className={cn('mt-2.5 line-clamp-2 text-[15px] font-medium leading-snug', projeto.status === 'concluido' ? 'text-ink-300' : 'text-ink-50')}>
          {projeto.nome}
        </p>
        {projeto.descricao && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-500">{projeto.descricao}</p>}

        {etapas.length > 0 && (
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] text-ink-400">
              <span className="flex items-center gap-1">
                <ListChecks className="h-3 w-3" /> {feitas}/{etapas.length}
              </span>
              <span className={prog === 100 ? 'text-lime' : 'text-ink-200'}>{prog}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-ink-800">
              <div className="h-full rounded-full bg-lime transition-[width] duration-500" style={{ width: `${prog}%` }} />
            </div>
          </div>
        )}

        {proxima && projeto.status !== 'concluido' && (
          <p className="mt-3 truncate text-xs text-ink-300">
            <span className="text-ink-500">Próximo: </span>
            {proxima.titulo}
          </p>
        )}

        {(projeto.prazo || (projeto.tags || []).length > 0) && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {projeto.prazo && projeto.status !== 'concluido' && (
              <span
                className={cn(
                  'flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px]',
                  late ? 'border-ink-50 bg-ink-50 text-ink-950' : urgente ? 'border-lime/40 text-lime' : 'border-ink-700 text-ink-300'
                )}
              >
                <CalendarClock className="h-3 w-3" /> {rotuloPrazo(projeto.prazo)}
              </span>
            )}
            {(projeto.tags || []).slice(0, 3).map((t) => (
              <span key={t} className="rounded-md bg-ink-800 px-1.5 py-0.5 text-[11px] text-ink-300">
                #{t}
              </span>
            ))}
          </div>
        )}
      </button>
    </motion.div>
  );
}
