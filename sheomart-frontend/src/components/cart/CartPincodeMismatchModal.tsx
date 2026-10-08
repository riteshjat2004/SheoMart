"use client";

import { useEffect } from "react";
import { MapPinOff, MapPin, X, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePincodeMismatchStore } from "@/store/pincode-mismatch-store";

export function CartPincodeMismatchModal() {
  const { mismatch, closeMismatch } = usePincodeMismatchStore();

  useEffect(() => {
    if (!mismatch) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMismatch();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mismatch, closeMismatch]);

  if (!mismatch) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={closeMismatch}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon & Close */}
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <MapPinOff className="h-6 w-6" />
          </div>
          <button
            type="button"
            onClick={closeMismatch}
            className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-3">
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50">
              Delivery Area Mismatch
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
              {mismatch.storeName ? (
                <>
                  <span className="font-semibold text-stone-900 dark:text-white">
                    {mismatch.storeName}
                  </span>{" "}
                  only delivers to{" "}
                </>
              ) : (
                "This store only delivers to "
              )}
              <span className="font-bold text-amber-600 dark:text-amber-400">
                PIN {mismatch.storePincode}
              </span>
              .
            </p>
          </div>

          {/* Location comparison pills */}
          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/80 p-3.5 text-xs dark:border-stone-800 dark:bg-stone-950/40">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400">Your Current Delivery PIN:</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">
                PIN {mismatch.customerPincode}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400">Store Service PIN:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                PIN {mismatch.storePincode}
              </span>
            </div>
          </div>

          {/* Instructions to change PIN by themselves */}
          <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-3.5 text-xs text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
            <MapPin className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <p className="leading-relaxed">
              Please change your delivery PIN to{" "}
              <span className="font-bold">PIN {mismatch.storePincode}</span> manually using the{" "}
              <span className="font-semibold underline decoration-emerald-500/50 underline-offset-2">
                location selector
              </span>{" "}
              in the top bar if you want to order items from this store.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            onClick={closeMismatch}
            className="w-full sm:w-auto rounded-xl bg-stone-900 px-6 font-semibold text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200 shadow-sm"
          >
            Understood, Got It
          </Button>
        </div>
      </div>
    </div>
  );
}
