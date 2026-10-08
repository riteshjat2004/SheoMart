"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Banknote, QrCode, CreditCard, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaymentReceivedMethod } from "@/services/store-orders";

interface ConfirmPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: PaymentReceivedMethod) => Promise<void> | void;
  orderId: string;
  customerName?: string;
  grandTotal: number;
  isPending?: boolean;
}

export function ConfirmPaymentModal({
  isOpen,
  onClose,
  onConfirm,
  orderId,
  customerName,
  grandTotal,
  isPending = false,
}: ConfirmPaymentModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentReceivedMethod>("CASH");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Prevent background scrolling while modal is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isPending, onClose]);

  if (!isOpen || !mounted) return null;

  const handleConfirm = async () => {
    try {
      setError(null);
      await onConfirm(selectedMethod);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment.");
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-stone-950/70 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-payment-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div
        className="relative my-auto w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl dark:border-stone-800 dark:bg-stone-900 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="absolute right-3.5 top-3.5 rounded-xl p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-50 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition"
          aria-label="Close"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pr-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h2 id="confirm-payment-title" className="text-base font-bold text-stone-900 dark:text-stone-50">
              Confirm Cash Collection
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Order #{orderId.slice(-8).toUpperCase()} {customerName ? `• ${customerName}` : ""}
            </p>
          </div>
        </div>

        {/* Compact Amount Banner */}
        <div className="mt-3.5 flex items-center justify-between rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-4 py-2.5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Amount to Collect
            </p>
            <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90">
              Collect full balance before confirming
            </p>
          </div>
          <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
            ₹{grandTotal.toLocaleString("en-IN")}
          </p>
        </div>

        {error ? (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {/* Payment Method Selector */}
        <div className="mt-3.5 space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Received Via
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedMethod("CASH")}
              disabled={isPending}
              className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 px-3 text-xs font-semibold transition-all ${
                selectedMethod === "CASH"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-600/20 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-stone-200 bg-stone-50/50 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-800/50 dark:text-stone-300 dark:hover:bg-stone-800"
              }`}
            >
              <Banknote className="h-4 w-4" />
              Cash
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod("UPI")}
              disabled={isPending}
              className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 px-3 text-xs font-semibold transition-all ${
                selectedMethod === "UPI"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-600/20 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-stone-200 bg-stone-50/50 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-800/50 dark:text-stone-300 dark:hover:bg-stone-800"
              }`}
            >
              <QrCode className="h-4 w-4" />
              UPI
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod("CARD")}
              disabled={isPending}
              className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 px-3 text-xs font-semibold transition-all ${
                selectedMethod === "CARD"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-600/20 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-stone-200 bg-stone-50/50 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-800/50 dark:text-stone-300 dark:hover:bg-stone-800"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Card
            </button>
          </div>
        </div>

        {/* Action Row */}
        <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="h-8.5 rounded-xl px-3.5 text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="h-8.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
          >
            {isPending ? "Confirming..." : "Confirm Payment Received"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
