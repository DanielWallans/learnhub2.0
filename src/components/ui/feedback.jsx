import { createContext, useCallback, useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Toasts e confirmações no lugar de alert() e window.confirm()

const FeedbackContext = createContext(null);

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    // action: { label, onClick } mostra um botão no aviso (ex.: "Desfazer")
    ({ title, description, tone = "info", duration = 4000, action }) => {
      const id = ++idRef.current;
      setToasts((list) => [...list.slice(-3), { id, title, description, tone, action }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        setConfirmState({ ...options, resolve });
      }),
    []
  );

  const closeConfirm = (value) => {
    confirmState?.resolve(value);
    setConfirmState(null);
  };

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}

      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[110] flex flex-col items-center gap-2 px-4 font-sans lg:bottom-6 lg:items-end lg:pr-6">
          <AnimatePresence initial={false}>
            {toasts.map((t) => {
              const Icon = icons[t.tone] || Info;
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
                  className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-ink-700 bg-ink-850 p-3.5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)]"
                >
                  <Icon className={t.tone === "success" ? "mt-0.5 h-4 w-4 shrink-0 text-lime" : "mt-0.5 h-4 w-4 shrink-0 text-ink-50"} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-50">{t.title}</p>
                    {t.description && <p className="mt-0.5 text-xs text-ink-400">{t.description}</p>}
                  </div>
                  {t.action && (
                    <button
                      onClick={() => {
                        dismiss(t.id);
                        t.action.onClick();
                      }}
                      className="-my-1 shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium text-lime transition-colors hover:bg-lime/10"
                    >
                      {t.action.label}
                    </button>
                  )}
                  <button
                    onClick={() => dismiss(t.id)}
                    className="rounded p-0.5 text-ink-500 transition-colors hover:text-ink-50"
                    aria-label="Fechar aviso"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body
      )}

      <Dialog
        open={!!confirmState}
        onClose={() => closeConfirm(false)}
        title={confirmState?.title}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => closeConfirm(false)}>
              {confirmState?.cancelLabel || "Cancelar"}
            </Button>
            <Button variant={confirmState?.destructive ? "secondary" : "primary"} onClick={() => closeConfirm(true)}>
              {confirmState?.confirmLabel || "Confirmar"}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-ink-300">{confirmState?.description}</p>
      </Dialog>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback precisa estar dentro de FeedbackProvider");
  return ctx;
}
