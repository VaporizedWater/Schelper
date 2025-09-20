'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

type ToastVariant = 'success' | 'error' | 'info';

type ToastOptions = {
  title?: string;
  description: string;
  variant?: ToastVariant;
  duration?: number; // ms
};

type Toast = ToastOptions & { id: string };

const ToastContext = createContext<{ toast: (opts: ToastOptions) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, number | ReturnType<typeof setTimeout>>>({});

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id] as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      delete timers.current[id];
    }
  }, []);

  const toast = useCallback(
    (opts: ToastOptions) => {
      const id = Math.random().toString(36).slice(2);
      const t: Toast = { id, variant: 'info', duration: 3500, ...opts };
      setToasts((prev) => [...prev, t]);
      timers.current[id] = setTimeout(() => remove(id), t.duration!);
    },
    [remove]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onClose,
}: {
  toasts: Toast[];
  onClose: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed top-4 right-4 z-[1000] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => onClose(t.id)} />
      ))}
    </div>,
    document.body
  );
}

function variantStyles(v: ToastVariant | undefined) {
  switch (v) {
    case 'success':
      return 'border-green-200 filter backdrop-blur-sm bg-green-50 text-green-800 dark:border-green-900/60 dark:bg-green-900/40 dark:text-green-200';
    case 'error':
      return 'border-red-200 filter backdrop-blur-sm bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-900/40 dark:text-red-200';
    default:
      return 'border-zinc-200 filter backdrop-blur-sm bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100';
  }
}

function Icon({ variant }: { variant?: ToastVariant }) {
  const cls = 'h-4 w-4 opacity-80';
  if (variant === 'success') {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (variant === 'error') {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M12 5l7 14H5l7-14z" />
      </svg>
    );
  }
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 4a8 8 0 100 16 8 8 0 000-16z" />
    </svg>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const role = toast.variant === 'error' ? 'alert' : 'status';

  return (
    <div
      role={role}
      className={`pointer-events-auto relative overflow-hidden rounded-md border shadow-sm transition
        ${variantStyles(toast.variant)}
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      <div className="flex items-start gap-3 p-3 pr-9">
        <div className="mt-0.5">
          <Icon variant={toast.variant} />
        </div>
        <div className="flex-1">
          {toast.title && <div className="text-sm font-semibold">{toast.title}</div>}
          <div className="text-sm">{toast.description}</div>
        </div>
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded p-1 opacity-70 transition hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
          aria-label="Close"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <Progress duration={toast.duration ?? 3500} />
    </div>
  );
}

function Progress({ duration }: { duration: number }) {
  const [width, setWidth] = useState(100);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const pct = Math.max(0, 100 - ((now - start) / duration) * 100);
      setWidth(pct);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  return (
    <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10 dark:bg-white/10">
      <div className="h-full bg-black/30 dark:bg-white/30" style={{ width: `${width}%` }} />
    </div>
  );
}
