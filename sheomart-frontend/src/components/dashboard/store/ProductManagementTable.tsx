"use client";

import {
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  PackagePlus,
  Info,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Package,
  Sparkles,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/DataTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { ProductItem } from "@/types/marketplace";

interface ProductManagementTableProps {
  products: ProductItem[];
  categoryNames: Map<string, string>;
  onViewDetails: (product: ProductItem) => void;
  onEdit: (product: ProductItem) => void;
  onDuplicate: (product: ProductItem) => void;
  onRestock: (product: ProductItem) => void;
  onDelete: (product: ProductItem) => void;
  onToggleStatus: (product: ProductItem) => void;
  isDuplicating?: boolean;
}

export function ProductManagementTable({
  products,
  categoryNames,
  onViewDetails,
  onEdit,
  onDuplicate,
  onRestock,
  onDelete,
  onToggleStatus,
  isDuplicating = false,
}: ProductManagementTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <DataTable
      columns={[
        { key: "product", label: "Product" },
        { key: "category", label: "Category" },
        { key: "price", label: "Price" },
        { key: "stock", label: "Stock" },
        { key: "status", label: "Visibility" },
        { key: "actions", label: "Actions" },
      ]}
      rows={products}
      renderRow={(product) => {
        const mrp = product.price;
        const sellingPrice =
          product.discountPrice && product.discountPrice > 0
            ? product.discountPrice
            : mrp;
        const hasDiscount =
          product.discountPrice &&
          product.discountPrice > 0 &&
          product.discountPrice < mrp;
        const discountPercent = hasDiscount
          ? Math.round(((mrp - product.discountPrice!) / mrp) * 100)
          : 0;
        const quantity = product.quantity ?? 0;
        const isMenuOpen = activeMenuId === product.productId;

        return (
          <>
            {/* Product Column */}
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-900">
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
                <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-semibold text-stone-900 dark:text-stone-50">
                      {product.name}
                    </p>
                    {product.isFeatured ? (
                      <span title="Featured Product">
                        <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500">
                    <span className="font-mono">{product.sku ?? "—"}</span>
                    {product.brand ? (
                      <>
                        <span>•</span>
                        <span className="truncate">{product.brand}</span>
                      </>
                    ) : null}
                  </div>
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

            {/* Price Column */}
            <td className="px-4 py-3">
              <div className="text-sm">
                <span className="font-semibold text-stone-900 dark:text-stone-50">
                  ₹{sellingPrice.toLocaleString("en-IN")}
                </span>
                {hasDiscount ? (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-stone-400 line-through">
                      ₹{mrp.toLocaleString("en-IN")}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {discountPercent}% OFF
                    </span>
                  </div>
                ) : null}
              </div>
            </td>

            {/* Stock Level Column */}
            <td className="px-4 py-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  {quantity === 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                      <AlertCircle className="h-3 w-3" />
                      0 units
                    </span>
                  ) : quantity <= 5 ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                      <AlertCircle className="h-3 w-3" />
                      {quantity} left (Low)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      {quantity} in stock
                    </span>
                  )}
                </div>
              </div>
            </td>

            {/* Status Column */}
            <td className="px-4 py-3">
              <StatusBadge
                status={
                  product.isActive === false
                    ? "Hidden"
                    : product.isPublished
                      ? "Published"
                      : "Draft"
                }
              />
            </td>

            {/* Actions Column */}
            <td className="px-4 py-3 text-right">
              <div className="flex items-center justify-end gap-1.5">
                {/* View Details */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
                  onClick={() => onViewDetails(product)}
                  title="View details"
                >
                  <Info className="h-4 w-4" />
                </Button>

                {/* Edit */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-stone-500 hover:text-emerald-600 dark:text-stone-400 dark:hover:text-emerald-400"
                  onClick={() => onEdit(product)}
                  title="Edit product"
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                {/* Quick Restock */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-stone-500 hover:text-emerald-600 dark:text-stone-400 dark:hover:text-emerald-400"
                  onClick={() => onRestock(product)}
                  title="Quick restock"
                >
                  <PackagePlus className="h-4 w-4" />
                </Button>

                {/* Dropdown Menu for More Options */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(isMenuOpen ? null : (product.productId ?? null));
                    }}
                    title="More actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>

                  {isMenuOpen ? (
                    <div
                      ref={menuRef}
                      className="absolute right-0 z-30 mt-1 w-44 rounded-2xl border border-stone-200 bg-white p-1.5 shadow-xl dark:border-stone-800 dark:bg-stone-900"
                    >
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
                        onClick={() => {
                          setActiveMenuId(null);
                          onDuplicate(product);
                        }}
                        disabled={isDuplicating}
                      >
                        <Copy className="h-3.5 w-3.5 text-stone-500" />
                        Duplicate Product
                      </button>

                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
                        onClick={() => {
                          setActiveMenuId(null);
                          onToggleStatus(product);
                        }}
                      >
                        {product.isActive === false ? (
                          <>
                            <Eye className="h-3.5 w-3.5 text-stone-500" />
                            Unhide / Restore
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3.5 w-3.5 text-stone-500" />
                            Hide Product
                          </>
                        )}
                      </button>

                      <div className="my-1 border-t border-stone-100 dark:border-stone-800" />

                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                        onClick={() => {
                          setActiveMenuId(null);
                          onDelete(product);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                        Delete Product
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </td>
          </>
        );
      }}
    />
  );
}
