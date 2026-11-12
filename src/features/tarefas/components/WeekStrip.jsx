import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { proximosDias } from '@/features/tarefas/lib/datas';

// Os próximos 7 dias com a quantidade de tarefas pendentes; tocar num dia filtra a lista
export function WeekStrip({ contagem, selecionado, onSelecionar }) {
  const dias = proximosDias(7);

  return (
    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:grid sm:grid-cols-7 sm:overflow-visible">
      {dias.map((d, i) => {
        const ativo = selecionado === d.iso;
        const n = contagem[d.iso] || 0;
        return (
          <button
            key={d.iso}
            onClick={() => onSelecionar(ativo ? null : d.iso)}
            aria-pressed={ativo}
            className={cn(
              'relative flex min-w-[64px] flex-1 flex-col items-center gap-1 rounded-xl px-2 py-3 transition-colors',
              ativo ? 'text-ink-950' : 'text-ink-300 hover:bg-ink-900'
            )}
          >
            {ativo && (
              <motion.span
                layoutId="dia-ativo"
                className="absolute inset-0 rounded-xl bg-ink-50"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className={cn('relative font-mono text-[11px] uppercase tracking-wider', i === 0 && !ativo && 'text-lime')}>
              {d.semana}
            </span>
            <span className="relative text-2xl font-semibold tracking-tight tabular-nums">{d.dia}</span>
            <span className="relative flex h-1.5 items-center gap-1">
              {Array.from({ length: Math.min(n, 3) }, (_, k) => (
                <span key={k} className={cn('h-1.5 w-1.5 rounded-full', ativo ? 'bg-ink-950' : 'bg-lime')} />
              ))}
              {n > 3 && <span className="font-mono text-[10px] leading-none">+{n - 3}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
