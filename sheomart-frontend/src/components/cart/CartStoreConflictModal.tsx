"use client";

import { useState } from "react";
import { AlertTriangle, Store, ArrowRight, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartConflictStore } from "@/store/cart-conflict-store";
import { useAddCartItem } from "@/hooks/use-cart";

export function CartStoreConflictModal() {
  const { conflict, closeConflict } = useCartConflictStore();
  const addCartItemMutation = useAddCartItem();
  const [isReplacing, setIsReplacing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!conflict) return null;

  const handleClearAndAdd = async () => {
    try {
      setIsReplacing(true);
      setErrorMsg(null);
      await addCartItemMutation.mutateAsync({
        ...conflict.payload,
        clearPreviousCart: true,
      });
      if (conflict.onSuccess) {
        conflict.onSuccess();
      }
      closeConflict();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to replace cart items";
      setErrorMsg(msg);
    } finally {
      setIsReplacing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeConflict}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon */}
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <Store className="h-6 w-6" />
          </div>
          <button
            type="button"
            onClick={closeConflict}
            className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-2">
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50">
            Replace cart items?
          </h3>
          <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
            Your cart already contains items from{" "}
            <span className="font-semibold text-stone-900 dark:text-white underline decoration-amber-500/50 underline-offset-2">
              {conflict.existingStoreName}
            </span>
            . Do you want to clear your cart and start adding items from{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 underline decoration-emerald-500/50 underline-offset-2">
              {conflict.newStoreName}
            </span>
            ?
          </p>
          <div className="rounded-xl border border-stone-100 bg-stone-50 p-3 text-xs text-stone-500 dark:border-stone-800 dark:bg-stone-950/50 dark:text-stone-400">
            SheoMart orders are packed and dispatched from a single local store at a time to ensure freshness and fast delivery.
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={closeConflict}
            disabled={isReplacing}
            className="rounded-xl border-stone-200 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:text-stone-300"
          >
            Keep Existing Items
          </Button>
          <Button
            type="button"
            onClick={handleClearAndAdd}
            disabled={isReplacing}
            className="rounded-xl bg-emerald-600 font-semibold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
          >
            {isReplacing ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Clearing & Adding...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span>Clear Cart &amp; Add</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
