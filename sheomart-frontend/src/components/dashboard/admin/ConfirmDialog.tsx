"use client";

import { AlertTriangle, Info, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: "danger" | "primary" | "warning";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const getIcon = () => {
    switch (confirmVariant) {
      case "danger":
        return <Trash2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      default:
        return <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  const getButtonClass = () => {
    switch (confirmVariant) {
      case "danger":
        return "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700";
      case "warning":
        return "bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700";
      default:
        return "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-950">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 text-stone-400 transition hover:text-stone-600 dark:hover:text-stone-200"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-900">
            {getIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">{title}</h3>
            <p className="mt-1.5 text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs sm:text-sm font-medium transition disabled:opacity-50 ${getButtonClass()}`}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
