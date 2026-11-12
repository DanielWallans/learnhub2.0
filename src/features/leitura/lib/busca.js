import { MOCK_LIVROS_DB } from '@/features/leitura/data/livros';

// Busca na Open Library (alternativa quando o Google Books falha)
export const buscarOpenLibrary = async (q) => {
  try {
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=6`);
    if (response.ok) {
      const data = await response.json();
      if (data.docs) {
        return data.docs.map((item, idx) => ({
          id: item.key || `ol-${idx}-${Date.now()}`,
          titulo: item.title || 'Sem título',
          autor: item.author_name ? item.author_name.join(', ') : 'Autor desconhecido',
          descricao: item.first_sentence ? item.first_sentence.join(' ') : '',
          paginasTotal: item.number_of_pages_median || item.number_of_pages || 0,
          capa: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : '',
          categoria: item.subject ? item.subject[0] : 'Geral'
        }));
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
  // 1. Base local
  const queryLimpa = q.toLowerCase().trim();
  const resultadosLocais = MOCK_LIVROS_DB.filter(livro =>
    livro.titulo.toLowerCase().includes(queryLimpa) ||
    livro.autor.toLowerCase().includes(queryLimpa)
  ).map((livro, idx) => ({ id: `local-mock-${idx}-${Date.now()}`, ...livro }));

  // 2. Google Books, com Open Library como alternativa
  let resultadosOnline = [];
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=6&langRestrict=pt`
    );
    if (response.ok) {
      const data = await response.json();
      if (data.items) {
        resultadosOnline = data.items.map(item => {
          const info = item.volumeInfo;
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
            categoria: info.categories ? info.categories[0] : 'Geral'
          };
        });
      }
    } else {
      resultadosOnline = await buscarOpenLibrary(q);
    }
  } catch (error) {
    resultadosOnline = await buscarOpenLibrary(q);
  }

  // Mescla priorizando os locais e remove títulos repetidos
  const combinados = [...resultadosLocais];
  resultadosOnline.forEach(online => {
    const jaExiste = combinados.some(local =>
      local.titulo.toLowerCase().trim() === online.titulo.toLowerCase().trim()
    );
    if (!jaExiste) combinados.push(online);
  });

  return combinados.slice(0, 8);
}

// Tenta achar a capa de um livro pelo título no Google Books
export async function buscarCapaPorTitulo(titulo) {
  try {
    const resp = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(titulo)}&maxResults=1&langRestrict=pt`
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    const links = data.items && data.items[0].volumeInfo.imageLinks;
    if (!links) return null;
    return (links.thumbnail || links.smallThumbnail || '').replace(/^http:/i, 'https:');
  } catch (err) {
    return null;
  }
}
