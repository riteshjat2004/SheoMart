"use client";

import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/DataTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { ProductItem } from "@/types/marketplace";
import type { InventoryItem } from "@/types/inventory";

interface InventoryManagementTableProps {
  rows: Array<{ product: ProductItem; inventory: InventoryItem | null }>;
  onEdit: (product: ProductItem) => void;
}

function getStatus(inventory: InventoryItem | null) {
  const availableQuantity = inventory?.availableQuantity ?? 0;
  const threshold = inventory?.lowStockThreshold ?? 0;

  if (availableQuantity === 0) {
    return "Out of Stock";
  }

  if (availableQuantity <= threshold) {
    return "Low Stock";
  }

  return "In Stock";
}

function formatUpdatedAt(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

export function InventoryManagementTable({ rows, onEdit }: InventoryManagementTableProps) {
  return (
    <DataTable
      columns={[
        { key: "product", label: "Product" },
        { key: "sku", label: "SKU" },
        { key: "category", label: "Category" },
        { key: "available", label: "Available quantity" },
        { key: "threshold", label: "Threshold" },
        { key: "status", label: "Status" },
        { key: "updated", label: "Last updated" },
        { key: "actions", label: "Update stock" },
      ]}
      rows={rows}
      renderRow={({ product, inventory }) => (
        <>
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-200 bg-stone-100 text-stone-600 dark:border-stone-800 dark:bg-stone-900">
                <Package className="h-5 w-5" />
              </div>
              <p className="font-semibold text-stone-900 dark:text-stone-50">{product.name}</p>
            </div>
          </td>
          <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-300">{product.sku ?? "-"}</td>
          <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-300">{product.category ?? "Uncategorized"}</td>
          <td className="px-4 py-3 text-sm font-semibold text-stone-700 dark:text-stone-200">{inventory?.availableQuantity ?? 0}</td>
          <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-300">{inventory?.lowStockThreshold ?? 0}</td>
          <td className="px-4 py-3"><StatusBadge status={getStatus(inventory)} /></td>
          <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-300">{formatUpdatedAt(inventory?.updatedAt)}</td>
          <td className="px-4 py-3">
            <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
              <Package className="h-4 w-4" />
              Update stock
            </Button>
          </td>
        </>
      )}
    />
  );
}
