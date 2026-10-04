"use client";

import { useState, useEffect } from "react";
import {
  IndianRupee,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmInvoicePayment } from "@/services/billing-history";

interface ConfirmInvoicePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    invoiceId: string;
    invoiceNumber: string;
    customerDisplayName?: string;
    grandTotal: number;
    amountPaid?: number;
    remainingAmount?: number;
    paymentMethod?: string;
  } | null;
  onPaymentConfirmed?: () => void;
}

export function ConfirmInvoicePaymentModal({
  isOpen,
  onClose,
  invoice,
  onPaymentConfirmed,
}: ConfirmInvoicePaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI">("CASH");
  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grandTotal = invoice?.grandTotal ?? 0;
  const amountPaid = invoice?.amountPaid ?? 0;
  const dueBalance =
    invoice?.remainingAmount !== undefined
      ? invoice.remainingAmount
      : Math.max(0, grandTotal - amountPaid);

  useEffect(() => {
    if (isOpen && invoice) {
      const remaining =
        invoice.remainingAmount !== undefined
          ? invoice.remainingAmount
          : Math.max(0, invoice.grandTotal - (invoice.amountPaid ?? 0));
      setAmount(String(remaining > 0 ? remaining : invoice.grandTotal));
      setNotes("");
      setError(null);
      setPaymentMethod(invoice.paymentMethod === "UPI" ? "UPI" : "CASH");
    }
  }, [isOpen, invoice]);

  if (!isOpen || !invoice) return null;

  const numericAmount = Number(amount);
  const isInvalidAmount = isNaN(numericAmount) || numericAmount <= 0 || numericAmount > dueBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInvalidAmount) {
      setError(`Please enter a valid amount between ₹1 and ₹${dueBalance}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await confirmInvoicePayment(invoice.invoiceId, {
        paymentMethod,
        amount: numericAmount,
        notes: notes.trim() || undefined,
      });

      if (onPaymentConfirmed) {
        onPaymentConfirmed();
      }
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to record payment. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4 dark:border-stone-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Confirm Pending Payment
            </h3>
            <p className="text-xs text-stone-500">
              Invoice #{invoice.invoiceNumber}
            </p>
          </div>
        </div>

        {/* Invoice Summary Card */}
        <div className="my-4 rounded-xl border border-stone-200/80 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-950/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500">Customer:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              {invoice.customerDisplayName || "Walk-in Customer"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500">Total Bill Amount:</span>
            <span className="font-medium text-stone-700 dark:text-stone-300">
              ₹{grandTotal.toLocaleString("en-IN")}
            </span>
          </div>
          {amountPaid > 0 ? (
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500">Already Received:</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                ₹{amountPaid.toLocaleString("en-IN")}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t border-stone-200/70 pt-2 text-xs dark:border-stone-800">
            <span className="font-bold text-amber-600 dark:text-amber-400">
              Outstanding Balance:
            </span>
            <span className="text-sm font-black text-amber-600 dark:text-amber-400">
              ₹{dueBalance.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Error Notification */}
        {error ? (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Payment Received Via
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("CASH")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                  paymentMethod === "CASH"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : "border-stone-200 text-stone-600 hover:bg-stone-50 dark:border-stone-800 dark:text-stone-400 dark:hover:bg-stone-800/40"
                }`}
              >
                <IndianRupee className="h-4 w-4" />
                Cash
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("UPI")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                  paymentMethod === "UPI"
                    ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                    : "border-stone-200 text-stone-600 hover:bg-stone-50 dark:border-stone-800 dark:text-stone-400 dark:hover:bg-stone-800/40"
                }`}
              >
                <QrCode className="h-4 w-4" />
                UPI / QR
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-stone-700 dark:text-stone-300">
                Amount Being Collected (₹)
              </label>
              <button
                type="button"
                onClick={() => setAmount(String(dueBalance))}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                Set Full Due (₹{dueBalance})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-stone-400 font-bold">₹</span>
              <input
                type="number"
                min="1"
                max={dueBalance}
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={String(dueBalance)}
                className="h-10 w-full rounded-xl border border-stone-300 bg-white pl-8 pr-3 text-sm font-bold text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Payment Reference / Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., GPay UTR 409812..., received at counter"
              className="h-9 w-full rounded-xl border border-stone-300 bg-white px-3 text-xs text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || isInvalidAmount}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Confirm Payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
