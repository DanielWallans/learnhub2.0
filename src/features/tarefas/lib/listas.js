import { Pill, ShoppingBasket, ShoppingCart } from 'lucide-react';

// Listas de compras: tipos, seções do mercado e da farmácia e leitura de itens digitados.
// Funciona por regras de texto (não é IA), como o resto do módulo.

export const semAcento = (t) => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export const novoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const TIPOS_LISTA = {
  mercado: { valor: 'mercado', nome: 'Mercado', rotulo: 'Lista do mercado', icone: ShoppingCart, exemplo: '2 leite, pão, 1kg de arroz, detergente' },
  farmacia: { valor: 'farmacia', nome: 'Farmácia', rotulo: 'Lista da farmácia', icone: Pill, exemplo: 'dipirona, protetor solar, 2 sabonetes' },
  outra: { valor: 'outra', nome: 'Outra lista', rotulo: 'Outra lista', icone: ShoppingBasket, exemplo: 'pilhas, lâmpada, fita adesiva' },
};

export const tipoLista = (valor) => TIPOS_LISTA[valor] || TIPOS_LISTA.outra;

// Descobre o tipo pelo nome que a pessoa deu ("Feira de sábado" é mercado)
export function tipoPeloNome(nome) {
  const n = semAcento(nome);
  if (/mercado|supermercado|feira|hortifruti|atacad|sacolao|acougue|padaria/.test(n)) return 'mercado';
  if (/farmacia|drogaria|remedio/.test(n)) return 'farmacia';
  return 'outra';
}

// Seções na ordem em que costumam aparecer no corredor.
// Frases mais específicas vêm antes ("creme de leite" é laticínio, "água sanitária" é limpeza).
const SECOES_MERCADO = [
  // Produtos de prateleira com nome de fruta, verdura ou laticínio
  { nome: 'Mercearia', re: /molho|extrato|massa de tomate|leite condensado|leite de coco|leite em po|batata palha|suco em po|milho de pipoca|creme de cebola/ },
  { nome: 'Congelados', re: /congelad|sorvete|pizza|lasanha|nugget|pao de queijo|batata frita|polpa|picole/ },
  { nome: 'Limpeza', re: /detergente|sabao|amaciante|desinfetante|agua sanitaria|candida|alvejante|esponja|vassoura|rodo|saco de lixo|papel toalha|limpador|lustra|multiuso|pano de chao|palha de aco|bombril|inseticida/ },
  { nome: 'Higiene', re: /papel higienico|shampoo|xampu|condicionador|sabonete|pasta de dente|creme dental|escova de dente|desodorante|absorvente|fio dental|barbeador|gilete|fralda|lenco|cotonete|hidratante|protetor solar/ },
  { nome: 'Frios e laticínios', re: /creme de leite|leite(?! condensado)|queijo|iogurte|manteiga|requeijao|presunto|mortadela|nata|margarina|\bovos?\b|salame|peito de peru|danone/ },
  { nome: 'Carnes', re: /carne|frango|peixe|linguica|bacon|patinho|alcatra|acem|costela|\bfile\b|picanha|maminha|coxa|sobrecoxa|salsicha|hamburguer|\bbife|camarao|tilapia|cupim|musculo/ },
  { nome: 'Padaria', re: /\bpao\b|\bpaes\b|bisnag|\bbolo\b|torrada|broa|rosca|croissant|sonho/ },
  { nome: 'Hortifrúti', re: /banana|\bmacas?\b|laranja|limao|tomate|cebola|\balho\b|batata|cenoura|alface|fruta|verdura|legume|abacate|mamao|\buva|morango|pepino|pimentao|couve|brocolis|abobora|mandioca|aipim|melancia|melao|abacaxi|manga|cheiro verde|coentro|salsinha|cebolinha|rucula|beterraba|chuchu|abobrinha|berinjela|gengibre|kiwi|pera\b|ameixa/ },
  { nome: 'Bebidas', re: /\bagua\b|refrigerante|refri\b|\bsuco|cerveja|vinho|coca|guarana|\bcha\b|energetico|isotonico|kombucha/ },
  { nome: 'Mercearia', re: /arroz|feijao|macarrao|massa|\boleo|azeite|acucar|\bsal\b|farinha|farofa|\bcafe|molho|extrato|\bmilho|ervilha|atum|sardinha|biscoito|bolacha|cereal|aveia|achocolatado|nescau|tempero|vinagre|leite condensado|fuba|granola|pipoca|maionese|ketchup|mostarda|geleia|\bmel\b|lentilha|grao de bico|amendoim|chocolate|tapioca|gelatina|fermento|caldo/ },
];
const ORDEM_MERCADO = ['Hortifrúti', 'Padaria', 'Carnes', 'Frios e laticínios', 'Mercearia', 'Bebidas', 'Congelados', 'Limpeza', 'Higiene', 'Outros'];

const SECOES_FARMACIA = [
  { nome: 'Primeiros socorros', re: /curativo|band.?aid|gaze|esparadrapo|algodao|alcool|termometro|agua oxigenada|mertiolate|soro fisiologico|atadura|micropore/ },
  { nome: 'Higiene e cuidados', re: /shampoo|xampu|condicionador|sabonete|pasta de dente|creme dental|escova|desodorante|absorvente|fio dental|fralda|lenco|cotonete|hidratante|protetor solar|repelente|preservativo|camisinha|barbeador|enxaguante|creme/ },
  { nome: 'Remédios', re: /remedio|comprimido|capsula|gotas|xarope|pomada|colirio|vitamina|dipirona|paracetamol|ibuprofeno|dorflex|neosaldina|novalgina|tylenol|advil|buscopan|omeprazol|loratadina|allegra|antialergic|antibiotic|anticoncepcional|insulina|\bmg\b|\bml\b|spray nasal|descongestionante|engov|eno\b|sal de fruta|antiacido|melatonina|probiotico/ },
];
const ORDEM_FARMACIA = ['Remédios', 'Primeiros socorros', 'Higiene e cuidados', 'Outros'];

export function secaoDoItem(nome, tipo) {
  const n = semAcento(nome);
  const regras = tipo === 'farmacia' ? SECOES_FARMACIA : tipo === 'mercado' ? SECOES_MERCADO : [];
  const achada = regras.find((s) => s.re.test(n));
  return achada ? achada.nome : 'Outros';
}

export function ordemSecoes(tipo) {
  if (tipo === 'mercado') return ORDEM_MERCADO;
  if (tipo === 'farmacia') return ORDEM_FARMACIA;
  return ['Outros'];
}

const NUMEROS = { um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, meia: 0.5, meio: 0.5 };
const UNIDADES =
  'kg|quilos?|g|gramas?|l|litros?|ml|un|unid|unidades?|x|cx|caixas?|caixinhas?|pacotes?|pct|pcts|latas?|garrafas?|duzias?|dúzias?|dz|fardos?|potes?|sacos?|bandejas?|cartelas?|vidros?|tubos?|maços?|macos?|rolos?|frascos?|cachos?';

// "2 leite", "1kg de arroz", "uma dúzia de ovos", "leite x2", "3 latas de atum"
export function interpretarItem(trecho) {
  let texto = trecho.replace(/\s+/g, ' ').trim().replace(/^[-*•]\s*/, '');
  if (!texto) return null;
  let qtd = '';

  const inicio = texto.match(new RegExp(`^(\\d+(?:[.,]\\d+)?|${Object.keys(NUMEROS).join('|')})\\s*(${UNIDADES})?\\.?\\s+(?:de\\s+)?(.+)$`, 'i'));
  if (inicio) {
    const n = NUMEROS[semAcento(inicio[1])] ?? inicio[1].replace('.', ',');
    const unidade = inicio[2] ? inicio[2].toLowerCase() : '';
    qtd = unidade && unidade !== 'x' ? `${n} ${unidade}`.replace(/^(\d+(?:,\d+)?) (kg|g|l|ml)$/, '$1$2') : String(n);
    texto = inicio[3];
  } else {
    const fim = texto.match(/^(.+?)\s+(?:x\s*)?(\d+)\s*(?:x|un|unid)?$/i);
    if (fim && !/\d\s*mg$/i.test(texto)) {
      texto = fim[1];
      qtd = fim[2];
    }
  }

  texto = texto.trim();
  if (!texto) return null;
  return { nome: texto.charAt(0).toUpperCase() + texto.slice(1), qtd };
}

// Vários itens de uma vez: separados por vírgula, ponto e vírgula, quebra de linha ou " e "
export function interpretarItens(texto, tipo) {
  return texto
    .split(/[,;\n]+|\s+e\s+/i)
    .map(interpretarItem)
    .filter(Boolean)
    .map((item) => ({ ...item, secao: secaoDoItem(item.nome, tipo) }));
}

// Agrupa os itens pendentes por seção, na ordem do corredor
export function agruparPorSecao(itens, tipo) {
  const ordem = ordemSecoes(tipo);
  const grupos = new Map(ordem.map((s) => [s, []]));
  itens.forEach((item) => {
    const secao = grupos.has(item.secao) ? item.secao : 'Outros';
    grupos.get(secao).push(item);
  });
  return [...grupos.entries()].filter(([, lista]) => lista.length);
}

// Texto para mandar no WhatsApp ou copiar
export function listaComoTexto(lista) {
  const pendentes = (lista.itens || []).filter((i) => !i.feito);
  const linhas = [`*${lista.nome}*`];
  agruparPorSecao(pendentes, lista.tipo).forEach(([secao, itens]) => {
    if (lista.tipo !== 'outra') linhas.push('', `_${secao}_`);
    itens.forEach((i) => linhas.push(`- ${i.nome}${i.qtd ? ` (${i.qtd})` : ''}`));
  });
  if (!pendentes.length) linhas.push('', 'Tudo comprado.');
  return linhas.join('\n');
}

// Itens que a pessoa costuma comprar nesta lista (guardados com a contagem de vezes)
export function registrarFrequentes(frequentes = {}, itens) {
  const novo = { ...frequentes };
  itens.forEach((i) => {
    const chave = semAcento(i.nome);
    const atual = novo[chave];
    novo[chave] = { nome: i.nome, qtd: i.qtd || atual?.qtd || '', secao: i.secao, vezes: (atual?.vezes || 0) + 1 };
  });
  // Mantém só os 40 mais usados para o documento não crescer sem limite
  const ordenados = Object.entries(novo).sort((a, b) => b[1].vezes - a[1].vezes).slice(0, 40);
  return Object.fromEntries(ordenados);
}

// Liga uma tarefa ("hoje supermercado", "passar na farmácia") à lista do mesmo tipo
export function listaDaTarefa(tarefa, listas) {
  if (!tarefa || !listas.length) return null;
  const titulo = semAcento(tarefa.titulo);
  const porNome = listas.find((l) => titulo.includes(semAcento(l.nome)));
  if (porNome) return porNome;
  const tipo = tipoPeloNome(titulo);
  if (tipo === 'outra') return null;
  return listas.find((l) => l.tipo === tipo) || null;
}
