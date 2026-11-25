import {
  Briefcase,
  CalendarDays,
  CircleCheck,
  CirclePause,
  CirclePlay,
  Code,
  Folder,
  GraduationCap,
  HeartPulse,
  House,
  Lightbulb,
  Palette,
  PencilRuler,
  TrendingUp,
  User,
} from 'lucide-react';

// Projetos de qualquer área: estudo, trabalho, casa, evento, negócio, criação...

export const AREAS = [
  { valor: 'Estudos', icone: GraduationCap },
  { valor: 'Trabalho', icone: Briefcase },
  { valor: 'Tecnologia', icone: Code },
  { valor: 'Criativo', icone: Palette },
  { valor: 'Negócios', icone: TrendingUp },
  { valor: 'Pessoal', icone: User },
  { valor: 'Casa', icone: House },
  { valor: 'Saúde', icone: HeartPulse },
  { valor: 'Eventos', icone: CalendarDays },
  { valor: 'Outro', icone: Folder },
];
export const area = (valor) => AREAS.find((a) => a.valor === valor) || AREAS[AREAS.length - 1];

// Colunas do quadro, na ordem da vida de um projeto
export const STATUS = [
  { valor: 'ideia', nome: 'Ideias', curto: 'Ideia', icone: Lightbulb },
  { valor: 'planejando', nome: 'Planejando', curto: 'Planejando', icone: PencilRuler },
  { valor: 'andamento', nome: 'Em andamento', curto: 'Em andamento', icone: CirclePlay },
  { valor: 'pausado', nome: 'Pausados', curto: 'Pausado', icone: CirclePause },
  { valor: 'concluido', nome: 'Concluídos', curto: 'Concluído', icone: CircleCheck },
];
export const status = (valor) => STATUS.find((s) => s.valor === valor) || STATUS[0];

export const PRIORIDADES = [
  { valor: 'baixa', nome: 'Baixa' },
  { valor: 'media', nome: 'Média' },
  { valor: 'alta', nome: 'Alta' },
];
export const prioridade = (valor) => PRIORIDADES.find((p) => p.valor === valor) || PRIORIDADES[1];

export const novoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const PROJETO_VAZIO = {
  nome: '',
  descricao: '',
  objetivo: '',
  area: 'Outro',
  status: 'planejando',
  prioridade: 'media',
  dataInicio: '',
  prazo: '',
  tags: [],
  fixado: false,
  etapas: [],
  diario: [],
  links: [],
  orcamento: 0,
  gastos: [],
};

/* ---------------- Cálculos ---------------- */

export function progresso(projeto) {
  const etapas = projeto.etapas || [];
  if (!etapas.length) return projeto.status === 'concluido' ? 100 : 0;
  return Math.round((etapas.filter((e) => e.feita).length / etapas.length) * 100);
}

export const hojeIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Dias até o prazo (negativo = atrasado); null sem prazo
export function diasAte(iso) {
  if (!iso) return null;
  const [a, m, d] = iso.split('-').map(Number);
  const alvo = new Date(a, m - 1, d);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((alvo - hoje) / 86400000);
}

export function rotuloPrazo(iso) {
  const dias = diasAte(iso);
  if (dias === null) return '';
  if (dias < 0) return `Atrasado ${-dias} ${dias === -1 ? 'dia' : 'dias'}`;
  if (dias === 0) return 'Vence hoje';
  if (dias === 1) return 'Vence amanhã';
  if (dias <= 30) return `Faltam ${dias} dias`;
  return dataCurta(iso);
}

export function dataCurta(iso) {
  if (!iso) return '';
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: a !== new Date().getFullYear() ? 'numeric' : undefined });
}

export const atrasado = (p) => p.status !== 'concluido' && p.prazo && diasAte(p.prazo) < 0;

export const totalGasto = (p) => (p.gastos || []).reduce((s, g) => s + (Number(g.valor) || 0), 0);
export const totalHoras = (p) => (p.diario || []).reduce((s, r) => s + (Number(r.horas) || 0), 0);

export const formatarHoras = (h) => {
  if (!h) return '0h';
  const horas = Math.floor(h);
  const min = Math.round((h - horas) * 60);
  return min ? `${horas}h${String(min).padStart(2, '0')}` : `${horas}h`;
};

// Próxima etapa a fazer: a com prazo mais perto, senão a primeira da lista
export function proximaEtapa(projeto) {
  const pendentes = (projeto.etapas || []).filter((e) => !e.feita);
  if (!pendentes.length) return null;
  const comPrazo = pendentes.filter((e) => e.prazo).sort((a, b) => a.prazo.localeCompare(b.prazo));
  return comPrazo[0] || pendentes[0];
}

// Categoria da tarefa criada a partir de uma etapa
export const categoriaTarefa = (areaValor) =>
  ({ Estudos: 'Estudo', Trabalho: 'Carreira', Negócios: 'Carreira', Tecnologia: 'Estudo', Saúde: 'Saúde' })[areaValor] || 'Pessoal';

// Ordem dentro de uma coluna: fixados, depois prioridade, depois prazo
const pesoPrioridade = { alta: 0, media: 1, baixa: 2 };
export const ordenarProjetos = (a, b) =>
  (b.fixado ? 1 : 0) - (a.fixado ? 1 : 0) ||
  (pesoPrioridade[a.prioridade] ?? 1) - (pesoPrioridade[b.prioridade] ?? 1) ||
  (a.prazo || '9999').localeCompare(b.prazo || '9999') ||
  (b.atualizadoEm || 0) - (a.atualizadoEm || 0);
