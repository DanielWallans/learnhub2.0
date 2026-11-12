import { motion } from 'motion/react';
import { categorias } from '@/features/habilidades/lib/constants';

export function RadarChart({ niveis: valores }) {
  const size = 320;
  const center = size / 2;
  const radius = 90;
  const ponto = (i, r) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / categorias.length;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  };
  const poligono = valores.map((v, i) => ponto(i, radius * v).join(',')).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[280px]" role="img" aria-label="Radar de progresso por categoria">
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <polygon
          key={r}
          points={categorias.map((_, i) => ponto(i, radius * r).join(',')).join(' ')}
          fill="none"
          stroke="#26262D"
          strokeWidth="1"
        />
      ))}
      {categorias.map((_, i) => {
        const [x, y] = ponto(i, radius);
        return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#26262D" strokeWidth="1" />;
      })}
      <motion.polygon
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1, points: poligono }}
        transition={{ type: 'spring', stiffness: 80, damping: 16 }}
        style={{ transformOrigin: 'center' }}
        points={poligono}
        fill="rgba(198,244,50,0.14)"
        stroke="#C6F432"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {valores.map((v, i) => {
        const [x, y] = ponto(i, radius * v);
        return <circle key={i} cx={x} cy={y} r="3.5" fill="#C6F432" stroke="#111113" strokeWidth="2" />;
      })}
      {categorias.map((cat, i) => {
        const [x, y] = ponto(i, radius + 22);
        return (
          <text key={cat} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-ink-300" style={{ fontSize: 13 }}>
            {cat}
          </text>
        );
      })}
    </svg>
  );
}
