"use client";

import { Package, AlertTriangle, PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/DataTable";
import type { ProductItem } from "@/types/marketplace";
import type { InventoryItem } from "@/types/inventory";

interface InventoryManagementTableProps {
  rows: Array<{ product: ProductItem; inventory: InventoryItem | null }>;
  onEdit: (product: ProductItem) => void;
  onDiscontinue: (product: ProductItem) => void;
}

function statusLabel(status?: string) {
  switch (status) {
    case "low_stock":
      return "Low stock";
    case "out_of_stock":
      return "Out of stock";
    case "discontinued":
      return "Discontinued";
    default:
      return "In stock";
  }
}

export function InventoryManagementTable({ rows, onEdit, onDiscontinue }: InventoryManagementTableProps) {
  return (
    <DataTable
      columns={[
        { key: "product", label: "Product" },
        { key: "stock", label: "Stock" },
        { key: "status", label: "Status" },
        { key: "actions", label: "Actions" },
      ]}
      rows={rows}
      renderRow={({ product, inventory }) => (
        <>
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-200 bg-stone-100 text-stone-600 dark:border-stone-800 dark:bg-stone-900">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-stone-900 dark:text-stone-50">{product.name}</p>
                <p className="text-xs text-stone-500">{product.sku ?? "—"}</p>
              </div>
            </div>
          </td>
          <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-300">
            <div>Available: {inventory?.availableQuantity ?? 0}</div>
            <div>Reserved: {inventory?.reservedQuantity ?? 0}</div>
            <div>Sold: {inventory?.soldQuantity ?? 0}</div>
          </td>
          <td className="px-4 py-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${inventory?.status === "discontinued" ? "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300" : inventory?.status === "out_of_stock" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" : inventory?.status === "low_stock" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"}`}>
              {inventory?.status ? statusLabel(inventory.status) : "Unknown"}
            </span>
          </td>
          <td className="px-4 py-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
                <Package className="h-4 w-4" />
                Update
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDiscontinue(product)}>
                {inventory?.status === "discontinued" ? <PauseCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                {inventory?.status === "discontinued" ? "Archived" : "Discontinue"}
              </Button>
            </div>
          </td>
        </>
      )}
    />
  );
}
