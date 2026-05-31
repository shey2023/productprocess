"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactElement,
} from "react";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  show: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastVariant, ReactElement> = {
  success: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8}>
      <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8}>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8}>
      <path d="M12 8v4m0 4h.01M12 21a9 9 0 100-18 9 9 0 000 18z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const STYLES: Record<ToastVariant, string> = {
  success: "border-gold/40 bg-ivory text-ink",
  error: "border-red-400/50 bg-ivory text-red-600",
  info: "border-hairline bg-ivory text-ink",
};

const ACCENT: Record<ToastVariant, string> = {
  success: "bg-gold",
  error: "bg-red-500",
  info: "bg-stone",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss],
  );

  const value: ToastContextValue = {
    show,
    success: (m) => show(m, "success"),
    error: (m) => show(m, "error"),
    info: (m) => show(m, "info"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 left-4 z-[110] flex flex-col gap-2 safe-pb"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className={`pointer-events-auto relative flex min-w-[14rem] max-w-sm items-center gap-3 overflow-hidden rounded-xl border bg-ivory px-4 py-3 pr-4 shadow-lift backdrop-blur-sm ${STYLES[t.variant]}`}
              role="status"
            >
              {/* Accent strip */}
              <span
                aria-hidden
                className={`absolute right-0 top-0 bottom-0 w-[3px] ${ACCENT[t.variant]}`}
              />
              <span className="shrink-0">{ICONS[t.variant]}</span>
              <p className="flex-1 text-sm leading-snug">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="סגור"
                className="shrink-0 text-stone/60 transition hover:text-ink"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={1.6}>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback no-op so components can be used without provider during SSR-only paths
    return {
      show: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    } satisfies ToastContextValue;
  }
  return ctx;
}

/**
 * useScheduledToast — fire a toast on mount based on URL query (?toast=success&msg=...).
 * Useful for server actions that redirect after success.
 */
export function useToastFromQuery() {
  const toast = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const variant = params.get("toast") as ToastVariant | null;
    const msg = params.get("msg");
    if (variant && msg) {
      toast.show(decodeURIComponent(msg), variant);
      // Clean URL
      params.delete("toast");
      params.delete("msg");
      const next =
        window.location.pathname + (params.toString() ? `?${params}` : "");
      window.history.replaceState({}, "", next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
