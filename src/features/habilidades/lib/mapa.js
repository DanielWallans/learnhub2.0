import { useEffect, useState } from 'react';
import { MAPA_FAIXAS, NODE_GAP, NODE_HALF_WIDTH } from '@/features/habilidades/lib/constants';

// Calcula posições em pixels: rótulo da categoria e os nós empilhados logo abaixo,
// alternando um pouco para os lados. A altura de cada faixa cresce com o maior grupo.
export function layoutMapa(skills, largura) {
  const nodes = {};
  const labels = [];
  let topo = 20;
  MAPA_FAIXAS.forEach((faixa) => {
    const maior = Math.max(1, ...faixa.map(({ cat }) => skills.filter((s) => s.categoria === cat).length));
    faixa.forEach(({ cat, x }) => {
      const cx = x * largura;
      labels.push({ cat, x: cx, y: topo });
      skills.filter((s) => s.categoria === cat).forEach((s, i) => {
        const desvio = i === 0 ? 0 : (i % 2 ? 1 : -1) * Math.min(44, largura * 0.05);
        nodes[s.id] = {
          x: Math.max(NODE_HALF_WIDTH, Math.min(largura - NODE_HALF_WIDTH, cx + desvio)),
          y: topo + 34 + i * NODE_GAP
        };
      });
    });
    topo += 54 + maior * NODE_GAP;
  });
  return { nodes, labels, altura: Math.max(340, topo) };
}

// Largura do elemento (callback ref, funciona mesmo se ele aparecer depois)
export function useLargura() {
  const [node, setNode] = useState(null);
  const [largura, setLargura] = useState(600);
  useEffect(() => {
    if (!node) return undefined;
    const ro = new ResizeObserver(([entry]) => setLargura(entry.contentRect.width));
    ro.observe(node);
    return () => ro.disconnect();
  }, [node]);
  return [setNode, largura];
}
