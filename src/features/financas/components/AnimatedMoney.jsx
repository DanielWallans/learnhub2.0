import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { brl } from '@/features/financas/lib/constants';

// Número que "rola" até o valor novo
export function AnimatedMoney({ value, className }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const start = fromRef.current;
    const end = parseFloat(value) || 0;
    if (start === end) return undefined;
    let raf;
    let t0;
    const step = (t) => {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / 700, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = start + (end - start) * eased;
      setDisplay(current);
      fromRef.current = current;
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span className={cn('tabular-nums', className)}>{brl(display)}</span>;
}
