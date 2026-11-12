import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Bug, CornerDownLeft, LogOut, Search, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/layout/nav";

// Busca rápida (Ctrl/Cmd + K) para ir a qualquer módulo ou ação
export function CommandPalette({ open, onClose, onOpenProfile, onOpenBug, onLogout }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  const items = useMemo(() => {
    const all = [
      ...NAV_ITEMS.map((i) => ({ id: i.to, label: i.label, group: "Ir para", icon: i.icon, run: () => navigate(i.to) })),
      { id: "perfil", label: "Abrir perfil", group: "Ações", icon: UserRound, run: onOpenProfile },
      { id: "bug", label: "Reportar um problema", group: "Ações", icon: Bug, run: onOpenBug },
      { id: "sair", label: "Sair da conta", group: "Ações", icon: LogOut, run: onLogout },
    ];
    const q = query.trim().toLowerCase();
    return q ? all.filter((i) => i.label.toLowerCase().includes(q)) : all;
  }, [query, navigate, onOpenProfile, onOpenBug, onLogout]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const run = (item) => {
    onClose();
    item?.run?.();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(items[active]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  let lastGroup = null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center px-4 pt-[14vh] font-sans">
          <motion.div
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 38 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-ink-800 px-4">
              <Search className="h-4 w-4 text-ink-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Buscar módulo ou ação"
                className="h-12 flex-1 bg-transparent text-sm text-ink-50 placeholder:text-ink-500 focus:outline-none"
              />
              <kbd className="rounded border border-ink-700 px-1.5 py-0.5 font-mono text-[10px] text-ink-400">esc</kbd>
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {items.length === 0 && <li className="px-3 py-6 text-center text-sm text-ink-400">Nada encontrado.</li>}
              {items.map((item, i) => {
                const Icon = item.icon;
                const header = item.group !== lastGroup ? item.group : null;
                lastGroup = item.group;
                return (
                  <li key={item.id}>
                    {header && <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-wider text-ink-500">{header}</p>}
                    <button
                      onMouseEnter={() => setActive(i)}
                      onClick={() => run(item)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                        i === active ? "bg-ink-800 text-ink-50" : "text-ink-300"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{item.label}</span>
                      {i === active && <CornerDownLeft className="h-3.5 w-3.5 text-ink-500" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
