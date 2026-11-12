export const LIVRO_VAZIO = {
  titulo: '',
  autor: '',
  categoria: 'Ficção',
  tipo: 'Livro',
  descricao: '',
  paginasTotal: '',
  paginasLidas: 0,
  capituloAtual: '',
  status: 'Não Iniciado',
  avaliacao: 0,
  notas: '',
  dataInicio: '',
  dataTermino: '',
  linkCompra: '',
  capa: '',
  favorito: false,
  anotacoes: []
};

export const categorias = [
  'Ficção', 'Não-Ficção', 'Biografia', 'História', 'Ciência',
  'Tecnologia', 'Filosofia', 'Psicologia', 'Autoajuda', 'Negócios',
  'Literatura', 'Poesia', 'Aventura', 'Educação'
];

export const tipos = ['Livro', 'E-book', 'Audiobook', 'Resumo', 'Apostila', 'Artigo', 'Manual'];

export const statusLeitura = ['Não Iniciado', 'Lendo', 'Pausado', 'Concluído', 'Abandonado'];

export const statusTone = {
  'Lendo': 'accent',
  'Concluído': 'solid',
  'Pausado': 'default',
  'Não Iniciado': 'muted',
  'Abandonado': 'muted'
};

export const calcularProgresso = (livro) => {
  if (!livro || !livro.paginasTotal || livro.paginasTotal === 0) return 0;
  return Math.round((livro.paginasLidas / livro.paginasTotal) * 100);
};
