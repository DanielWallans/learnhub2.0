import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Field, Input, Select, Textarea, TextField } from '@/components/ui/field';
import { AREAS, MODELOS, PRIORIDADES, STATUS, area as areaDe } from '@/features/projetos/lib/constants';

// Formulário de criar/editar. Na criação, o modelo escolhido já traz a área e as etapas.
export function ProjectForm({ id, value, onChange, onSubmit, criando, modelo, onModelo }) {
  const [tag, setTag] = useState('');
  const set = (campo) => (e) => onChange({ ...value, [campo]: e.target.value });

  const addTag = () => {
    const t = tag.trim().replace(/^#/, '').toLowerCase();
    if (t && !(value.tags || []).includes(t)) onChange({ ...value, tags: [...(value.tags || []), t] });
    setTag('');
  };

  return (
    <form id={id} onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      {criando && (
        <Field label="Começar a partir de" className="sm:col-span-2" hint="O modelo já cria as etapas mais comuns. Dá para editar tudo depois.">
          <div className="flex flex-wrap gap-1.5">
            {MODELOS.map((m) => {
              const Icone = areaDe(m.area).icone;
              const ativo = modelo === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onModelo(m)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors',
                    ativo ? 'border-ink-50 bg-ink-50 text-ink-950' : 'border-ink-700 text-ink-300 hover:border-ink-500 hover:text-ink-50'
                  )}
                >
                  <Icone className="h-3.5 w-3.5" /> {m.nome}
                  {m.etapas.length > 0 && <span className={cn('font-mono text-[10px]', ativo ? 'text-ink-600' : 'text-ink-500')}>{m.etapas.length}</span>}
                </button>
              );
            })}
          </div>
        </Field>
      )}

      <TextField
        className="sm:col-span-2"
        label="Nome do projeto"
        placeholder="App de receitas, TCC, reforma do quarto, viagem de férias..."
        value={value.nome}
        onChange={set('nome')}
        autoFocus={!criando}
        required
      />

      <Field label="Descrição" className="sm:col-span-2">
        <Textarea rows={2} placeholder="Do que se trata, em poucas linhas" value={value.descricao} onChange={set('descricao')} />
      </Field>

      <TextField
        className="sm:col-span-2"
        label="Objetivo (como saber que terminou)"
        placeholder="Ex.: app publicado na loja com 10 pessoas usando"
        value={value.objetivo}
        onChange={set('objetivo')}
      />

      <Field label="Área">
        <Select value={value.area} onChange={set('area')}>
          {AREAS.map((a) => (
            <option key={a.valor} value={a.valor}>{a.valor}</option>
          ))}
        </Select>
      </Field>
      <Field label="Status">
        <Select value={value.status} onChange={set('status')}>
          {STATUS.map((s) => (
            <option key={s.valor} value={s.valor}>{s.curto}</option>
          ))}
        </Select>
      </Field>

      <Field label="Prioridade">
        <Select value={value.prioridade} onChange={set('prioridade')}>
          {PRIORIDADES.map((p) => (
            <option key={p.valor} value={p.valor}>{p.nome}</option>
          ))}
        </Select>
      </Field>
      <TextField label="Orçamento previsto (R$)" type="number" min="0" step="0.01" placeholder="0,00" value={value.orcamento || ''} onChange={set('orcamento')} />

      <TextField label="Início" type="date" value={value.dataInicio} onChange={set('dataInicio')} />
      <TextField label="Prazo" type="date" value={value.prazo} onChange={set('prazo')} />

      <Field label="Etiquetas" className="sm:col-span-2" hint="Enter para adicionar. Ex.: faculdade, freela, portfólio">
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-ink-700 bg-ink-900 px-2 py-1.5 focus-within:border-ink-500">
          {(value.tags || []).map((t) => (
            <span key={t} className="flex items-center gap-1 rounded-md bg-ink-800 py-0.5 pl-2 pr-1 text-xs text-ink-100">
              #{t}
              <button
                type="button"
                onClick={() => onChange({ ...value, tags: value.tags.filter((x) => x !== t) })}
                className="rounded p-0.5 text-ink-400 hover:text-ink-50"
                aria-label={`Remover etiqueta ${t}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <Input
            className="h-8 min-w-[120px] flex-1 border-0 bg-transparent px-1 focus:ring-0 sm:h-8"
            placeholder={(value.tags || []).length ? '' : 'faculdade, freela...'}
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addTag();
              } else if (e.key === 'Backspace' && !tag && (value.tags || []).length) {
                onChange({ ...value, tags: value.tags.slice(0, -1) });
              }
            }}
            onBlur={addTag}
          />
        </div>
      </Field>
    </form>
  );
}
