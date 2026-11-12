import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Cover({ livro, className }) {
  return livro.capa ? (
    <img src={livro.capa} alt={livro.titulo} className={cn('h-full w-full object-cover', className)} />
  ) : (
    <div className={cn('flex h-full w-full items-center justify-center bg-ink-800 text-ink-500', className)}>
      <Bookmark className="h-6 w-6" />
    </div>
  );
}
