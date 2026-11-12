import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { brl } from '@/features/financas/lib/constants';

// Barras de entradas x saídas dos últimos 6 meses
export function CashflowChart({ data }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(...data.flatMap((d) => [d.entradas, d.saidas]), 1);
  const current = data[data.length - 1];

  return (
    <div>
      <div className="flex items-center gap-4 text-xs text-ink-300">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-lime" /> Entradas</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-ink-400" /> Saídas</span>
      </div>

      <div className="relative mt-6 flex h-48 items-end gap-3 border-b border-ink-700 sm:gap-6">
        {[0.25, 0.5, 0.75].map((g) => (
          <div key={g} className="pointer-events-none absolute inset-x-0 border-t border-dashed border-ink-800" style={{ bottom: `${g * 100}%` }} />
        ))}
        {data.map((d, i) => {
          const isCurrent = i === data.length - 1;
          return (
            <div
              key={d.key}
              className="relative flex h-full flex-1 cursor-default items-end justify-center gap-[2px]"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <motion.div
                className="w-full max-w-[18px] rounded-t bg-lime"
                initial={{ height: 0 }}
                animate={{ height: `${(d.entradas / max) * 100}%` }}
                transition={{ type: 'spring', stiffness: 90, damping: 18, delay: i * 0.04 }}
                style={{ opacity: hover === null || hover === i ? 1 : 0.35 }}
              />
              <motion.div
                className="w-full max-w-[18px] rounded-t bg-ink-400"
                initial={{ height: 0 }}
                animate={{ height: `${(d.saidas / max) * 100}%` }}
                transition={{ type: 'spring', stiffness: 90, damping: 18, delay: i * 0.04 + 0.02 }}
                style={{ opacity: hover === null || hover === i ? 1 : 0.35 }}
              />
              {isCurrent && hover === null && (d.entradas > 0 || d.saidas > 0) && (
                <span className="absolute -top-6 whitespace-nowrap font-mono text-[11px] text-ink-200">
                  {brl(d.entradas - d.saidas)}
                </span>
              )}
              <AnimatePresence>
                {hover === i && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute bottom-full z-10 mb-2 w-40 rounded-lg border border-ink-700 bg-ink-850 p-2.5 text-xs shadow-xl"
                  >
                    <p className="mb-1.5 text-ink-400">{d.label}</p>
                    <p className="flex justify-between text-ink-200"><span>Entradas</span><span className="font-mono text-ink-50">{brl(d.entradas)}</span></p>
                    <p className="flex justify-between text-ink-200"><span>Saídas</span><span className="font-mono text-ink-50">{brl(d.saidas)}</span></p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-3 sm:gap-6">
        {data.map((d, i) => (
          <span key={d.key} className={cn('flex-1 text-center font-mono text-[11px]', i === data.length - 1 ? 'text-ink-50' : 'text-ink-500')}>
            {d.short}
          </span>
        ))}
      </div>

      <table className="sr-only">
        <caption>Entradas e saídas por mês</caption>
        <thead><tr><th>Mês</th><th>Entradas</th><th>Saídas</th></tr></thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}><td>{d.label}</td><td>{brl(d.entradas)}</td><td>{brl(d.saidas)}</td></tr>
          ))}
        </tbody>
      </table>
      {current && (current.entradas === 0 && current.saidas === 0) && (
        <p className="mt-4 text-xs text-ink-500">Nenhum lançamento neste mês ainda.</p>
      )}
    </div>
  );
}
