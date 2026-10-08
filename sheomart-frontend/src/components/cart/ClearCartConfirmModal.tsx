"use client";

import { useEffect } from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClearCartConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isClearing?: boolean;
  itemCount?: number;
  storeName?: string;
}

export function ClearCartConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isClearing = false,
  itemCount = 0,
  storeName,
}: ClearCartConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isClearing) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isClearing, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => {
        if (!isClearing) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon & Close */}
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <Trash2 className="h-6 w-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isClearing}
            className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-2.5">
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50">
            Empty your cart?
          </h3>
          <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
            Are you sure you want to remove all{" "}
            {itemCount > 0 ? (
              <span className="font-semibold text-stone-900 dark:text-white">
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </span>
            ) : (
              "items"
            )}{" "}
            {storeName ? (
              <>
                from{" "}
                <span className="font-semibold text-stone-900 dark:text-white">
                  {storeName}
                </span>{" "}
              </>
            ) : null}
            from your cart?
          </p>

          <div className="flex items-center gap-2 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>This action cannot be undone. You will need to add the items again.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isClearing}
            className="rounded-xl border-stone-200 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:text-stone-300"
          >
            Keep Items
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isClearing}
            className="rounded-xl bg-red-600 font-semibold text-white hover:bg-red-700 shadow-md shadow-red-600/20"
          >
            {isClearing ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Emptying...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Trash2 className="h-4 w-4" />
                <span>Yes, Empty Cart</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
