"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Variant = "default" | "danger" | "success" | "warning";

export type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: Variant;
  // allow closing by clicking the backdrop / pressing Esc
  allowOutsideCancel?: boolean;
};

type ConfirmContextValue = {
  confirm: (opts?: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider />");
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions>({});
  const resolverRef = useRef<((v: boolean) => void) | undefined>(undefined);
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback((options?: ConfirmOptions) => {
    setOpts({
      title: "Are you sure?",
      description: "",
      confirmText: "Confirm",
      cancelText: "Cancel",
      variant: "default",
      allowOutsideCancel: true,
      ...options,
    });
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  // Close helpers
  const resolveAndClose = (val: boolean) => {
    resolverRef.current?.(val);
    resolverRef.current = undefined;
    setOpen(false);
  };

  // Focus on confirm when opened; restore on close
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => confirmBtnRef.current?.focus(), 10);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && opts.allowOutsideCancel) resolveAndClose(false);
      if (e.key === "Enter") resolveAndClose(true);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, opts.allowOutsideCancel]);

  // Simple focus trap (first/last)
  useEffect(() => {
    if (!open) return;
    const el = dialogRef.current;
    if (!el) return;
    const selectors = [
      "button",
      "[href]",
      "input",
      "select",
      "textarea",
      "[tabindex]:not([tabindex='-1'])",
    ];
    const getFocusable = () =>
      Array.from(el.querySelectorAll<HTMLElement>(selectors.join(","))).filter(
        (n) => !n.hasAttribute("disabled")
      );
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const nodes = getFocusable();
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          last?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first?.focus();
          e.preventDefault();
        }
      }
    };
    el.addEventListener("keydown", onKeyDown as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    return () => el.removeEventListener("keydown", onKeyDown as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  }, [open]);

  // Variant styling
  const v = opts.variant ?? "default";
  const tone = {
    default: {
      ring: "ring-zinc-200 dark:ring-zinc-700",
      iconBg: "bg-blue-100 dark:bg-blue-900/40",
      iconFg: "text-blue-700 dark:text-blue-300",
      title: "text-zinc-900 dark:text-zinc-50",
      desc: "text-zinc-600 dark:text-zinc-300",
      confirm: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600",
    },
    danger: {
      ring: "ring-red-200 dark:ring-red-800",
      iconBg: "bg-red-100 dark:bg-red-900/40",
      iconFg: "text-red-700 dark:text-red-300",
      title: "text-red-900 dark:text-red-100",
      desc: "text-red-700/90 dark:text-red-200/80",
      confirm: "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600",
    },
    success: {
      ring: "ring-emerald-200 dark:ring-emerald-800",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
      iconFg: "text-emerald-700 dark:text-emerald-300",
      title: "text-emerald-900 dark:text-emerald-100",
      desc: "text-emerald-700/90 dark:text-emerald-200/80",
      confirm: "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600",
    },
    warning: {
      ring: "ring-amber-200 dark:ring-amber-800",
      iconBg: "bg-amber-100 dark:bg-amber-900/40",
      iconFg: "text-amber-700 dark:text-amber-300",
      title: "text-amber-900 dark:text-amber-100",
      desc: "text-amber-700/90 dark:text-amber-200/80",
      confirm: "bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600",
    },
  }[v];

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {open &&
        createPortal(
          <div
            aria-hidden={!open}
            className="fixed inset-0 z-[1000] flex items-center justify-center"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
              onClick={() => opts.allowOutsideCancel && resolveAndClose(false)}
            />

            {/* Dialog */}
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              aria-describedby="confirm-desc"
              className={`relative w-full max-w-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-xl ring-1 ${tone.ring} 
              transform transition-all duration-150 ease-out scale-100 opacity-100`}
            >
              <div className="p-5">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`mt-0.5 grid place-items-center h-9 w-9 rounded-full ${tone.iconBg}`}>
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-5 w-5 ${tone.iconFg}`}
                      aria-hidden="true"
                    >
                      {/* info/alert glyph */}
                      <path
                        fill="currentColor"
                        d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm0 14a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm-1-8h2v6h-2V8Z"
                      />
                    </svg>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 id="confirm-title" className={`text-base font-semibold ${tone.title}`}>
                      {opts.title}
                    </h2>
                    {opts.description ? (
                      <p id="confirm-desc" className={`mt-1 text-sm ${tone.desc}`}>
                        {opts.description}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => resolveAndClose(false)}
                    className="px-3 py-2 rounded-md text-sm bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
                  >
                    {opts.cancelText}
                  </button>
                  <button
                    ref={confirmBtnRef}
                    type="button"
                    onClick={() => resolveAndClose(true)}
                    className={`px-3 py-2 rounded-md text-sm text-white transition-colors ${tone.confirm}`}
                  >
                    {opts.confirmText}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </ConfirmContext.Provider>
  );
}
