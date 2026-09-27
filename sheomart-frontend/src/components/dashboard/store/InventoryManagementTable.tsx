"use client";

import { useState } from "react";
import { Package, History, SlidersHorizontal, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/DataTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { ProductItem } from "@/types/marketplace";
import type { InventoryItem } from "@/types/inventory";
import { InventoryLedgerDrawer } from "@/components/dashboard/store/InventoryLedgerDrawer";
import { QuickStockAdjustModal } from "@/components/dashboard/store/QuickStockAdjustModal";

interface InventoryRow {
  product: ProductItem;
  inventory: InventoryItem | null;
}

interface InventoryManagementTableProps {
  rows: InventoryRow[];
  categoryNames: Map<string, string>;
  selectedProductIds: string[];
  onToggleSelect: (productId: string) => void;
  onSelectAll: (select: boolean) => void;
  onEditFull: (product: ProductItem) => void;
  onQuickAdjustSubmit: (productId: string, newQuantity: number, note?: string) => Promise<void>;
  isAdjusting?: boolean;
}

function getStatusBadge(inventory: InventoryItem | null) {
  const available = inventory?.availableQuantity ?? 0;
  const threshold = inventory?.lowStockThreshold ?? 5;

  if (inventory?.status === "discontinued") {
    return { label: "Discontinued", variant: "Archived" as const };
  }

  if (available === 0) {
    return { label: "Out of Stock", variant: "Out of Stock" as const };
  }

  if (available <= threshold) {
    return { label: "Low Stock", variant: "Low Stock" as const };
  }

  return { label: "In Stock", variant: "In Stock" as const };
}

export function InventoryManagementTable({
  rows,
  categoryNames,
  selectedProductIds,
  onToggleSelect,
  onSelectAll,
  onEditFull,
  onQuickAdjustSubmit,
  isAdjusting = false,
}: InventoryManagementTableProps) {
  const [historyProduct, setHistoryProduct] = useState<ProductItem | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<ProductItem | null>(null);

  const allSelected = rows.length > 0 && rows.every((r) => r.product.productId && selectedProductIds.includes(r.product.productId));
  const someSelected = selectedProductIds.length > 0 && !allSelected;

  const currentAdjustInventory = adjustingProduct?.productId
    ? rows.find((r) => r.product.productId === adjustingProduct.productId)?.inventory
    : null;

  return (
    <div className="space-y-3">
      {rows.length > 0 ? (
        <div className="flex items-center justify-between px-1 text-xs text-stone-500">
          <label className="flex cursor-pointer items-center gap-2 font-medium hover:text-stone-900 dark:hover:text-stone-200">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected;
              }}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 dark:border-stone-700"
            />
            <span>Select all visible items ({rows.length})</span>
          </label>
          {selectedProductIds.length > 0 ? (
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {selectedProductIds.length} selected
            </span>
          ) : null}
        </div>
      ) : null}

      <DataTable
        columns={[
          {
            key: "select",
            label: "",
          },
          { key: "product", label: "Product & SKU" },
          { key: "category", label: "Category" },
          { key: "stock_health", label: "Available Stock" },
          { key: "reserved", label: "Reserved" },
          { key: "threshold", label: "Threshold" },
          { key: "status", label: "Status" },
          { key: "actions", label: "Actions" },
        ]}
        rows={rows}
        renderRow={({ product, inventory }) => {
          const productId = product.productId ?? "";
          const isSelected = selectedProductIds.includes(productId);
          const available = inventory?.availableQuantity ?? 0;
          const reserved = inventory?.reservedQuantity ?? 0;
          const threshold = inventory?.lowStockThreshold ?? 5;
          const statusInfo = getStatusBadge(inventory);

          // Stock bar calculation (normalizing max visual capacity to max(available, 50))
          const maxCapacity = Math.max(available + reserved, threshold * 3, 20);
          const percent = Math.min(100, Math.round((available / maxCapacity) * 100));

          return (
            <>
              {/* Checkbox column */}
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  aria-label={`Select ${product.name}`}
                  checked={isSelected}
                  onChange={() => onToggleSelect(productId)}
                  className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 dark:border-stone-700"
                />
              </td>

              {/* Product Column */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-900">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-5 w-5 text-stone-400" />
                    )}
                  </div>
                  <div className="min-w-0 max-w-[200px]">
                    <p className="truncate font-semibold text-stone-900 dark:text-stone-50">
                      {product.name}
                    </p>
                    <p className="font-mono text-xs text-stone-400 dark:text-stone-500">
                      {product.sku || "—"}
                    </p>
                  </div>
                </div>
              </td>

              {/* Category Column */}
              <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-300">
                <span className="inline-flex rounded-full border border-stone-200/80 bg-stone-50 px-2.5 py-0.5 text-xs font-medium text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
                  {(product.categoryId ? categoryNames.get(product.categoryId) : undefined) ??
                    "Uncategorized"}
                </span>
              </td>

              {/* Available Stock & Health Bar */}
              <td className="px-4 py-3">
                <div className="w-36 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {available} units
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {available === 0 ? "Empty" : `${percent}%`}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        available === 0
                          ? "w-0 bg-transparent"
                          : available <= threshold
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </td>

              {/* Reserved Quantity */}
              <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-300">
                {reserved > 0 ? (
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {reserved} units
                  </span>
                ) : (
                  <span className="text-stone-400">0</span>
                )}
              </td>

              {/* Threshold */}
              <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-300">
                <span className="rounded-md border border-stone-200/80 px-2 py-0.5 text-xs text-stone-600 dark:border-stone-800 dark:text-stone-400">
                  ≤ {threshold}
                </span>
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <StatusBadge status={statusInfo.variant} />
              </td>

              {/* Action Buttons */}
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-xl px-2.5 text-xs"
                    onClick={() => setAdjustingProduct(product)}
                    title="Quick stock adjustment"
                  >
                    Adjust Stock
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
                    onClick={() => setHistoryProduct(product)}
                    title="Movement history"
                  >
                    <History className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
                    onClick={() => onEditFull(product)}
                    title="Advanced settings"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </>
          );
        }}
      />

      {/* Movement History Drawer */}
      {historyProduct ? (
        <InventoryLedgerDrawer
          product={historyProduct}
          onClose={() => setHistoryProduct(null)}
        />
      ) : null}

      {/* Quick Adjust Modal */}
      {adjustingProduct ? (
        <QuickStockAdjustModal
          product={adjustingProduct}
          currentStock={currentAdjustInventory?.availableQuantity ?? 0}
          lowStockThreshold={currentAdjustInventory?.lowStockThreshold ?? 5}
          isSubmitting={isAdjusting}
          onClose={() => setAdjustingProduct(null)}
          onSubmit={async (newQuantity, note) => {
            if (adjustingProduct.productId) {
              await onQuickAdjustSubmit(adjustingProduct.productId, newQuantity, note);
              setAdjustingProduct(null);
            }
          }}
        />
      ) : null}
    </div>
  );
}
