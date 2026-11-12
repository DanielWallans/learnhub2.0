import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check } from "lucide-react";
import { CareerWidget, FinanceWidget, HabitsWidget, ReadingWidget } from "@/features/landing/components/mocks";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const modules = [
  {
    name: "Biblioteca",
    title: "Saiba onde parou em cada livro.",
    text: "Cadastre livros e apostilas, marque a página atual e veja quanto falta. Os concluídos ficam no histórico.",
    points: ["Não iniciado, lendo, concluído", "Progresso por página", "Nota e anotações"],
    Widget: ReadingWidget,
  },
  {
    name: "Finanças",
    title: "O dinheiro do mês, sem planilha.",
    text: "Registre entradas e saídas em dois toques. O saldo, o gasto e o que você guardou se atualizam na hora.",
    points: ["Depósitos e saques", "Quanto foi guardado", "Resumo no painel inicial"],
    Widget: FinanceWidget,
  },
  {
    name: "Hábitos",
    title: "Constância que dá pra ver.",
    text: "Marque os hábitos do dia e acompanhe a sequência. Um radar mostra em quais áreas você está evoluindo.",
    points: ["Sequência de dias", "Progresso semanal", "Radar por categoria"],
    Widget: HabitsWidget,
  },
  {
    name: "Carreira",
    title: "Cada vaga em uma etapa.",
    text: "Acompanhe estágios e empregos da inscrição à aprovação, com empresa, modalidade e salário.",
    points: ["Inscrição, prova, entrevista", "Remoto, híbrido ou presencial", "Metas de carreira"],
    Widget: CareerWidget,
  },
];

export function ModulesScroll() {
  const section = useRef(null);
  const track = useRef(null);
  const bar = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const distance = () => track.current.scrollWidth - window.innerWidth;

        const tween = gsap.to(track.current, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => gsap.set(bar.current, { scaleX: self.progress }),
          },
        });

        gsap.utils.toArray(".module-widget").forEach((el) => {
          gsap.from(el, {
            y: 60,
            rotate: -3,
            opacity: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              containerAnimation: tween,
              start: "left 85%",
              end: "left 45%",
              scrub: true,
            },
          });
        });
      });

      mm.add("(max-width: 1023px)", () => {
        gsap.utils.toArray(".module-panel").forEach((el) => {
          gsap.from(el, {
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          });
        });
      });
    },
    { scope: section }
  );

  return (
    <section id="modulos" ref={section} className="relative overflow-hidden border-t border-ink-800 lg:h-screen">
      <div className="absolute inset-x-0 top-0 hidden h-px origin-left bg-lime lg:block" ref={bar} style={{ transform: "scaleX(0)" }} />

      <div ref={track} className="flex flex-col lg:h-full lg:w-max lg:flex-row lg:items-center">
        <div className="flex flex-col justify-center px-5 py-20 sm:px-8 lg:w-[38vw] lg:py-0 lg:pl-[max(2rem,calc((100vw-72rem)/2+2rem))]">
          <p className="font-mono text-xs text-ink-400">04 módulos</p>
          <h2 className="mt-4 max-w-md text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-ink-50 sm:text-5xl">
            Tudo o que pesa no semestre, organizado.
          </h2>
          <p className="mt-5 max-w-sm text-ink-300">
            Cada módulo funciona sozinho e alimenta o painel inicial.
          </p>
        </div>

        {modules.map(({ name, title, text, points, Widget }, i) => (
          <article
            key={name}
            className="module-panel flex flex-col gap-10 border-t border-ink-800 px-5 py-16 sm:px-8 lg:h-full lg:w-[62vw] lg:max-w-[880px] lg:flex-row lg:items-center lg:gap-12 lg:border-l lg:border-t-0 lg:px-14 lg:py-0"
          >
            <div className="lg:w-1/2">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-lime">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm text-ink-300">{name}</span>
              </div>
              <h3 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.03em] text-ink-50">{title}</h3>
              <p className="mt-4 leading-relaxed text-ink-300">{text}</p>
              <ul className="mt-6 space-y-2.5">
                {points.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 text-sm text-ink-200">
                    <Check className="h-3.5 w-3.5 text-lime" strokeWidth={2.5} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="module-widget lg:w-1/2">
              <Widget className="mx-auto w-full max-w-sm p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]" />
            </div>
          </article>
        ))}

        <div className="hidden lg:block lg:w-[10vw]" />
      </div>
    </section>
  );
}
