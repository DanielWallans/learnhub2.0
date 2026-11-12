import { lazy, Suspense, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { AppPreview } from "@/features/landing/components/AppPreview";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

// O Three.js é pesado: carrega depois do texto
const ParticleField = lazy(() => import("@/features/landing/components/ParticleField"));

export function Hero() {
  const root = useRef(null);
  const title = useRef(null);
  const preview = useRef(null);
  const progress = useRef(0);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress;
        },
      });

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        SplitText.create(title.current, {
          type: "words",
          mask: "words",
          wordsClass: "hero-word",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.words, {
              yPercent: 110,
              duration: 1,
              ease: "expo.out",
              stagger: 0.045,
              delay: 0.1,
              onComplete: () => self.revert(),
            }),
        });

        gsap.from(".hero-fade", {
          y: 14,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          delay: 0.55,
        });

        gsap.fromTo(
          preview.current,
          { rotateX: 24, y: 40, scale: 0.94, opacity: 0.4 },
          {
            rotateX: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: preview.current,
              start: "top bottom",
              end: "top 25%",
              scrub: true,
            },
          }
        );
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative overflow-hidden">
      {/* O canvas fica preso na tela enquanto o hero rola, para a malha virar esfera à vista */}
      <div className="pointer-events-none absolute inset-0">
        <div className="sticky top-0 h-[100svh]">
          <Suspense fallback={null}>
            <ParticleField progressRef={progress} className="absolute inset-0" />
          </Suspense>
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/85 via-ink-950/30 to-transparent" />
        </div>
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-5 pb-16 pt-28 sm:px-8">
        <div className="hero-fade mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-ink-700 bg-ink-900/70 px-3 py-1 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-lime" />
          <span className="font-mono text-xs text-ink-200">Gratuito para estudantes</span>
        </div>

        <h1
          ref={title}
          className="max-w-4xl text-[clamp(2.6rem,7.2vw,6.25rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-ink-50"
        >
          Estudos, grana, hábitos e carreira.{" "}
          <span className="text-ink-400">Num painel só.</span>
        </h1>

        <p className="hero-fade mt-8 max-w-xl text-base leading-relaxed text-ink-300 sm:text-lg">
          O LearnHub junta o livro que você está lendo, o saldo do mês, os hábitos da semana e as
          vagas em que você se inscreveu. Sincronizado no computador e no celular.
        </p>

        <div className="hero-fade mt-10 flex flex-wrap items-center gap-3">
          <MagneticButton to="/cadastro-aluno" className="bg-lime text-ink-950 hover:bg-[#D4FF4A]">
            Criar conta grátis
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </MagneticButton>
          <Link
            to="/login"
            className="rounded-lg border border-ink-700 px-5 py-3 text-sm text-ink-100 transition-colors hover:border-ink-500 hover:bg-ink-900"
          >
            Já tenho conta
          </Link>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pb-28 sm:px-8 [perspective:1400px]">
        <div ref={preview} className="origin-top [transform-style:preserve-3d]">
          <AppPreview />
        </div>
      </div>
    </section>
  );
}
