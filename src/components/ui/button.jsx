import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

const variants = {
  primary: "bg-lime text-ink-950 hover:bg-[#D4FF4A] disabled:hover:bg-lime",
  secondary: "bg-ink-50 text-ink-950 hover:bg-white",
  outline: "border border-ink-700 text-ink-100 hover:border-ink-500 hover:bg-ink-850",
  ghost: "text-ink-300 hover:bg-ink-800 hover:text-ink-50",
  // Sem cor extra: ações destrutivas usam contraste e ícone, não vermelho
  danger: "border border-ink-700 text-ink-200 hover:border-ink-50 hover:bg-ink-50 hover:text-ink-950",
};

const sizes = {
  sm: "h-8 gap-1.5 rounded-md px-3 text-xs [@media(pointer:coarse)]:h-10 [@media(pointer:coarse)]:px-3.5",
  md: "h-10 gap-2 rounded-lg px-4 text-sm [@media(pointer:coarse)]:h-11",
  lg: "h-12 gap-2 rounded-lg px-5 text-sm",
  icon: "h-9 w-9 rounded-lg [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:w-11",
  "icon-sm": "h-7 w-7 rounded-md [@media(pointer:coarse)]:h-10 [@media(pointer:coarse)]:w-10",
};

export function buttonClasses({ variant = "primary", size = "md", className } = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "[&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
    variants[variant],
    sizes[size],
    className
  );
}

export const Button = forwardRef(function Button(
  { variant, size, className, loading = false, disabled, children, type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={buttonClasses({ variant, size, className })}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
});

export function ButtonLink({ to, variant, size, className, children, ...props }) {
  return (
    <Link to={to} className={buttonClasses({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
