import { motion } from "motion/react";
import { Lock, Radar, RefreshCw, Smartphone, Wallet, BookOpen, Flame, Briefcase } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }),
};

function Feature({ icon: Icon, title, text, className, index, children }) {
  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      custom={index}
      className={className}
    >
      <SpotlightCard className="h-full">
        <div className="flex h-full flex-col p-6 sm:p-7">
          <Icon className="h-5 w-5 text-ink-200" strokeWidth={1.75} />
          <h3 className="mt-5 text-lg font-medium tracking-tight text-ink-50">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-300">{text}</p>
          {children}
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

function SyncVisual() {
  const devices = [
    { label: "notebook", w: "w-28" },
    { label: "celular", w: "w-20" },
  ];
  return (
    <div className="mt-auto flex items-end gap-4 pt-8">
      {devices.map((d, i) => (
        <div key={d.label} className="flex flex-col items-start gap-2">
          <div className={`${d.w} h-16 shrink-0 rounded-md border border-ink-700 bg-ink-850 p-2`}>
            <p className="font-mono text-[10px] text-ink-400">saldo</p>
            <motion.p
              className="font-mono text-xs text-ink-50"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.4 }}
            >
              R$ 1.284
            </motion.p>
          </div>
          <span className="font-mono text-[10px] text-ink-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function DashboardVisual() {
  const items = [
    { icon: BookOpen, value: "64%" },
    { icon: Wallet, value: "R$ 1,2k" },
    { icon: Flame, value: "12d" },
    { icon: Briefcase, value: "7" },
  ];
  return (
    <div className="mt-auto grid grid-cols-4 gap-2 pt-8">
      {items.map(({ icon: Icon, value }) => (
        <div key={value} className="rounded-lg border border-ink-700 bg-ink-850 p-3">
          <Icon className="h-3.5 w-3.5 text-ink-400" />
          <p className="mt-3 font-mono text-sm text-ink-50">{value}</p>
        </div>
      ))}
    </div>
  );
}

export function FeatureGrid() {
  return (
    <section id="recursos" className="mx-auto max-w-6xl px-5 py-28 sm:px-8">
      <div className="max-w-2xl">
        <p className="font-mono text-xs text-ink-400">recursos</p>
        <h2 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-ink-50 sm:text-5xl">
          Feito para abrir todo dia, não uma vez por mês.
        </h2>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-6">
        <Feature
          index={0}
          className="md:col-span-4"
          icon={RefreshCw}
          title="Sincroniza na hora"
          text="Mudou algo no celular? O notebook já mostra. Os dados ficam na nuvem e chegam em tempo real."
        >
          <SyncVisual />
        </Feature>
        <Feature
          index={1}
          className="md:col-span-2"
          icon={Smartphone}
          title="Pensado para o celular"
          text="Navegação embaixo, botões grandes e telas que cabem na mão."
        />
        <Feature
          index={2}
          className="md:col-span-2"
          icon={Lock}
          title="Sua conta, seus dados"
          text="Login com e-mail e senha. Seus registros ficam ligados à sua conta."
        />
        <Feature
          index={3}
          className="md:col-span-2"
          icon={Radar}
          title="Radar de evolução"
          text="Veja em quais áreas você está crescendo: estudo, produtividade, saúde e mais."
        />
        <Feature
          index={4}
          className="md:col-span-2"
          icon={Wallet}
          title="Um painel com o resumo"
          text="Os quatro módulos num lugar só, logo que você entra."
        >
          <DashboardVisual />
        </Feature>
      </div>
    </section>
  );
}
