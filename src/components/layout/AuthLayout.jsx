import { lazy, Suspense, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { FinanceWidget, HabitsWidget, ReadingWidget } from "@/features/landing/components/mocks";

const ParticleField = lazy(() => import("@/features/landing/components/ParticleField"));

// Layout das telas de acesso: formulário à esquerda, vitrine do produto à direita
export function AuthLayout({ title, subtitle, children, footer, wide = false }) {
  const progress = useRef(0);

  return (
    <div className="grid min-h-screen bg-ink-950 font-sans text-ink-50 antialiased selection:bg-lime selection:text-ink-950 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to="/home" aria-label="LearnHub, início">
            <Logo />
          </Link>
          <Link to="/home" className="flex items-center gap-1.5 text-sm text-ink-400 transition-colors hover:text-ink-50">
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`mx-auto flex w-full flex-1 flex-col justify-center py-12 ${wide ? "max-w-lg" : "max-w-sm"}`}
        >
          <h1 className="text-3xl font-semibold tracking-[-0.04em]">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-ink-400">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-sm text-ink-400">{footer}</div>}
        </motion.div>

        <p className="font-mono text-[11px] text-ink-600">© {new Date().getFullYear()} LearnHub</p>
      </div>

      <div className="relative hidden overflow-hidden border-l border-ink-800 bg-ink-900 lg:block">
        <Suspense fallback={null}>
          <ParticleField progressRef={progress} className="absolute inset-0 opacity-70" />
        </Suspense>
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />

        <div className="relative flex h-full flex-col justify-end p-12">
          <div className="relative mb-14 h-[23rem]">
            {[
              { C: ReadingWidget, cls: "left-0 top-0 w-72", rot: -4, delay: 0.2 },
              { C: FinanceWidget, cls: "left-40 top-24 w-80", rot: 3, delay: 0.35 },
              { C: HabitsWidget, cls: "left-12 top-52 w-72", rot: -2, delay: 0.5 },
            ].map(({ C, cls, rot, delay }, i) => (
              <motion.div
                key={i}
                className={`absolute ${cls}`}
                initial={{ opacity: 0, y: 30, rotate: 0 }}
                animate={{ opacity: 1, y: 0, rotate: rot }}
                transition={{ delay, type: "spring", stiffness: 80, damping: 16 }}
              >
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}>
                  <C className="shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]" />
                </motion.div>
              </motion.div>
            ))}
          </div>
          <p className="max-w-md text-2xl font-medium leading-snug tracking-[-0.03em] text-ink-50">
            Estudos, grana, hábitos e carreira. <span className="text-ink-400">Num painel só.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Mensagem de erro/aviso dos formulários de acesso (sem cor extra: contraste + ícone)
export function FormMessage({ icon: Icon, children, tone = "error" }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className={
        tone === "success"
          ? "flex items-start gap-2.5 rounded-lg border border-lime/30 bg-lime/10 px-3 py-2.5 text-sm text-ink-50"
          : "flex items-start gap-2.5 rounded-lg border border-ink-600 bg-ink-850 px-3 py-2.5 text-sm text-ink-50"
      }
    >
      {Icon && <Icon className={tone === "success" ? "mt-0.5 h-4 w-4 shrink-0 text-lime" : "mt-0.5 h-4 w-4 shrink-0"} />}
      <span>{children}</span>
    </motion.div>
  );
}
