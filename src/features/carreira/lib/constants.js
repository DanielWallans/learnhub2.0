import { Clock, Target, Search, Pencil, Handshake, Trophy, BookOpen, Globe, Users, Code, Award, FolderGit2 } from 'lucide-react';

export const FLOW_STAGES = [
  { key: 'enviado', title: 'Inscrição', desc: 'Currículo enviado ou cadastro feito', icon: Search },
  { key: 'prova', title: 'Prova', desc: 'Teste técnico ou prova de conhecimento', icon: Pencil },
  { key: 'entrevista', title: 'Entrevista', desc: 'Conversa com RH ou entrevista técnica', icon: Handshake },
  { key: 'aprovado', title: 'Aprovado', desc: 'Proposta recebida', icon: Trophy }
];
export const STAGES_ORDER = FLOW_STAGES.map((s) => s.key);
export const STAGE_LABEL = { enviado: 'Inscrição', prova: 'Prova', entrevista: 'Entrevista', aprovado: 'Aprovado', reprovado: 'Não passou' };

export const TIPOS_META = [
  { value: 'objetivo', label: 'Objetivo geral', icon: Target },
  { value: 'estudo', label: 'Estudo técnico', icon: Code },
  { value: 'curso', label: 'Curso ou treinamento', icon: BookOpen },
  { value: 'certificacao', label: 'Certificação', icon: Award },
  { value: 'projeto', label: 'Projeto prático', icon: FolderGit2 },
  { value: 'idioma', label: 'Idioma', icon: Globe },
  { value: 'networking', label: 'Networking', icon: Users },
  { value: 'tempo', label: 'Tempo de estudo', icon: Clock }
];
export const tipoMeta = (v) => TIPOS_META.find((t) => t.value === v) || TIPOS_META[0];

export const VAGA_VAZIA = {
  empresa: '',
  vaga: '',
  tipoVaga: 'Estágio',
  modalidade: 'Remoto',
  salario: '',
  linkVaga: '',
  localizacao: '',
  requisitos: '',
  observacoes: ''
};

export const META_VAZIA = {
  tipo: 'objetivo',
  valorTempo: { anos: '0', meses: '6', dias: '0' },
  valorObjetivo: '',
  plataforma: '',
  instituicao: '',
  dataAlvo: '',
  tecnologias: '',
  idiomaNivel: '',
  detalhesNetworking: '',
  concluida: false
};

export const duracaoTexto = ({ anos = '0', meses = '0', dias = '0' } = {}) => {
  const parts = [];
  if (anos !== '0') parts.push(`${anos} ${anos === '1' ? 'ano' : 'anos'}`);
  if (meses !== '0') parts.push(`${meses} ${meses === '1' ? 'mês' : 'meses'}`);
  if (dias !== '0') parts.push(`${dias} ${dias === '1' ? 'dia' : 'dias'}`);
  return parts.length > 0 ? parts.join(', ') : '0 dias';
};

export const detalheMeta = (goal) => {
  switch (goal.tipo) {
    case 'tempo': return `Duração: ${duracaoTexto(goal.valorTempo)}`;
    case 'estudo':
    case 'projeto': return goal.tecnologias && `Tecnologias: ${goal.tecnologias}`;
    case 'curso': return goal.plataforma && `Plataforma: ${goal.plataforma}`;
    case 'certificacao':
      return [goal.instituicao, goal.dataAlvo && `até ${new Date(`${goal.dataAlvo}T12:00:00`).toLocaleDateString('pt-BR')}`].filter(Boolean).join(' · ');
    case 'idioma': return goal.idiomaNivel && `Nível: ${goal.idiomaNivel}`;
    case 'networking': return goal.detalhesNetworking && `Foco: ${goal.detalhesNetworking}`;
    default: return '';
  }
};
