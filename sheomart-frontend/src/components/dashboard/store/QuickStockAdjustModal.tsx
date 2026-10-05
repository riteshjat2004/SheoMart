"use client";

import { useState } from "react";
import {
  X,
  Plus,
  Minus,
  Equal,
  ArrowRight,
  Package,
  AlertCircle,
  Layers,
  Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductItem, ProductVariant } from "@/types/marketplace";

interface QuickStockAdjustModalProps {
  product: ProductItem;
  currentStock: number;
  lowStockThreshold?: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (
    newAvailableQuantity: number,
    note?: string,
    updatedVariants?: ProductVariant[]
  ) => void;
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
  const hasVariants = Boolean(product.variants && product.variants.length > 0);
  const isShared = product.stockTrackingMode === "SHARED";

  // State for single-quantity / shared mode
  const [mode, setMode] = useState<Mode>("add");
  const [amount, setAmount] = useState<string>("10");
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string>("");

  // State for separate variant packs mode
  const [variantStocks, setVariantStocks] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v, idx) => {
        const key = v.variantId || v.label || `variant-${idx}`;
        initial[key] = v.stock ?? 0;
      });
    }
    return initial;
  });

  const parsedAmount = Math.max(0, parseInt(amount, 10) || 0);

  let resultingStock = currentStock;
  if (mode === "add") resultingStock = currentStock + parsedAmount;
  else if (mode === "remove") resultingStock = Math.max(0, currentStock - parsedAmount);
  else if (mode === "set") resultingStock = parsedAmount;

  // Separate packs total calculation
  const totalVariantStock = hasVariants && !isShared
    ? Object.values(variantStocks).reduce((acc, curr) => acc + (Number.isFinite(curr) ? Math.max(0, curr) : 0), 0)
    : resultingStock;

  const quickAmounts = [5, 10, 25, 50, 100];

  const handleVariantStockChange = (key: string, value: number) => {
    setVariantStocks((prev) => ({
      ...prev,
      [key]: Math.max(0, value),
    }));
  };

  const handleVariantQuickAdjust = (key: string, delta: number) => {
    setVariantStocks((prev) => {
      const current = prev[key] ?? 0;
      return {
        ...prev,
        [key]: Math.max(0, current + delta),
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (hasVariants && !isShared) {
      // Validate variants
      const updatedVariants: ProductVariant[] = (product.variants || []).map((v, idx) => {
        const key = v.variantId || v.label || `variant-${idx}`;
        const stock = Math.max(0, variantStocks[key] ?? 0);
        return {
          ...v,
          stock,
        };
      });

      onSubmit(totalVariantStock, note.trim() || undefined, updatedVariants);
      return;
    }

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

  const stockDifference = totalVariantStock - currentStock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-950">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {hasVariants ? <Layers className="h-5 w-5" /> : <Package className="h-5 w-5" />}
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

        <form onSubmit={handleSubmit} className="mt-4 flex-1 overflow-y-auto pr-1 space-y-5">
          {error ? (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {/* Conditional UI: Separate Pack Variants vs Standard / Shared Mode */}
          {hasVariants && !isShared ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Individual Pack Breakdown ({product.variants?.length} Packs)
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Adjust stock individually for each pack size. The overall stock is calculated automatically.
                  </p>
                </div>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  Separate Stock Mode
                </span>
              </div>

              <div className="space-y-2.5">
                {product.variants?.map((v, idx) => {
                  const key = v.variantId || v.label || `variant-${idx}`;
                  const currentVariantStock = v.stock ?? 0;
                  const newVariantStock = variantStocks[key] ?? 0;
                  const diff = newVariantStock - currentVariantStock;

                  return (
                    <div
                      key={key}
                      className="rounded-2xl border border-stone-200/80 bg-stone-50/70 p-3.5 transition-all dark:border-stone-800 dark:bg-stone-900/40"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                              {idx + 1}
                            </span>
                            <p className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                              {v.label}
                            </p>
                          </div>
                          <p className="mt-0.5 text-[11px] text-stone-400">
                            Current: <span className="font-semibold text-stone-600 dark:text-stone-300">{currentVariantStock} units</span>
                            {v.price ? ` • Price: ₹${v.price}` : ""}
                            {diff !== 0 && (
                              <span className={`ml-2 font-bold ${diff > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                                ({diff > 0 ? `+${diff}` : diff})
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleVariantQuickAdjust(key, -5)}
                            className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-semibold text-stone-600 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVariantQuickAdjust(key, -1)}
                            className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-semibold text-stone-600 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
                          >
                            -1
                          </button>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={newVariantStock}
                            onChange={(e) => handleVariantStockChange(key, Math.max(0, parseInt(e.target.value, 10) || 0))}
                            className="w-16 rounded-xl border border-stone-200 bg-white px-2.5 py-1 text-center text-sm font-bold text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
                          />
                          <button
                            type="button"
                            onClick={() => handleVariantQuickAdjust(key, 1)}
                            className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-stone-800 dark:bg-stone-900 dark:text-emerald-400"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVariantQuickAdjust(key, 5)}
                            className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-stone-800 dark:bg-stone-900 dark:text-emerald-400"
                          >
                            +5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVariantQuickAdjust(key, 10)}
                            className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-stone-800 dark:bg-stone-900 dark:text-emerald-400"
                          >
                            +10
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic live calculation banner */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 dark:border-emerald-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                    <Calculator className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Overall Total Calculated Stock
                    </span>
                  </div>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    Previous: <span className="font-semibold text-stone-700 dark:text-stone-300">{currentStock}</span>
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    {totalVariantStock} <span className="text-xs font-medium text-stone-500">total units</span>
                  </div>
                  <div className="text-xs font-semibold">
                    {stockDifference === 0 ? (
                      <span className="text-stone-400">No change</span>
                    ) : (
                      <span className={stockDifference > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}>
                        {stockDifference > 0 ? `+${stockDifference}` : stockDifference} net difference
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Standard Adjuster for Simple Products or Shared Pool Mode
            <div className="space-y-4">
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

              {/* Shared Pool Pack Breakdown Preview if applicable */}
              {isShared && hasVariants && (
                <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-3.5 dark:border-sky-500/20">
                  <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300">
                    <Layers className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Shared Pool: Resulting Pack Availabilities
                    </span>
                  </div>
                  <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                    {product.variants?.map((v) => {
                      const packQty = Math.max(1, v.packQuantity || 1);
                      const availablePacks = Math.floor(resultingStock / packQty);
                      return (
                        <div key={v.variantId || v.label} className="rounded-xl border border-stone-200/80 bg-white/70 p-2 dark:border-stone-800 dark:bg-stone-900/50">
                          <p className="font-semibold text-stone-800 dark:text-stone-200 truncate">{v.label}</p>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            <span className="font-bold text-sky-600 dark:text-sky-400">{availablePacks}</span> packs available
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
            </div>
          )}

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
              placeholder="e.g. Distributor delivery, Stock count correction, Damaged stock"
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
