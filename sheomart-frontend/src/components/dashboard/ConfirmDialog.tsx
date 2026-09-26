"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ConfirmDialogProps {
  title: string;
  description?: string;
  children?: ReactNode;
  open?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  confirmVariant?: "default" | "destructive" | "secondary" | "outline";
  isConfirming?: boolean;
  cancelLabel?: string;
  icon?: ReactNode;
}

export function ConfirmDialog({
  title,
  description,
  children,
  open = true,
  onClose,
  onConfirm,
  confirmLabel = "Confirm",
  confirmVariant = "default",
  isConfirming = false,
  cancelLabel = "Cancel",
  icon,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onClose && !isConfirming) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, isConfirming]);

  if (!open) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose && !isConfirming) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
            {icon ?? <AlertTriangle className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <h3
              id="confirm-dialog-title"
              className="text-base font-semibold text-stone-900 dark:text-stone-50"
            >
              {title}
            </h3>
            {description ? (
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {children ? (
          <div className="mt-6 flex flex-wrap justify-end gap-2">{children}</div>
        ) : onConfirm ? (
          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isConfirming}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={confirmVariant === "destructive" ? "default" : confirmVariant}
              className={confirmVariant === "destructive" ? "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700" : undefined}
              onClick={onConfirm}
              disabled={isConfirming}
            >
              {isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
