// Nomes das coleções do Firestore em um só lugar.
// Todo documento de usuário carrega o campo "userId" (ou usa o próprio uid como id do documento).
export const COL = {
  alunos: 'alunos', // perfil do estudante (id = uid)
  usuarios: 'usuarios', // perfil administrativo (id = uid)
  leitura: 'leitura', // livros e anotações
  financasResumo: 'financas_resumo', // saldos e cartão (id = uid)
  financasTransacoes: 'financas_transacoes', // lançamentos
  habilidades: 'habilidades', // habilidades e progresso
  candidaturas: 'candidaturas', // processos seletivos
  carreiraMetas: 'carreira_metas', // metas de carreira
  tarefas: 'tarefas', // tarefas do dia a dia
  bugReports: 'bug-reports', // relatórios enviados pelo app
};
