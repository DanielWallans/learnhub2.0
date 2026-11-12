import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

// Botão que acompanha levemente o cursor (inspirado nos botões do Skiper UI)
export function MagneticButton({ to, className, children, strength = 0.25 }) {
  const ref = useRef(null);
  const x = useSpring(useMotionValue(0), { stiffness: 300, damping: 20, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 300, damping: 20, mass: 0.4 });

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <MotionLink
      ref={ref}
      to={to}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x, y }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium transition-colors",
        className
      )}
    >
      {children}
    </MotionLink>
  );
}
