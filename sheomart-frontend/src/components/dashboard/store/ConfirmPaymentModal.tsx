"use client";

import { useState } from "react";
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
  const [selectedMethod, setSelectedMethod] = useState<PaymentReceivedMethod>("CASH");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setError(null);
      await onConfirm(selectedMethod);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-payment-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="absolute right-4 top-4 rounded-xl p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-50 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h2 id="confirm-payment-title" className="text-lg font-bold text-stone-900 dark:text-stone-50">
              Collect Customer Payment
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Order #{orderId.slice(-8).toUpperCase()} {customerName ? `• ${customerName}` : ""}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 text-center dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Amount to Collect
          </p>
          <p className="mt-1 text-3xl font-extrabold text-emerald-900 dark:text-emerald-200">
            ₹{grandTotal.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
            Collect full balance before confirming.
          </p>
        </div>

        {error ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="mt-5 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Received Via
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedMethod("CASH")}
              disabled={isPending}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-all ${
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
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-all ${
                selectedMethod === "UPI"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-600/20 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-stone-200 bg-stone-50/50 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-800/50 dark:text-stone-300 dark:hover:bg-stone-800"
              }`}
            >
              <QrCode className="h-4 w-4" />
              UPI / QR
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod("CARD")}
              disabled={isPending}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-all ${
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

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="h-9 rounded-xl px-4 text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="h-9 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
          >
            {isPending ? "Confirming..." : "Confirm Payment Received"}
          </Button>
        </div>
      </div>
    </div>
  );
}
