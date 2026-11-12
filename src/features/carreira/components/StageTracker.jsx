import { motion } from 'motion/react';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FLOW_STAGES, STAGES_ORDER } from '@/features/carreira/lib/constants';

export function StageTracker({ fase, onChange }) {
  const reprovado = fase === 'reprovado';
  const currentIndex = reprovado ? 2 : STAGES_ORDER.indexOf(fase);

  return (
    <div>
      <ol className="relative grid grid-cols-4 gap-2">
        <div className="absolute left-[12.5%] right-[12.5%] top-5 h-px bg-ink-700" />
        <motion.div
          className={cn('absolute left-[12.5%] top-5 h-px origin-left', reprovado ? 'bg-ink-400' : 'bg-lime')}
          initial={false}
          animate={{ width: `${(Math.max(0, currentIndex) / 3) * 75}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 22 }}
        />
        {FLOW_STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const ativo = !reprovado && fase === stage.key;
          const feito = i < currentIndex || (reprovado && i <= 2);
          return (
            <li key={stage.key} className="relative flex flex-col items-center text-center">
              <motion.button
                onClick={() => onChange(stage.key)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border transition-colors',
                  ativo
                    ? 'border-lime bg-lime text-ink-950 shadow-[0_0_0_6px_rgba(198,244,50,0.12)]'
                    : feito
                      ? 'border-ink-50 bg-ink-50 text-ink-950'
                      : 'border-ink-700 bg-ink-900 text-ink-400 hover:border-ink-500'
                )}
                aria-label={`Mudar para ${stage.title}`}
              >
                {feito && !ativo ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </motion.button>
              <span className={cn('mt-2 text-xs font-medium', ativo ? 'text-ink-50' : 'text-ink-400')}>{stage.title}</span>
              <span className="mt-0.5 hidden text-[11px] leading-tight text-ink-500 md:block">{stage.desc}</span>
            </li>
          );
        })}
      </ol>
      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="text-xs text-ink-400">
          {reprovado ? 'Processo encerrado.' : 'Não deu certo ou ficou parado?'}
        </span>
        <Button variant={reprovado ? 'secondary' : 'ghost'} size="sm" onClick={() => onChange(reprovado ? 'enviado' : 'reprovado')}>
          {reprovado ? 'Reabrir processo' : <><X /> Não passei</>}
        </Button>
      </div>
    </div>
  );
}
