import { useRef } from "react";
import { cn } from "@/lib/utils";

// Card com borda e brilho que seguem o cursor (inspirado no Cult UI)
export function SpotlightCard({ className, children }) {
  const ref = useRef(null);

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--x", `${e.clientX - rect.left}px`);
    ref.current.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={cn(
        "group relative rounded-2xl bg-ink-800/60 p-px",
        "[background-image:radial-gradient(320px_circle_at_var(--x,50%)_var(--y,50%),rgba(198,244,50,0.35),transparent_60%)]",
        className
      )}
    >
      <div className="relative h-full overflow-hidden rounded-[15px] bg-ink-900">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background-image:radial-gradient(400px_circle_at_var(--x,50%)_var(--y,50%),rgba(198,244,50,0.06),transparent_60%)]" />
        <div className="relative h-full">{children}</div>
      </div>
    </div>
  );
}
