"use client";

import { useState } from "react";
import {
  X,
  Package,
  Store as StoreIcon,
  Tag,
  Calendar,
  AlertTriangle,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Trash2,
  RotateCcw,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminProduct, AdminProductInventoryStatus } from "@/types/admin-product";

interface ProductDetailsModalProps {
  product: AdminProduct | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (product: AdminProduct) => void;
  onToggleStatus?: (product: AdminProduct) => void;
  onDelete?: (product: AdminProduct) => void;
  onRestore?: (product: AdminProduct) => void;
}

const inventoryStatusStyles: Record<AdminProductInventoryStatus, string> = {
  in_stock: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  low_stock: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  out_of_stock: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
  discontinued: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  unavailable: "bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700",
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export function ProductDetailsModal({
  product,
  open,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete,
  onRestore,
}: ProductDetailsModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!open || !product) return null;

  // Build images array
  const allImages: string[] = [];
  if (product.thumbnail) allImages.push(product.thumbnail);
  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      if (img && !allImages.includes(img)) {
        allImages.push(img);
      }
    }
  }

  const currentImage = allImages[selectedImageIndex] || allImages[0] || "";
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-950">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Package className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50 truncate max-w-lg">
                {product.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                <span className="font-mono">SKU: {product.sku}</span>
                {product.brand && <span>· Brand: {product.brand}</span>}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Badges Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                product.isActive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${product.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
              {product.isActive ? "Active" : "Inactive"}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                product.isPublished
                  ? "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400"
                  : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300"
              }`}
            >
              {product.isPublished ? "Published" : "Draft"}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                inventoryStatusStyles[product.inventoryStatus] ?? inventoryStatusStyles.unavailable
              }`}
            >
              {product.inventoryStatus.replace("_", " ")} ({product.quantity} in stock)
            </span>

            {product.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                <Sparkles className="h-3 w-3" />
                Featured
              </span>
            )}

            {product.isDeleted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                <Trash2 className="h-3 w-3" />
                Deleted (Soft)
              </span>
            )}
          </div>

          {/* Grid: Media + Core Metrics */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left: Images */}
            <div className="space-y-3">
              <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900">
                {currentImage ? (
                  <img src={currentImage} alt={product.name} className="h-full w-full object-contain p-2" />
                ) : (
                  <Package className="h-16 w-16 text-stone-300" />
                )}
                {hasDiscount && (
                  <span className="absolute left-3 top-3 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails row */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                        selectedImageIndex === idx
                          ? "border-emerald-500 ring-2 ring-emerald-500/20"
                          : "border-stone-200 hover:border-stone-300 dark:border-stone-800"
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Key Details */}
            <div className="space-y-4">
              {/* Pricing Card */}
              <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/40 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Pricing & Value
                </span>
                <div className="flex items-baseline gap-3">
                  {hasDiscount ? (
                    <>
                      <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                        {formatPrice(product.discountPrice)}
                      </span>
                      <span className="text-sm text-stone-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Save {formatPrice(product.price - product.discountPrice)}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-stone-900 dark:text-stone-50">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Inventory & Stock Card */}
              <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/40 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Inventory & Stock
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-stone-900 dark:text-stone-50">
                      {product.quantity}
                    </span>
                    <span className="ml-2 text-xs text-stone-500">units available</span>
                  </div>
                  {product.quantity <= 10 && product.quantity > 0 && (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5" /> Low stock alert
                    </span>
                  )}
                  {product.quantity <= 0 && (
                    <span className="flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="h-3.5 w-3.5" /> Out of stock
                    </span>
                  )}
                </div>
              </div>

              {/* Category & Store Meta */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-stone-200 p-3 dark:border-stone-800">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400">
                    <Tag className="h-3.5 w-3.5" /> Category
                  </div>
                  <p className="mt-1 font-semibold text-stone-800 dark:text-stone-200 truncate">
                    {product.category?.name ?? "Unassigned"}
                  </p>
                </div>

                <div className="rounded-xl border border-stone-200 p-3 dark:border-stone-800">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400">
                    <StoreIcon className="h-3.5 w-3.5" /> Store
                  </div>
                  <p className="mt-1 font-semibold text-stone-800 dark:text-stone-200 truncate">
                    {product.store?.storeName ?? "Unassigned"}
                  </p>
                </div>
              </div>

              {/* Timestamp Info */}
              <div className="rounded-xl border border-stone-200/80 p-3 text-xs text-stone-500 dark:border-stone-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Created:</span>
                  <span className="font-medium text-stone-700 dark:text-stone-300">{formatDate(product.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Updated:</span>
                  <span className="font-medium text-stone-700 dark:text-stone-300">{formatDate(product.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="rounded-xl border border-stone-200 p-4 dark:border-stone-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
              Product Description
            </h4>
            <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-line leading-relaxed">
              {product.description || "No description provided for this product."}
            </p>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-stone-50/60 px-6 py-4 dark:border-stone-800 dark:bg-stone-900/60">
          <div className="flex items-center gap-2">
            {product.isDeleted ? (
              onRestore && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onRestore(product);
                  }}
                  className="text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400"
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Restore Product
                </Button>
              )
            ) : (
              onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onDelete(product);
                  }}
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Delete Product
                </Button>
              )
            )}

            {onToggleStatus && !product.isDeleted && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onToggleStatus(product);
                }}
              >
                {product.isActive ? (
                  <>
                    <ToggleLeft className="h-4 w-4 mr-1.5 text-stone-400" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <ToggleRight className="h-4 w-4 mr-1.5 text-emerald-600" />
                    Activate
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            {onEdit && !product.isDeleted && (
              <Button
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(product);
                }}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Pencil className="h-4 w-4 mr-1.5" />
                Edit Product
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
