import { Server, Wrench, HardDrive, Cpu, Scale, Shield, Sparkles } from 'lucide-react';

export const categorias = ['Estudo', 'Produtividade', 'Criatividade', 'Saúde', 'Social'];
export const niveis = ['Iniciante', 'Intermediário', 'Avançado'];
export const prazos = ['1 dia', '1 semana', '2 semanas', '1 mês', '3 meses', '6 meses', '1 ano'];

// Mapa em três faixas: cada categoria tem uma coluna (x em fração da largura)
export const MAPA_FAIXAS = [
  [{ cat: 'Estudo', x: 0.27 }, { cat: 'Produtividade', x: 0.73 }],
  [{ cat: 'Criatividade', x: 0.5 }],
  [{ cat: 'Saúde', x: 0.27 }, { cat: 'Social', x: 0.73 }]
];
export const NODE_GAP = 38;
export const NODE_HALF_WIDTH = 78;

export const DICAS = {
  Estudo: {
    Iniciante: ['Faça sessões curtas de 15 minutos focadas no básico.', 'Escreva um resumo curto do que estudou no dia.'],
    Intermediário: ['Use Pomodoro: 25 minutos de foco total.', 'Explique o assunto para outra pessoa para fixar.'],
    Avançado: ['Ensine o conteúdo ou crie algo prático com ele.', 'Use repetição espaçada (Anki, por exemplo).']
  },
  Produtividade: {
    Iniciante: ['Mantenha só 3 tarefas importantes por dia.', 'Desligue as notificações do celular durante o foco.'],
    Intermediário: ['Separe tarefas pela Matriz de Eisenhower.', 'Revise onde perdeu tempo no fim da semana.'],
    Avançado: ['Automatize tarefas repetitivas.', 'Monte seu fluxo com o método GTD.']
  },
  Saúde: {
    Iniciante: ['Caminhe 10 minutos depois do almoço.', 'Beba um copo de água ao acordar.'],
    Intermediário: ['Planeje as refeições da semana com antecedência.', 'Reserve 10 minutos por dia para respirar e pausar.'],
    Avançado: ['Monte treinos com progressão.', 'Acompanhe seu sono e ajuste a rotina da noite.']
  },
  Criatividade: {
    Iniciante: ['Anote 3 ideias por dia, sem julgar.', 'Separe 10 minutos para testar algo visual novo.'],
    Intermediário: ['Busque referências fora da sua área.', 'Misture duas disciplinas num mesmo projeto.'],
    Avançado: ['Publique o que cria e peça feedback.', 'Toque projetos longos com metas de entrega.']
  },
  Social: {
    Iniciante: ['Puxe conversa com um colega diferente por dia.', 'Pratique escuta ativa nas conversas.'],
    Intermediário: ['Participe de grupos e encontros da sua área.', 'Ofereça ajuda em pequenos projetos.'],
    Avançado: ['Conduza debates ou mentorias.', 'Pratique comunicação empática em situações difíceis.']
  }
};

export const calcularDataConclusao = (dataInicio, prazo) => {
  const data = new Date(dataInicio);
  switch (prazo) {
    case '1 dia': data.setDate(data.getDate() + 1); break;
    case '1 semana': data.setDate(data.getDate() + 7); break;
    case '2 semanas': data.setDate(data.getDate() + 14); break;
    case '1 mês': data.setMonth(data.getMonth() + 1); break;
    case '3 meses': data.setMonth(data.getMonth() + 3); break;
    case '6 meses': data.setMonth(data.getMonth() + 6); break;
    case '1 ano': data.setFullYear(data.getFullYear() + 1); break;
    default: data.setMonth(data.getMonth() + 1);
  }
  return data.toISOString().split('T')[0];
};

export const getSkillIcon = (name = '') => {
  const n = name.toLowerCase();
  if (/java|spring|api|back-end|servidor/.test(n)) return Server;
  if (/impressora|manutenção|ferramenta|chave/.test(n)) return Wrench;
  if (/ventoy|strelec|pendrive|diagnóstico|sistema/.test(n)) return HardDrive;
  if (/lógica|programação|algoritmo|código/.test(n)) return Cpu;
  if (/nutrição|balança|cálculo|dieta/.test(n)) return Scale;
  if (/segurança|proteção|harden/.test(n)) return Shield;
  return Sparkles;
};

export const formatData = (iso) => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR') : '—');
