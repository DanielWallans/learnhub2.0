import { Plus, Lightbulb, Trash2, Play, Pause, Pencil, Target, Calendar, Minus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge, Progress } from '@/components/ui/primitives';
import { DICAS, getSkillIcon, formatData } from '@/features/habilidades/lib/constants';

export function SkillDetail({ skill, onProgress, onToggle, onEdit, onDelete }) {
  const Icon = getSkillIcon(skill.nome);
  const dicas = (DICAS[skill.categoria] || DICAS.Estudo)[skill.nivel] || DICAS.Estudo.Iniciante;
  const progresso = skill.progresso || 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', progresso >= 75 ? 'bg-lime text-ink-950' : 'bg-ink-800 text-ink-100')}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-medium leading-snug tracking-tight text-ink-50">{skill.nome}</h2>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge>{skill.categoria}</Badge>
            <Badge tone={progresso >= 75 ? 'accent' : 'default'}>{skill.nivel}</Badge>
            {!skill.ativo && <Badge tone="muted"><Pause /> Pausada</Badge>}
          </div>
        </div>
      </div>

      {skill.descricao && <p className="text-sm leading-relaxed text-ink-300">{skill.descricao}</p>}

      <div>
        <div className="flex items-end justify-between">
          <span className="text-sm text-ink-300">Domínio</span>
          <span className="font-mono text-5xl tracking-[-0.04em] text-ink-50 tabular-nums">{progresso}%</span>
        </div>
        <Progress value={progresso} className="mt-3 h-2" />
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => onProgress(skill.id, -10)} disabled={progresso <= 0}>
            <Minus /> 10%
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onProgress(skill.id, 10)} disabled={progresso >= 100}>
            <Plus /> 10%
          </Button>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-5 text-sm">
        <div className="col-span-2 border-l border-ink-800 pl-3">
          <dt className="flex items-center gap-1.5 text-xs text-ink-400"><Target className="h-3.5 w-3.5" /> Meta</dt>
          <dd className="mt-1 text-ink-100">{skill.meta || 'Sem meta definida'}</dd>
        </div>
        <div className="border-l border-ink-800 pl-3">
          <dt className="flex items-center gap-1.5 text-xs text-ink-400"><Calendar className="h-3.5 w-3.5" /> Início</dt>
          <dd className="mt-1 font-mono text-ink-100">{formatData(skill.dataInicio)}</dd>
        </div>
        <div className="border-l border-ink-800 pl-3">
          <dt className="text-xs text-ink-400">Prazo · {skill.prazo || '1 mês'}</dt>
          <dd className="mt-1 font-mono text-ink-100">{formatData(skill.dataConclusao)}</dd>
        </div>
      </dl>

      <div>
        <h3 className="flex items-center gap-1.5 text-sm font-medium text-ink-50">
          <Lightbulb className="h-4 w-4 text-lime" /> Próximos passos
        </h3>
        <ul className="mt-3 flex flex-col gap-2">
          {dicas.map((d) => (
            <li key={d} className="flex gap-2.5 text-sm leading-relaxed text-ink-300">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-500" /> {d}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-ink-800 pt-4">
        <Button variant="outline" size="sm" onClick={() => onEdit(skill)}><Pencil /> Editar</Button>
        <Button variant="outline" size="sm" onClick={() => onToggle(skill.id)}>
          {skill.ativo ? <><Pause /> Pausar</> : <><Play /> Retomar</>}
        </Button>
        <Button variant="danger" size="sm" className="ml-auto" onClick={() => onDelete(skill.id)}><Trash2 /> Excluir</Button>
      </div>
    </div>
  );
}
