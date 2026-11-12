import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGroup, motion, useMotionValue, useSpring } from "motion/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, ArrowRight, CornerDownLeft, RotateCcw } from "lucide-react";
import { clearCardTransition, peekCardTransition } from "@/components/layout/cardTransition";
import { TOTAL_MODULOS } from "@/components/layout/nav";

gsap.registerPlugin(SplitText, useGSAP);

// Moldura dos módulos: tela de entrada (foto + frase + botão) que se transforma
// no banner do topo do painel. A mesma foto é um único elemento (layoutId) nas duas telas.

function Cover({ id, image, alt, radius, parallax }) {
  return (
    <motion.div
      layoutId={`module-cover-${id}`}
      className="absolute inset-0 overflow-hidden bg-ink-900"
      style={{ borderRadius: radius }}
      transition={{ type: "spring", stiffness: 140, damping: 26 }}
    >
      <motion.img
        layout
        src={image}
        alt={alt}
        className="module-cover-img absolute inset-0 h-full w-full object-cover"
        style={parallax}
        draggable={false}
      />
    </motion.div>
  );
}

function Intro({ id, index, image, title, phrase, cta, stats, onEnter }) {
  const root = useRef(null);
  const titleRef = useRef(null);
  const leaving = useRef(false);

  // Paralaxe leve da foto acompanhando o mouse
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 60, damping: 20 });
  const y = useSpring(my, { stiffness: 60, damping: 20 });

  const handleMove = (e) => {
    const rect = root.current.getBoundingClientRect();
    mx.set(((e.clientX - rect.left) / rect.width - 0.5) * -24);
    my.set(((e.clientY - rect.top) / rect.height - 0.5) * -16);
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Veio de um card do Painel: a tela nasce do tamanho do card e se expande
        const from = peekCardTransition(id);
        let atraso = 0;
        if (from) {
          const s = root.current.getBoundingClientRect();
          const inicio = `inset(${from.top - s.top}px ${s.right - from.right}px ${s.bottom - from.bottom}px ${from.left - s.left}px round 16px)`;
          gsap.fromTo(
            root.current,
            { clipPath: inicio },
            {
              clipPath: "inset(0px 0px 0px 0px round 0px)",
              duration: 1,
              ease: "expo.inOut",
              onComplete: () => {
                gsap.set(root.current, { clearProps: "clipPath" });
                clearCardTransition();
              },
            }
          );
          atraso = 0.8;
        }

        gsap.fromTo(".module-cover-img", { scale: from ? 1.45 : 1.25 }, { scale: 1.08, duration: 2.4, ease: "expo.out" });
        SplitText.create(titleRef.current, {
          type: "chars",
          mask: "chars",
          charsClass: "intro-char",
          onSplit: (self) =>
            gsap.from(self.chars, { yPercent: 105, duration: 1.1, ease: "expo.out", stagger: 0.035, delay: 0.15 + atraso }),
        });
        gsap.from(".intro-fade", { y: 18, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.07, delay: 0.45 + atraso });
        gsap.from(".intro-line", { scaleX: 0, duration: 1.4, ease: "expo.inOut", delay: 0.2 + atraso });
      });
    },
    { scope: root }
  );

  const enter = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return onEnter();
    gsap.to(root.current.querySelectorAll(".intro-fade, .intro-title"), {
      y: -24,
      opacity: 0,
      duration: 0.35,
      ease: "power2.in",
      stagger: 0.03,
      onComplete: onEnter,
    });
  }, [onEnter]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter" && !e.target?.closest?.("input, textarea, select, button, a")) enter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enter]);

  return (
    <section
      ref={root}
      onMouseMove={handleMove}
      className="fixed inset-0 z-30 overflow-hidden bg-ink-950 lg:left-60"
    >
      <Cover id={id} image={image} alt={title} radius={0} parallax={{ x, y }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/20" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-950/80 via-transparent to-transparent" />

      <div className="relative flex h-full flex-col px-5 pb-32 pt-5 sm:px-10 lg:pb-12 lg:pt-8">
        <div className="intro-fade flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-ink-50/15 bg-ink-950/40 px-3 py-1.5 text-sm text-ink-100 backdrop-blur-md transition-colors hover:bg-ink-950/70"
          >
            <ArrowLeft className="h-4 w-4" /> Painel
          </Link>
          <span className="rounded-lg border border-ink-50/15 bg-ink-950/50 px-2.5 py-1.5 font-mono text-xs text-ink-200 backdrop-blur-md">
            <span className="text-lime">{index}</span> / {TOTAL_MODULOS}
          </span>
        </div>

        <div className="mt-auto max-w-5xl">
          <div className="intro-fade mb-5 flex items-center gap-3">
            <span className="intro-line h-px w-10 origin-left bg-lime" />
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-ink-200">Módulo {index}</span>
          </div>

          <h1
            ref={titleRef}
            className="intro-title text-[clamp(3.4rem,12vw,10.5rem)] font-semibold leading-[0.86] tracking-[-0.06em] text-ink-50"
          >
            {title}
          </h1>

          <p className="intro-fade mt-6 max-w-lg text-base leading-relaxed text-ink-200 sm:text-lg">{phrase}</p>

          {stats?.length > 0 && (
            <dl className="intro-fade mt-8 flex flex-wrap gap-x-10 gap-y-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-xs text-ink-400">{s.label}</dt>
                  <dd className="mt-1 font-mono text-2xl tracking-tight text-ink-50 tabular-nums">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="intro-fade mt-10 flex items-center gap-4">
            <motion.button
              onClick={enter}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex h-12 items-center gap-2 rounded-lg bg-lime px-6 text-sm font-medium text-ink-950 transition-colors hover:bg-[#D4FF4A]"
            >
              {cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </motion.button>
            <span className="hidden items-center gap-1.5 text-xs text-ink-400 sm:flex">
              ou aperte
              <kbd className="inline-flex items-center gap-1 rounded border border-ink-50/20 px-1.5 py-0.5 font-mono text-[10px] text-ink-200">
                Enter <CornerDownLeft className="h-2.5 w-2.5" />
              </kbd>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Banner({ id, image, title, phrase, actions, onReplay }) {
  return (
    <div className="relative">
      <Cover id={id} image={image} alt={title} radius={16} />
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-ink-950/95 via-ink-950/75 to-ink-950/40" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-ink-50/10" />

      <motion.div
        className="relative flex min-h-[11rem] flex-col justify-end gap-4 p-5 pt-14 sm:min-h-[13rem] sm:flex-row sm:items-end sm:justify-between sm:p-7"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-xl">
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-ink-50 sm:text-4xl">{title}</h1>
          <p className="mt-1.5 line-clamp-2 text-sm text-ink-300">{phrase}</p>
        </div>
        {actions && (
          <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto [&>button]:flex-1 [&>button]:backdrop-blur-md sm:[&>button]:flex-none [&>button.border]:bg-ink-950/60">
            {actions}
          </div>
        )}
      </motion.div>

      <button
        onClick={onReplay}
        title="Ver introdução de novo"
        aria-label="Ver introdução de novo"
        className="absolute right-3 top-3 rounded-lg border border-ink-50/10 bg-ink-950/50 p-2 text-ink-300 backdrop-blur-md transition-colors hover:text-ink-50"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ModuleFrame({ id, index, image, title, phrase, cta = "Entrar no painel", stats, actions, children }) {
  const [entered, setEntered] = useState(false);
  // O conteúdo pesado só monta depois que a foto encolhe, para a animação não engasgar
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!entered) {
      setShowContent(false);
      return undefined;
    }
    const t = setTimeout(() => setShowContent(true), 650);
    return () => clearTimeout(t);
  }, [entered]);

  return (
    <LayoutGroup id={`module-${id}`}>
      {!entered ? (
        <Intro
          id={id}
          index={index}
          image={image}
          title={title}
          phrase={phrase}
          cta={cta}
          stats={stats}
          onEnter={() => setEntered(true)}
        />
      ) : (
        <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pt-6">
          <Banner id={id} image={image} title={title} phrase={phrase} actions={actions} onReplay={() => setEntered(false)} />
          {showContent ? (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          ) : (
            <div className="mt-6 h-[60vh]" />
          )}
        </div>
      )}
    </LayoutGroup>
  );
}
