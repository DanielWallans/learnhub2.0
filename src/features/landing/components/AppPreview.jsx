import { BookOpen, Briefcase, Flame, LayoutGrid, Search, Wallet, Command } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { CareerWidget, FinanceWidget, HabitsWidget, ReadingWidget } from "@/features/landing/components/mocks";

const sideItems = [
  { icon: LayoutGrid, active: true },
  { icon: BookOpen },
  { icon: Wallet },
  { icon: Flame },
  { icon: Briefcase },
];

// Janela de exemplo do painel, usada como "print" do produto
export function AppPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-x-10 -top-10 bottom-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(198,244,50,0.08),transparent_65%)]" />

      <div className="overflow-hidden rounded-2xl border border-ink-700/80 bg-ink-950 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-2 border-b border-ink-800 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-ink-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-700" />
          <div className="mx-auto hidden items-center gap-2 rounded-md border border-ink-800 bg-ink-900 px-3 py-1 text-xs text-ink-400 sm:flex">
            <Search className="h-3 w-3" />
            Buscar
            <span className="ml-6 flex items-center gap-0.5 font-mono text-[10px]">
              <Command className="h-2.5 w-2.5" />K
            </span>
          </div>
        </div>

        <div className="flex">
          <aside className="hidden w-14 flex-col items-center gap-2 border-r border-ink-800 py-4 sm:flex">
            <LogoMark className="mb-3 h-5 w-5" />
            {sideItems.map(({ icon: Icon, active }, i) => (
              <span
                key={i}
                className={
                  active
                    ? "rounded-md bg-ink-800 p-2 text-ink-50"
                    : "rounded-md p-2 text-ink-500"
                }
              >
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </aside>

          <div className="flex-1 p-4 sm:p-6">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="font-mono text-xs text-ink-400">qui, 12 nov</p>
                <p className="mt-1 text-lg font-medium tracking-tight text-ink-50 sm:text-xl">Boa tarde, Ana</p>
              </div>
              <p className="hidden text-xs text-ink-400 sm:block">
                3 de 4 hábitos feitos hoje
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FinanceWidget />
              <ReadingWidget />
              <HabitsWidget />
              <CareerWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
