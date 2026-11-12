import { cn } from "@/lib/utils";

export function Spinner({ className }) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent",
        className
      )}
    />
  );
}
