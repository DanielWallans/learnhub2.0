import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Field, Input, Textarea, TextField } from '@/components/ui/field';
import { CATEGORIAS } from '@/features/tarefas/lib/constants';
import { amanhaIso, hojeIso } from '@/features/tarefas/lib/datas';

const chip = (ativo) =>
  cn(
    'rounded-full border px-3 py-1.5 text-xs transition-colors [@media(pointer:coarse)]:py-2',
    ativo ? 'border-ink-50 bg-ink-50 text-ink-950' : 'border-ink-700 text-ink-300 hover:border-ink-500 hover:text-ink-50'
  );

// Formulário completo de uma tarefa (usado para criar com detalhes e para editar)
export function TaskForm({ id, value, onChange, onSubmit }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  const atalhos = [
    { label: 'Hoje', data: hojeIso() },
    { label: 'Amanhã', data: amanhaIso() },
    { label: 'Sem data', data: '' },
  ];

  return (
    <form id={id} onSubmit={onSubmit} className="flex flex-col gap-5">
      <TextField label="Tarefa" placeholder="Estudar Java, entrevista, supermercado..." value={value.titulo} onChange={set('titulo')} required autoFocus />

      <Field label="Quando">
        <div className="flex flex-wrap items-center gap-1.5">
          {atalhos.map((a) => (
            <button key={a.label} type="button" onClick={() => onChange({ ...value, data: a.data })} className={chip(value.data === a.data)}>
              {a.label}
            </button>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Input type="date" value={value.data} onChange={set('data')} aria-label="Data" />
          <Input type="time" value={value.hora} onChange={set('hora')} aria-label="Horário" />
        </div>
      </Field>

      <Field label="Categoria">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIAS.map((c) => {
            const Icone = c.icone;
            return (
              <button key={c.valor} type="button" onClick={() => onChange({ ...value, categoria: c.valor })} className={cn(chip(value.categoria === c.valor), 'flex items-center gap-1.5')}>
                <Icone className="h-3.5 w-3.5" /> {c.valor}
              </button>
            );
          })}
        </div>
      </Field>

      <button
        type="button"
        onClick={() => onChange({ ...value, importante: !value.importante })}
        className={cn(
          'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
          value.importante ? 'border-lime/40 bg-lime/10 text-ink-50' : 'border-ink-700 text-ink-300 hover:border-ink-500'
        )}
      >
        <Star className={cn('h-4 w-4', value.importante ? 'fill-lime text-lime' : 'text-ink-500')} />
        <span className="flex-1">Importante</span>
        <span className="text-xs text-ink-500">aparece primeiro na lista</span>
      </button>

      <Field label="Anotações" hint="Opcional">
        <Textarea rows={3} placeholder="Endereço, link, o que levar..." value={value.notas} onChange={set('notas')} />
      </Field>
    </form>
  );
}
