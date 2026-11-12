import { Briefcase, GraduationCap, HeartPulse, ShoppingCart, User } from 'lucide-react';

// Categorias e as palavras que levam uma tarefa até elas (comparadas sem acento)
export const CATEGORIAS = [
  {
    valor: 'Estudo',
    icone: GraduationCap,
    palavras: /estud|prova|aula|curso|java|python|react|javascript|programa|\brevis|tcc|faculdade|escola|exercici|lista de|ler |leitura|livro|apresentac/,
  },
  {
    valor: 'Carreira',
    icone: Briefcase,
    palavras: /entrevista|vaga|curriculo|reuniao|linkedin|estagio|emprego|trabalho|cliente|projeto|portfolio|freela/,
  },
  {
    valor: 'Compras',
    icone: ShoppingCart,
    palavras: /compra|comprar|mercado|supermercado|feira|farmacia|padaria|loja|pagar|boleto|conta de|fatura/,
  },
  {
    valor: 'Saúde',
    icone: HeartPulse,
    palavras: /academia|treino|medico|consulta|dentista|exame|corrida|correr|remedio|psicolog|terapia|nutri/,
  },
  { valor: 'Pessoal', icone: User, palavras: null },
];

// Ordem de detecção: as mais específicas primeiro ("pagar boleto da faculdade" é Compras, não Estudo)
export const ORDEM_DETECCAO = ['Compras', 'Saúde', 'Carreira', 'Estudo'];

export const categoria = (valor) => CATEGORIAS.find((c) => c.valor === valor) || CATEGORIAS[CATEGORIAS.length - 1];

export const TAREFA_VAZIA = {
  titulo: '',
  data: '',
  hora: '',
  categoria: 'Pessoal',
  importante: false,
  notas: '',
};
