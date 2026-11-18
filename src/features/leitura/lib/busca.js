import { MOCK_LIVROS_DB } from '@/features/leitura/data/livros';

// Chave opcional do Google Books. Sem ela a API usa uma cota anônima compartilhada
// que esgota com frequência (erro 429); por isso sempre existe a Open Library de reserva.
const GOOGLE_KEY = process.env.REACT_APP_GOOGLE_BOOKS_KEY;

const googleUrl = (q, max) =>
  `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=${max}&langRestrict=pt` +
  (GOOGLE_KEY ? `&key=${GOOGLE_KEY}` : '');

const normalizar = (s) => (s || '').toLowerCase().trim();

/* ---------------- ISBN ---------------- */

const limparIsbn = (s) => (s || '').replace(/[^0-9Xx]/g, '').toUpperCase();

function isbn10Valido(isbn) {
  if (!/^\d{9}[\dX]$/.test(isbn)) return false;
  let soma = 0;
  for (let i = 0; i < 10; i++) soma += (isbn[i] === 'X' ? 10 : +isbn[i]) * (10 - i);
  return soma % 11 === 0;
}

function isbn13Valido(isbn) {
  if (!/^97[89]\d{10}$/.test(isbn)) return false;
  let soma = 0;
  for (let i = 0; i < 13; i++) soma += +isbn[i] * (i % 2 ? 3 : 1);
  return soma % 10 === 0;
}

// ISBN-13 (978...) -> ISBN-10, que é o código que a Amazon usa para livros
export function isbn13para10(isbn13) {
  if (!/^978\d{10}$/.test(isbn13)) return null;
  const base = isbn13.slice(3, 12);
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += +base[i] * (10 - i);
  const dv = (11 - (soma % 11)) % 11;
  return base + (dv === 10 ? 'X' : String(dv));
}

export function isbnValido(valor) {
  const isbn = limparIsbn(valor);
  return isbn10Valido(isbn) || isbn13Valido(isbn) ? isbn : null;
}

const KNOWN_STORES = [
  { re: /amazon\./i, nome: 'Amazon' },
  { re: /estantevirtual\./i, nome: 'Estante Virtual' },
  { re: /mercadolivre\.|mercadolibre\./i, nome: 'Mercado Livre' },
  { re: /magazineluiza\.|magalu\./i, nome: 'Magalu' },
  { re: /americanas\./i, nome: 'Americanas' },
  { re: /submarino\./i, nome: 'Submarino' },
  { re: /livrariacultura\./i, nome: 'Livraria Cultura' },
  { re: /travessa\./i, nome: 'Livraria da Travessa' },
  { re: /leitura\.com\.br/i, nome: 'Livraria Leitura' },
  { re: /kobo\./i, nome: 'Kobo' },
  { re: /books\.google\./i, nome: 'Google Livros' }
];

// Nome da loja a partir do link (para o botão "Abrir na Amazon", por exemplo)
export function nomeDaLoja(url) {
  if (!url) return null;
  const loja = KNOWN_STORES.find((s) => s.re.test(url));
  if (loja) return loja.nome;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// Extrai o ISBN de um link de loja. Na Amazon o código depois de /dp/ é o ISBN-10 do livro;
// nas outras lojas o ISBN costuma aparecer no próprio endereço.
export function isbnDoLink(url) {
  if (!url) return null;
  const amazon = url.match(/\/(?:dp|gp\/product|ASIN|product)\/([0-9]{9}[0-9X])(?:[/?#]|$)/i);
  if (amazon && isbn10Valido(amazon[1].toUpperCase())) return amazon[1].toUpperCase();
  const isbn13 = url.match(/97[89][-\d]{10,16}/g) || [];
  for (const cand of isbn13) {
    const ok = isbnValido(cand);
    if (ok && ok.length === 13) return ok;
  }
  const isbn10 = url.match(/(?:^|[^\d])(\d{9}[\dX])(?=[^\d]|$)/gi) || [];
  for (const cand of isbn10) {
    const ok = isbnValido(cand);
    if (ok) return ok;
  }
  return null;
}

// Tenta tirar um título legível do link (a Amazon põe o nome do livro antes do /dp/)
export function tituloDoLink(url) {
  if (!url) return '';
  const m = url.match(/amazon\.[^/]+\/([^/?#]+)\/dp\//i);
  if (!m) return '';
  try {
    return decodeURIComponent(m[1])
      .replace(/[-_]+/g, ' ')
      .replace(/\b(ebook|kindle|edition|edicao)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return '';
  }
}

/* ---------------- Capas ---------------- */

// Carrega a imagem no navegador para saber se existe (funciona sem CORS).
// A Amazon devolve um GIF de 1x1 quando não tem a capa; o Google devolve um PNG
// cinza de 128x170 escrito "image not available". Os dois contam como "sem capa".
export function verificarImagem(url, timeout = 6000) {
  return new Promise((resolve) => {
    if (!url) return resolve(false);
    if (url.startsWith('data:')) return resolve(true);
    const img = new Image();
    const t = setTimeout(() => resolve(false), timeout);
    img.onload = () => {
      clearTimeout(t);
      resolve(!pareceCapaVazia(url, img.naturalWidth, img.naturalHeight));
    };
    img.onerror = () => {
      clearTimeout(t);
      resolve(false);
    };
    img.referrerPolicy = 'no-referrer';
    img.src = url;
  });
}

export function pareceCapaVazia(url, w, h) {
  if (w <= 2 || h <= 2) return true;
  if (/books\.google|googleapis|googleusercontent/i.test(url) && w === 128 && h === 170) return true;
  return false;
}

export const capaAmazon = (isbn10) => `https://images-na.ssl-images-amazon.com/images/P/${isbn10}.01.LZZZZZZZ.jpg`;
const capaOpenLibraryIsbn = (isbn) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;

function candidatasPorIsbn(isbn) {
  const lista = [];
  const isbn10 = isbn.length === 10 ? isbn : isbn13para10(isbn);
  if (isbn10) lista.push(capaAmazon(isbn10));
  lista.push(capaOpenLibraryIsbn(isbn));
  if (isbn10 && isbn.length === 13) lista.push(capaOpenLibraryIsbn(isbn10));
  return lista;
}

async function primeiraQueCarrega(urls) {
  for (const url of urls) {
    if (url && (await verificarImagem(url))) return url;
  }
  return null;
}

async function capasGoogle(q) {
  try {
    const resp = await fetch(googleUrl(q, 3));
    if (!resp.ok) return { capas: [], isbns: [] };
    const data = await resp.json();
    const capas = [];
    const isbns = [];
    (data.items || []).forEach((item) => {
      const info = item.volumeInfo || {};
      const links = info.imageLinks;
      if (links) capas.push((links.thumbnail || links.smallThumbnail || '').replace(/^http:/i, 'https:').replace('&edge=curl', ''));
      (info.industryIdentifiers || []).forEach((id) => isbns.push(id.identifier));
    });
    return { capas, isbns };
  } catch {
    return { capas: [], isbns: [] };
  }
}

async function capasOpenLibrary(titulo, autor) {
  try {
    const params = new URLSearchParams({ title: titulo, limit: '3', fields: 'cover_i,isbn' });
    if (autor) params.set('author', autor);
    let resp = await fetch(`https://openlibrary.org/search.json?${params}`);
    let data = resp.ok ? await resp.json() : { docs: [] };
    if (!data.docs || data.docs.length === 0) {
      resp = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(`${titulo} ${autor || ''}`)}&limit=3&fields=cover_i,isbn`);
      data = resp.ok ? await resp.json() : { docs: [] };
    }
    const docs = data.docs || [];
    const capas = docs.filter((d) => d.cover_i).map((d) => `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`);
    // ISBNs brasileiros primeiro (prefixo 85/65), para a capa sair em português
    const isbns = docs.flatMap((d) => d.isbn || []);
    const br = isbns.filter((i) => /^(97[89])?(85|65)/.test(i));
    return { capas, isbns: [...br, ...isbns.filter((i) => !br.includes(i))].slice(0, 6) };
  } catch {
    return { capas: [], isbns: [] };
  }
}

/**
 * Procura a capa de um livro sem o usuário precisar enviar imagem.
 * Ordem: ISBN informado ou tirado do link de compra -> Google Books -> Open Library.
 * Devolve { capa, isbn } (os dois podem vir vazios).
 */
export async function encontrarCapa({ titulo = '', autor = '', isbn = '', linkCompra = '' } = {}) {
  const isbnConhecido = isbnValido(isbn) || isbnDoLink(linkCompra);
  if (isbnConhecido) {
    const capa = await primeiraQueCarrega(candidatasPorIsbn(isbnConhecido));
    if (capa) return { capa, isbn: isbnConhecido };
  }

  const tituloBusca = titulo || tituloDoLink(linkCompra);
  if (!tituloBusca) return { capa: '', isbn: isbnConhecido || '' };

  const google = await capasGoogle(autor ? `intitle:${tituloBusca} inauthor:${autor}` : tituloBusca);
  const capaGoogle = await primeiraQueCarrega(google.capas);
  const isbnGoogle = google.isbns.map(isbnValido).find(Boolean);
  if (capaGoogle) return { capa: capaGoogle, isbn: isbnConhecido || isbnGoogle || '' };

  const ol = await capasOpenLibrary(tituloBusca, autor);
  const isbnsOl = ol.isbns.map(isbnValido).filter(Boolean);
  // Capa da Amazon pelo ISBN costuma ser a edição brasileira e em melhor resolução
  const isbnsCandidatos = [isbnGoogle, ...isbnsOl].filter(Boolean).slice(0, 3);
  for (const i of isbnsCandidatos) {
    const capa = await primeiraQueCarrega(candidatasPorIsbn(i).slice(0, 1));
    if (capa) return { capa, isbn: isbnConhecido || i };
  }
  const capa = await primeiraQueCarrega(ol.capas);
  return { capa: capa || '', isbn: isbnConhecido || isbnGoogle || isbnsOl[0] || '' };
}

// Compatibilidade: só a URL da capa a partir do título
export async function buscarCapaPorTitulo(titulo) {
  return (await encontrarCapa({ titulo })).capa || null;
}

/* ---------------- Lojas ---------------- */

// Links de compra montados a partir do livro: vão direto para a página do produto
// quando há ISBN (Amazon) e para a busca da loja nos outros casos.
export function lojasParaLivro(livro) {
  const termo = [livro.titulo, livro.autor && livro.autor !== 'Autor desconhecido' ? livro.autor : '']
    .filter(Boolean)
    .join(' ')
    .trim();
  if (!termo) return [];
  const isbn = isbnValido(livro.isbn) || isbnDoLink(livro.linkCompra);
  const isbn10 = isbn && (isbn.length === 10 ? isbn : isbn13para10(isbn));
  const q = encodeURIComponent(termo);
  const slugMl = termo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return [
    {
      nome: 'Amazon',
      url: isbn10 ? `https://www.amazon.com.br/dp/${isbn10}` : `https://www.amazon.com.br/s?k=${q}&i=stripbooks`
    },
    { nome: 'Estante Virtual', url: `https://www.estantevirtual.com.br/busca?q=${isbn || q}` },
    { nome: 'Mercado Livre', url: `https://lista.mercadolivre.com.br/livro-${slugMl}` },
    { nome: 'Google Livros', url: `https://www.google.com/search?tbm=bks&q=${isbn ? `isbn:${isbn}` : q}` }
  ];
}

/* ---------------- Busca para adicionar ---------------- */

// Busca na Open Library (reserva quando o Google Books falha)
export const buscarOpenLibrary = async (q) => {
  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=6&fields=key,title,author_name,first_sentence,number_of_pages_median,cover_i,subject,isbn`
    );
    if (response.ok) {
      const data = await response.json();
      if (data.docs) {
        return data.docs.map((item, idx) => {
          const isbns = item.isbn || [];
          const isbn = isbns.find((i) => /^(97[89])?(85|65)/.test(i)) || isbns[0] || '';
          return {
            id: item.key || `ol-${idx}-${Date.now()}`,
            titulo: item.title || 'Sem título',
            autor: item.author_name ? item.author_name.join(', ') : 'Autor desconhecido',
            descricao: item.first_sentence ? item.first_sentence.join(' ') : '',
            paginasTotal: item.number_of_pages_median || 0,
            capa: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg` : '',
            categoria: item.subject ? item.subject[0] : 'Geral',
            isbn: isbnValido(isbn) || ''
          };
        });
      }
    }
  } catch (e) {
    console.error('Erro ao buscar na Open Library:', e);
  }
  return [];
};

// Busca livros para adicionar: base local primeiro, depois Google Books (ou Open Library se ele falhar).
// Remove títulos repetidos e devolve no máximo 8 resultados.
export async function buscarLivros(q) {
  const queryLimpa = normalizar(q);

  // 1. Base local
  const resultadosLocais = MOCK_LIVROS_DB.filter(
    (livro) => normalizar(livro.titulo).includes(queryLimpa) || normalizar(livro.autor).includes(queryLimpa)
  ).map((livro, idx) => ({ id: `local-mock-${idx}-${Date.now()}`, ...livro }));

  // 2. Google Books, com Open Library como reserva (inclusive quando a cota acaba)
  let resultadosOnline = [];
  try {
    const response = await fetch(googleUrl(q, 6));
    if (response.ok) {
      const data = await response.json();
      resultadosOnline = (data.items || []).map((item) => {
        const info = item.volumeInfo;
        const ids = info.industryIdentifiers || [];
        const isbn = (ids.find((i) => i.type === 'ISBN_13') || ids.find((i) => i.type === 'ISBN_10') || {}).identifier || '';
        let capaUrl = '';
        if (info.imageLinks) {
          capaUrl = (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || '').replace(/^http:/i, 'https:');
        }
        return {
          id: item.id,
          titulo: info.title || 'Sem título',
          autor: info.authors ? info.authors.join(', ') : 'Autor desconhecido',
          descricao: info.description || '',
          paginasTotal: info.pageCount || 0,
          capa: capaUrl,
          categoria: info.categories ? info.categories[0] : 'Geral',
          isbn: isbnValido(isbn) || ''
        };
      });
    }
    if (resultadosOnline.length === 0) resultadosOnline = await buscarOpenLibrary(q);
  } catch (error) {
    resultadosOnline = await buscarOpenLibrary(q);
  }

  // Resultado sem capa mas com ISBN: usa a capa da Amazon pelo ISBN-10
  resultadosOnline = resultadosOnline.map((r) => {
    if (r.capa || !r.isbn) return r;
    const isbn10 = r.isbn.length === 10 ? r.isbn : isbn13para10(r.isbn);
    return isbn10 ? { ...r, capa: capaAmazon(isbn10) } : r;
  });

  // Mescla priorizando os locais e remove títulos repetidos
  const combinados = [...resultadosLocais];
  resultadosOnline.forEach((online) => {
    const jaExiste = combinados.some((local) => normalizar(local.titulo) === normalizar(online.titulo));
    if (!jaExiste) combinados.push(online);
  });

  return combinados.slice(0, 8);
}
