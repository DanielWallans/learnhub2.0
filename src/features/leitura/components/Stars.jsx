import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Stars({ value = 0, onChange, size = 'h-4 w-4' }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < value;
        const star = (
          <Star className={cn(size, filled ? 'fill-lime text-lime' : 'text-ink-600')} strokeWidth={1.75} />
        );
        return onChange ? (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1 === value ? 0 : i + 1)}
            className="rounded p-0.5 transition-transform hover:scale-110"
            aria-label={`Avaliar com ${i + 1} de 5`}
          >
            {star}
          </button>
        ) : (
          <span key={i}>{star}</span>
        );
      })}
    </div>
  );
}
