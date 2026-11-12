import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }) {
  return (
    <div className={cn("rounded-2xl border border-ink-800 bg-ink-900", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action, icon: Icon, className }) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-ink-400" />}
          <h3 className="text-sm font-medium text-ink-50">{title}</h3>
        </div>
        {description && <p className="mt-1 text-xs text-ink-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

const badgeTones = {
  default: "border-ink-700 bg-ink-850 text-ink-200",
  accent: "border-lime/30 bg-lime/10 text-lime",
  solid: "border-ink-50 bg-ink-50 text-ink-950",
  muted: "border-ink-800 bg-transparent text-ink-400",
};

export function Badge({ tone = "default", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-none [&_svg]:h-3 [&_svg]:w-3",
        badgeTones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Progress({ value = 0, className, tone = "accent" }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-ink-800", className)}>
      <motion.div
        className={cn("h-full rounded-full", tone === "accent" ? "bg-lime" : "bg-ink-100")}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 24 }}
      />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-start px-1 py-10", className)}>
      {Icon && <Icon className="mb-4 h-6 w-6 text-ink-500" strokeWidth={1.5} />}
      <h3 className="text-lg font-medium tracking-tight text-ink-50">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// Seção aberta: sem caixa, só um filete no topo e o título
export function Section({ title, description, icon: Icon, action, className, children }) {
  return (
    <section className={cn("border-t border-ink-800 pt-5", className)}>
      {(title || action) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-sm font-medium text-ink-50">
              {Icon && <Icon className="h-4 w-4 text-ink-400" />}
              {title}
            </h2>
            {description && <p className="mt-1 text-xs text-ink-500">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

// Números grandes lado a lado, separados por um filete (sem moldura)
export function StatRow({ items, className }) {
  return (
    <dl className={cn("grid grid-cols-2 gap-y-6 sm:grid-flow-col sm:auto-cols-fr", className)}>
      {items.map((s) => (
        <div key={s.label} className="border-l border-ink-800 pl-4 pr-2">
          <dt className="text-xs text-ink-400">{s.label}</dt>
          <dd className={cn("mt-2 font-mono text-3xl tracking-tight tabular-nums", s.accent ? "text-lime" : "text-ink-50")}>
            {s.value}
          </dd>
          {s.hint && <p className="mt-1 text-xs text-ink-500">{s.hint}</p>}
        </div>
      ))}
    </dl>
  );
}

// Abas com indicador animado (layoutId do Motion)
export function Segmented({ value, onChange, options, layoutId, className, size = "md" }) {
  return (
    <div className={cn("inline-flex rounded-lg border border-ink-800 bg-ink-900 p-0.5", className)} role="tablist">
      {options.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors",
              size === "sm" ? "px-2.5 py-1 text-xs [@media(pointer:coarse)]:px-3 [@media(pointer:coarse)]:py-2" : "px-3 py-1.5 text-sm [@media(pointer:coarse)]:py-2.5",
              active ? "text-ink-950" : "text-ink-400 hover:text-ink-100"
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-md bg-ink-50"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {opt.label}
              {opt.count !== undefined && (
                <span className={cn("font-mono text-[11px]", active ? "text-ink-600" : "text-ink-500")}>{opt.count}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Avatar({ src, name, className }) {
  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return src ? (
    <img src={src} alt={name || "Foto de perfil"} className={cn("h-9 w-9 rounded-full object-cover", className)} />
  ) : (
    <span
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-ink-700 text-xs font-medium text-ink-50",
        className
      )}
    >
      {initials}
    </span>
  );
}

