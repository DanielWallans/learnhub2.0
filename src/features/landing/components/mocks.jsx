import { BookOpen, Briefcase, Flame, Wallet, TrendingUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Widgets ilustrativos usados na landing. Os valores são de exemplo.

export function Panel({ className, children }) {
  return (
    <div className={cn("rounded-xl border border-ink-700/70 bg-ink-900 p-4", className)}>
      {children}
    </div>
  );
}

function PanelLabel({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 text-xs text-ink-300">
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      <span>{children}</span>
    </div>
  );
}

const weeklySpend = [42, 68, 35, 80, 54, 22, 61];

export function FinanceWidget({ className }) {
  const max = Math.max(...weeklySpend);
  return (
    <Panel className={className}>
      <PanelLabel icon={Wallet}>Saldo do mês</PanelLabel>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-2xl tracking-tight text-ink-50 tabular-nums">R$ 1.284,50</p>
          <p className="mt-1 flex items-center gap-1 font-mono text-xs text-lime">
            <TrendingUp className="h-3 w-3" /> +R$ 210 guardados
          </p>
        </div>
        <div className="flex h-12 items-end gap-1">
          {weeklySpend.map((v, i) => (
            <span
              key={i}
              className={cn("w-2 rounded-sm", i === 3 ? "bg-lime" : "bg-ink-600")}
              style={{ height: `${(v / max) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </Panel>
  );
}

export function ReadingWidget({ className }) {
  return (
    <Panel className={className}>
      <PanelLabel icon={BookOpen}>Lendo agora</PanelLabel>
      <div className="mt-3 flex gap-3">
        <div className="flex h-16 w-11 shrink-0 items-end rounded-[3px] bg-gradient-to-b from-ink-600 to-ink-700 p-1.5">
          <span className="h-0.5 w-full bg-ink-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink-50">O Programador Pragmático</p>
          <p className="mt-0.5 font-mono text-xs text-ink-400">pág. 212 de 330</p>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-ink-700">
            <div className="h-full w-[64%] rounded-full bg-ink-100" />
          </div>
        </div>
      </div>
    </Panel>
  );
}

// 16 semanas x 7 dias. Nível 0-3 = quantos hábitos foram cumpridos no dia.
// Gerado de forma determinística para não mudar a cada render.
const WEEKS = 16;
const habitLevels = Array.from({ length: WEEKS * 7 }, (_, i) => {
  const n = Math.sin(i * 12.9898) * 43758.5453;
  const r = n - Math.floor(n);
  const ramp = i / (WEEKS * 7); // mais constante nas semanas recentes
  return r + ramp * 0.6 > 1.05 ? 3 : r + ramp * 0.6 > 0.75 ? 2 : r > 0.35 ? 1 : 0;
});
const levelClass = ["bg-ink-800", "bg-lime/25", "bg-lime/55", "bg-lime"];

export function HabitsWidget({ className }) {
  return (
    <Panel className={className}>
      <div className="flex items-center justify-between">
        <PanelLabel icon={Flame}>Hábitos</PanelLabel>
        <span className="font-mono text-xs text-ink-50">12 dias seguidos</span>
      </div>
      <div className="mt-4 grid grid-flow-col grid-rows-7 justify-start gap-[3px]">
        {habitLevels.map((level, i) => (
          <span key={i} className={cn("h-2.5 w-2.5 rounded-[2px]", levelClass[level])} />
        ))}
      </div>
    </Panel>
  );
}

const stages = [
  { name: "Enviado", count: 7 },
  { name: "Prova", count: 3 },
  { name: "Entrevista", count: 2 },
  { name: "Aprovado", count: 1 },
];

export function CareerWidget({ className }) {
  return (
    <Panel className={className}>
      <PanelLabel icon={Briefcase}>Candidaturas</PanelLabel>
      <ol className="mt-3 space-y-2">
        {stages.map((s, i) => (
          <li key={s.name} className="flex items-center gap-3 text-sm">
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full border",
                i < 3 ? "border-ink-300 bg-ink-100 text-ink-950" : "border-lime bg-lime text-ink-950"
              )}
            >
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
            <span className="flex-1 text-ink-200">{s.name}</span>
            <span className="font-mono text-xs text-ink-400 tabular-nums">{s.count}</span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
