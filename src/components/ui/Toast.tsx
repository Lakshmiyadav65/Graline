"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastTone = "info" | "success" | "error";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  show: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const toneClass: Record<ToastTone, string> = {
  info:    "bg-ink text-paper",
  success: "bg-paddy text-cream",
  error:   "bg-terra text-white",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const show = useCallback((message: string, tone: ToastTone = "info") => {
    idRef.current += 1;
    const id = idRef.current;
    setToasts((prev) => [...prev, { id, message, tone }]);
    const t = setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      timersRef.current.delete(id);
    }, 3500);
    timersRef.current.set(id, t);
  }, []);

  // Clear pending timers if provider unmounts
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      {/*
       * Live region: container announces new toasts to screen readers.
       * - role="status" + aria-live="polite": non-interrupting announcement
       * - aria-atomic="false": only newly inserted nodes are announced, not the whole list
       * - aria-relevant="additions": ignore removals (a toast being dismissed shouldn't re-announce)
       * Individual toasts are presentational divs — no per-toast role.
       */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions"
        aria-label="Notifications"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-card text-[13px] font-medium shadow-soft pointer-events-auto ${toneClass[t.tone]}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
