"use client";

import { useState } from "react";
import { X, Plus, Minus, Equal, ArrowRight, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductItem } from "@/types/marketplace";

interface QuickStockAdjustModalProps {
  product: ProductItem;
  currentStock: number;
  lowStockThreshold?: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (newAvailableQuantity: number, note?: string) => void;
}

type Mode = "add" | "remove" | "set";

export function QuickStockAdjustModal({
  product,
  currentStock,
  lowStockThreshold = 5,
  isSubmitting,
  onClose,
  onSubmit,
}: QuickStockAdjustModalProps) {
  const [mode, setMode] = useState<Mode>("add");
  const [amount, setAmount] = useState<string>("10");
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string>("");

  const parsedAmount = Math.max(0, parseInt(amount, 10) || 0);

  let resultingStock = currentStock;
  if (mode === "add") resultingStock = currentStock + parsedAmount;
  else if (mode === "remove") resultingStock = Math.max(0, currentStock - parsedAmount);
  else if (mode === "set") resultingStock = parsedAmount;

  const quickAmounts = [5, 10, 25, 50, 100];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode !== "set" && parsedAmount <= 0) {
      setError("Please enter a valid quantity greater than 0.");
      return;
    }

    if (mode === "remove" && parsedAmount > currentStock) {
      setError(`Cannot deduct more than current stock (${currentStock} units).`);
      return;
    }

    onSubmit(resultingStock, note.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-950">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-50">
                Adjust Inventory Stock
              </h2>
              <p className="text-xs text-stone-500">
                {product.name} • SKU: {product.sku || "—"}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close adjust modal"
          >
            <X className="h-5 w-5 text-stone-500" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {error ? (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {/* Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Adjustment Type
            </label>
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-stone-200 bg-stone-50 p-1 dark:border-stone-800 dark:bg-stone-900">
              <button
                type="button"
                onClick={() => setMode("add")}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all ${
                  mode === "add"
                    ? "bg-white text-emerald-600 shadow-sm dark:bg-stone-800 dark:text-emerald-400"
                    : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Stock
              </button>

              <button
                type="button"
                onClick={() => setMode("remove")}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all ${
                  mode === "remove"
                    ? "bg-white text-rose-600 shadow-sm dark:bg-stone-800 dark:text-rose-400"
                    : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                }`}
              >
                <Minus className="h-3.5 w-3.5" />
                Deduct
              </button>

              <button
                type="button"
                onClick={() => setMode("set")}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all ${
                  mode === "set"
                    ? "bg-white text-stone-900 shadow-sm dark:bg-stone-800 dark:text-stone-50"
                    : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                }`}
              >
                <Equal className="h-3.5 w-3.5" />
                Set Exact
              </button>
            </div>
          </div>

          {/* Amount input & Quick Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              {mode === "add"
                ? "Units to Add"
                : mode === "remove"
                  ? "Units to Deduct"
                  : "Target Quantity"}
            </label>
            <input
              type="number"
              min="0"
              step="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-base font-semibold outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
              placeholder="0"
            />

            {/* Quick Increment Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-emerald-950/40"
                >
                  +{q}
                </button>
              ))}
            </div>
          </div>

          {/* Live Result Preview Banner */}
          <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900/50">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
                Current Stock
              </p>
              <p className="text-base font-bold text-stone-800 dark:text-stone-200">
                {currentStock} units
              </p>
            </div>

            <ArrowRight className="h-5 w-5 text-stone-400" />

            <div className="text-right">
              <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
                New Stock
              </p>
              <div className="flex items-center justify-end gap-1.5">
                <span
                  className={`text-lg font-black ${
                    resultingStock === 0
                      ? "text-rose-600"
                      : resultingStock <= lowStockThreshold
                        ? "text-amber-600"
                        : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {resultingStock} units
                </span>
              </div>
            </div>
          </div>

          {/* Optional Audit Reason / Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Adjustment Reason / Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g. Received new shipment, Damaged goods, Stock audit count"
              className="w-full rounded-2xl border border-stone-200 bg-white px-3.5 py-2 text-xs outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isSubmitting ? "Updating..." : "Save Stock Adjustment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
