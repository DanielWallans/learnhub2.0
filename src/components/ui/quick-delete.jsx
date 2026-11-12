import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// "x" pequeno para excluir um item direto da lista ou do mapa.
// Aparece no hover do elemento pai (classe "group"); em telas de toque fica sempre visível.
export function QuickDelete({ onClick, label = "Excluir", className }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      title={label}
      className={cn(
        "relative flex h-5 w-5 items-center justify-center rounded-full before:absolute before:-inset-2.5 before:content-[''] [@media(pointer:coarse)]:h-7 [@media(pointer:coarse)]:w-7 border border-ink-600 bg-ink-950 text-ink-300 shadow-md transition-[opacity,colors,transform]",
        "opacity-0 hover:scale-110 hover:border-ink-50 hover:bg-ink-50 hover:text-ink-950 focus-visible:opacity-100 group-hover:opacity-100",
        "[@media(hover:none)]:opacity-100",
        className
      )}
    >
      <X className="h-3 w-3" strokeWidth={2.5} />
    </button>
  );
}
