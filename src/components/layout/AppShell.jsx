import { Suspense, useCallback, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Bug, Command, LogOut, Search } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useStudent } from "@/context/StudentContext";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import { Avatar } from "@/components/ui/primitives";
import { Spinner } from "@/components/ui/spinner";
import { NAV_ITEMS } from "@/components/layout/nav";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { ProfileDialog } from "@/features/conta/ProfileDialog";
import { BugReportDialog } from "@/features/conta/BugReportDialog";

function SidebarLink({ item }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
          isActive ? "text-ink-50" : "text-ink-400 hover:text-ink-100"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="sidebar-active"
              className="absolute inset-0 rounded-lg border border-ink-700 bg-ink-850"
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
          {isActive && (
            <motion.span
              layoutId="sidebar-active-bar"
              className="absolute -left-3 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r bg-lime"
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
          <Icon className="relative h-4 w-4" />
          <span className="relative">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

// Dock inferior do celular (inspirado no dock do Cult UI)
function MobileDock() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between rounded-2xl border border-ink-700 bg-ink-900/90 p-1.5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] transition-colors",
                  isActive ? "text-ink-950" : "text-ink-400"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="dock-active"
                      className="absolute inset-0 rounded-xl bg-lime"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                  <Icon className="relative h-[18px] w-[18px]" strokeWidth={isActive ? 2.25 : 1.75} />
                  <span className="relative font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, nome, foto } = useStudent();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [bugOpen, setBugOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = useCallback(async () => {
    await auth.signOut();
    navigate("/home");
  }, [navigate]);

  const openProfile = useCallback(() => setProfileOpen(true), []);
  const openBug = useCallback(() => setBugOpen(true), []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-ink-950 font-sans text-ink-50 antialiased selection:bg-lime selection:text-ink-950">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-ink-800 bg-ink-950 lg:flex">
        <div className="flex h-16 items-center px-5">
          <NavLink to="/dashboard" aria-label="Ir para o painel">
            <Logo />
          </NavLink>
        </div>

        <div className="px-3">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-sm text-ink-400 transition-colors hover:border-ink-700 hover:text-ink-200"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Buscar</span>
            <kbd className="flex items-center gap-0.5 font-mono text-[10px] text-ink-500">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-0.5 px-3">
          <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-wider text-ink-500">Módulos</p>
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.to} item={item} />
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-0.5 border-t border-ink-800 p-3">
          <button
            onClick={openBug}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-400 transition-colors hover:bg-ink-900 hover:text-ink-100"
          >
            <Bug className="h-4 w-4" /> Reportar problema
          </button>
          <button
            onClick={openProfile}
            className="mt-1 flex items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-ink-900"
          >
            <Avatar src={foto} name={nome} className="h-8 w-8" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-ink-50">{nome || "Seu perfil"}</span>
              <span className="block truncate text-xs text-ink-500">{user?.email}</span>
            </span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-400 transition-colors hover:bg-ink-900 hover:text-ink-100"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Barra superior no celular */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-ink-800 bg-ink-950/90 px-4 backdrop-blur-md lg:hidden">
        <NavLink to="/dashboard" aria-label="Ir para o painel">
          <Logo />
        </NavLink>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPaletteOpen(true)}
            className="rounded-lg p-2 text-ink-300 transition-colors hover:bg-ink-850"
            aria-label="Buscar"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <div className="relative">
            <button onClick={() => setMenuOpen((o) => !o)} className="rounded-full p-0.5" aria-label="Menu da conta">
              <Avatar src={foto} name={nome} className="h-8 w-8" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  className="absolute right-0 top-11 w-56 overflow-hidden rounded-xl border border-ink-700 bg-ink-900 p-1 shadow-2xl"
                >
                  <div className="border-b border-ink-800 px-3 py-2.5">
                    <p className="truncate text-sm text-ink-50">{nome || "Seu perfil"}</p>
                    <p className="truncate text-xs text-ink-500">{user?.email}</p>
                  </div>
                  {[
                    { label: "Perfil", run: openProfile },
                    { label: "Reportar problema", run: openBug },
                    { label: "Sair", run: logout },
                  ].map((a) => (
                    <button
                      key={a.label}
                      onClick={() => {
                        setMenuOpen(false);
                        a.run();
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink-200 hover:bg-ink-800"
                    >
                      {a.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="pb-28 lg:pb-0 lg:pl-60">
        <Suspense
          fallback={
            <div className="flex h-[60vh] items-center justify-center">
              <Spinner className="h-5 w-5 text-ink-500" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>

      <MobileDock />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenProfile={openProfile}
        onOpenBug={openBug}
        onLogout={logout}
      />
      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
      <BugReportDialog open={bugOpen} onClose={() => setBugOpen(false)} />
    </div>
  );
}
