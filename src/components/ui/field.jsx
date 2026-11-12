import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Controles de formulário no estilo do Origin UI, adaptados ao tema escuro

const control =
  "w-full rounded-lg border border-ink-700 bg-ink-900 text-base text-ink-50 sm:text-sm placeholder:text-ink-500 " +
  "transition-[border-color,box-shadow] focus:border-ink-400 focus:outline-none focus:ring-4 focus:ring-lime/10 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export function Label({ className, ...props }) {
  return <label className={cn("text-[13px] font-medium text-ink-200", className)} {...props} />;
}

export function Field({ label, hint, error, className, children, htmlFor }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {error ? (
        <p className="text-xs text-ink-50">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef(function Input({ className, icon: Icon, trailing, ...props }, ref) {
  if (!Icon && !trailing) {
    return <input ref={ref} className={cn(control, "h-11 px-3 sm:h-10", className)} {...props} />;
  }
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      )}
      <input
        ref={ref}
        className={cn(control, "h-11 sm:h-10", Icon ? "pl-9" : "pl-3", trailing ? "pr-10" : "pr-3", className)}
        {...props}
      />
      {trailing && <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</div>}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ className, rows = 3, ...props }, ref) {
  return <textarea ref={ref} rows={rows} className={cn(control, "resize-y px-3 py-2.5 leading-relaxed", className)} {...props} />;
});

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(control, "h-11 appearance-none pl-3 pr-9 sm:h-10", className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
    </div>
  );
});

// Campo com label já associado ao input
export function TextField({ label, hint, error, className, ...inputProps }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error} className={className} htmlFor={id}>
      <Input id={id} {...inputProps} />
    </Field>
  );
}
