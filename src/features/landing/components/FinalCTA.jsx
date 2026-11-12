import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function FinalCTA() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".cta-word",
          { yPercent: 40, opacity: 0.15 },
          {
            yPercent: 0,
            opacity: 1,
            stagger: 0.12,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top 80%", end: "top 35%", scrub: true },
          }
        );
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative overflow-hidden border-t border-ink-800">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1C1C21_1px,transparent_1px),linear-gradient(to_bottom,#1C1C21_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-5 py-32 text-center sm:px-8">
        <h2 className="mx-auto max-w-4xl text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-ink-50">
          {["Comece", "o", "semestre", "organizado."].map((w) => (
            <span key={w} className="cta-word mr-[0.22em] inline-block last:mr-0">
              {w}
            </span>
          ))}
        </h2>
        <p className="mx-auto mt-6 max-w-md text-ink-300">
          Crie a conta, adicione o primeiro livro e registre o saldo. Leva poucos minutos.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <MagneticButton to="/cadastro-aluno" className="bg-lime text-ink-950 hover:bg-[#D4FF4A]">
            Criar conta grátis
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </MagneticButton>
          <Link to="/login" className="px-4 py-3 text-sm text-ink-300 transition-colors hover:text-ink-50">
            Entrar
          </Link>
        </div>
      </div>
    </section>
  );
}
