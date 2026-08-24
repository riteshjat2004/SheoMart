"use client";

import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/DataTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { ProductItem } from "@/types/marketplace";

interface ProductManagementTableProps {
  products: ProductItem[];
  categoryNames: Map<string, string>;
  onEdit: (product: ProductItem) => void;
  onDelete: (product: ProductItem) => void;
  onToggleStatus: (product: ProductItem) => void;
}

export function ProductManagementTable({ products, categoryNames, onEdit, onDelete, onToggleStatus }: ProductManagementTableProps) {
  return (
    <DataTable
      columns={[
        { key: "name", label: "Product" },
        { key: "category", label: "Category" },
        { key: "price", label: "Price" },
        { key: "status", label: "Status" },
        { key: "actions", label: "Actions" },
      ]}
      rows={products}
      renderRow={(product) => (
        <>
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 dark:border-stone-800">
                {product.thumbnail ? (
                  <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div>
                <p className="font-semibold text-stone-900 dark:text-stone-50">{product.name}</p>
                <p className="text-xs text-stone-500">{product.sku ?? "—"}</p>
              </div>
            </div>
          </td>
          <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-300">{(product.categoryId ? categoryNames.get(product.categoryId) : undefined) ?? "Uncategorized"}</td>
          <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-300">{product.discountPrice ?? product.price}</td>
          <td className="px-4 py-3">
            <StatusBadge
              status={
                product.isActive === false
                  ? product.isPublished
                    ? "Hidden"
                    : "Archived"
                  : product.isPublished
                    ? "Published"
                    : "Draft"
              }
            />
          </td>
          <td className="px-4 py-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => onToggleStatus(product)}>
                {product.isActive === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {product.isActive === false ? "Restore" : "Hide"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(product)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </td>
        </>
      )}
    />
  );
}
