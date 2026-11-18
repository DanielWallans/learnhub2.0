import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { encontrarCapa, pareceCapaVazia } from '@/features/leitura/lib/busca';

// Uma busca por livro durante a sessão, compartilhada entre a grade, a lista e o painel
const cache = new Map();

function resolverCapa(livro) {
  const chave = livro.id || `${livro.titulo}|${livro.autor}`;
  if (!cache.has(chave)) {
    cache.set(
      chave,
      encontrarCapa({ titulo: livro.titulo, autor: livro.autor, isbn: livro.isbn, linkCompra: livro.linkCompra })
        .then((r) => r.capa || '')
        .catch(() => '')
    );
  }
  return cache.get(chave);
}

/**
 * Capa do livro. Se não houver imagem, ou se a salva não carregar (link quebrado,
 * "image not available" do Google, GIF vazio da Amazon), procura outra pelo ISBN,
 * link de compra ou título. `onCapaEncontrada` permite salvar a capa nova no livro.
 */
export function Cover({ livro, className, onCapaEncontrada }) {
  const [src, setSrc] = useState(livro.capa || '');
  const [falhou, setFalhou] = useState(!livro.capa);

  useEffect(() => {
    setSrc(livro.capa || '');
    setFalhou(!livro.capa);
  }, [livro.capa]);

  useEffect(() => {
    if (!falhou || !livro.titulo) return undefined;
    let ativo = true;
    resolverCapa(livro).then((capa) => {
      if (!ativo || !capa || capa === src) return;
      setSrc(capa);
      setFalhou(false);
      if (onCapaEncontrada && capa !== livro.capa) onCapaEncontrada(livro, capa);
    });
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [falhou, livro.id, livro.titulo]);

  if (src && !falhou) {
    return (
      <img
        src={src}
        alt={livro.titulo}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFalhou(true)}
        onLoad={(e) => {
          if (pareceCapaVazia(src, e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)) setFalhou(true);
        }}
        className={cn('h-full w-full object-cover', className)}
      />
    );
  }

  return (
    <div className={cn('flex h-full w-full items-center justify-center bg-ink-800 text-ink-500', className)}>
      <Bookmark className="h-6 w-6" />
    </div>
  );
}
