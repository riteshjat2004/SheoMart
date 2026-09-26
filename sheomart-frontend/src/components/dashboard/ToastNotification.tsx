"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";

export interface ToastMessage {
  type: "success" | "error" | "info" | "warning";
  message: string;
}

interface ToastNotificationProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export function ToastNotification({ toast, onDismiss }: ToastNotificationProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <div className="fixed top-6 right-6 z-[100] flex max-w-md items-center gap-3 rounded-2xl border border-stone-200 bg-white/95 p-4 shadow-2xl backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/95 animate-in slide-in-from-top-4 duration-300">
      {isSuccess && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      )}
      {isError && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400">
          <XCircle className="h-5 w-5" />
        </div>
      )}
      {!isSuccess && !isError && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
      )}
      <p className="flex-1 text-sm font-medium text-stone-900 dark:text-stone-50">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-lg p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
