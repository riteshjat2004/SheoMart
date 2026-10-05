"use client";

import { X, Tag, Package, Store, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, Edit, Layers, Scale, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { ProductItem, StoreItem } from "@/types/marketplace";

interface ProductDetailsModalProps {
  product: ProductItem | null;
  categoryName?: string;
  store?: StoreItem | null;
  onClose: () => void;
  onEdit?: (product: ProductItem) => void;
  onRestock?: (product: ProductItem) => void;
}

export function ProductDetailsModal({
  product,
  categoryName,
  store,
  onClose,
  onEdit,
  onRestock,
}: ProductDetailsModalProps) {
  if (!product) return null;

  const mrp = product.price;
  const sellingPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : mrp;
  const hasDiscount = product.discountPrice && product.discountPrice > 0 && product.discountPrice < mrp;
  const discountPercent = hasDiscount ? Math.round(((mrp - product.discountPrice!) / mrp) * 100) : 0;
  const quantity = product.quantity ?? 0;

  const allImages = [
    product.image?.url,
    product.thumbnail,
    ...(product.images ?? []),
  ].filter(Boolean) as string[];
  const uniqueImages = Array.from(new Set(allImages));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 p-5 dark:border-stone-800/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50">Product Details</h2>
              <p className="text-xs text-stone-500">SKU: {product.sku || "—"}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
            <X className="h-5 w-5 text-stone-500" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Main Info Hero */}
          <div className="flex flex-col gap-5 sm:flex-row">
            {/* Thumbnail / Image Preview */}
            <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-900">
              {uniqueImages.length > 0 ? (
                <img
                  src={uniqueImages[0]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-12 w-12 text-stone-400" />
              )}
            </div>

            {/* Title, Brand, Category, Statuses */}
            <div className="flex-1 space-y-3">
              <div>
                {product.brand ? (
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {product.brand}
                  </p>
                ) : null}
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-50">{product.name}</h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
                  <Layers className="h-3 w-3 text-stone-400" />
                  {categoryName || "Uncategorized"}
                </span>

                <StatusBadge
                  status={
                    product.isActive === false
                      ? "Hidden"
                      : product.isPublished
                        ? "Published"
                        : "Draft"
                  }
                />

                {quantity === 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
                    <AlertCircle className="h-3 w-3" />
                    Out of Stock
                  </span>
                ) : quantity <= 5 ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-400">
                    <AlertCircle className="h-3 w-3" />
                    Low Stock ({quantity})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    In Stock ({quantity})
                  </span>
                )}

                {product.isFeatured ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 dark:border-purple-900/40 dark:bg-purple-950/40 dark:text-purple-400">
                    <Sparkles className="h-3 w-3" />
                    Featured
                  </span>
                ) : null}
              </div>

              {/* Pricing Row */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl font-black text-stone-900 dark:text-stone-50">
                  ₹{sellingPrice.toLocaleString("en-IN")}
                </span>
                {hasDiscount ? (
                  <>
                    <span className="text-sm text-stone-400 line-through dark:text-stone-500">
                      ₹{mrp.toLocaleString("en-IN")}
                    </span>
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {discountPercent}% OFF
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Selling Type & Measurement Units Details */}
          <div className="space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-50/20 p-4 dark:border-emerald-500/10 dark:bg-emerald-950/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {product.sellingType === "WEIGHT" ? (
                  <Scale className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : product.sellingType === "VOLUME" ? (
                  <Droplets className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                )}
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Measurement & Selling Type:{" "}
                  <span className="capitalize">{product.sellingType?.toLowerCase() || "piece"}</span>
                </h4>
              </div>
              <span className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                Base Unit: {product.baseUnit || "piece"} {product.unitLabel ? `(${product.unitLabel})` : ""}
              </span>
            </div>

            {product.allowCustomQuantity ? (
              <div className="rounded-xl border border-emerald-500/20 bg-white/70 px-3 py-2 text-xs text-stone-700 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-300">
                ✓ <strong>Custom Quantities Allowed:</strong> Buyers can choose fractional amounts (Min: {product.minQuantity ?? 1} {product.baseUnit}, Step: {product.stepQuantity ?? 1} {product.baseUnit})
              </div>
            ) : null}

            {/* Variants table */}
            {product.variants && product.variants.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-stone-500">Configured Portion Sizes ({product.variants.length}):</p>
                  <span className="text-[10px] font-medium text-stone-500">
                    Mode: {product.stockTrackingMode === "SHARED" ? "Shared Master Stock" : "Separate Stock per Pack"}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {product.variants.map((v, i) => (
                    <div
                      key={v.variantId || i}
                      className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-2.5 text-xs dark:border-stone-800 dark:bg-stone-900"
                    >
                      <div>
                        <span className="font-bold text-stone-900 dark:text-stone-100">{v.label}</span>
                        {product.stockTrackingMode === "SHARED" ? (
                          <p className="text-[10px] text-stone-500">
                            {v.packQuantity || 1} items/pack • <strong className="text-emerald-600 dark:text-emerald-400">{Math.floor((product.quantity ?? 0) / (v.packQuantity || 1))} available</strong>
                          </p>
                        ) : (
                          <p className="text-[10px] text-stone-500">
                            Stock: <strong className="text-emerald-600 dark:text-emerald-400">{v.stock ?? 0} units</strong>
                          </p>
                        )}
                        {v.sku ? <p className="text-[10px] text-stone-400 font-mono">{v.sku}</p> : null}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{(v.discountPrice && v.discountPrice > 0 ? v.discountPrice : v.price).toLocaleString("en-IN")}
                        </span>
                        {v.discountPrice && v.discountPrice > 0 && v.discountPrice < v.price ? (
                          <span className="ml-1 text-[10px] text-stone-400 line-through">
                            ₹{v.price.toLocaleString("en-IN")}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic">No portion variants configured. Sold at base unit price.</p>
            )}
          </div>

          {/* Gallery Preview if multiple images */}
          {uniqueImages.length > 1 ? (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Product Images</h4>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {uniqueImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900"
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Description</h4>
            <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-4 text-sm leading-relaxed text-stone-700 dark:border-stone-800/80 dark:bg-stone-900/50 dark:text-stone-300">
              {product.description?.trim() ? product.description : "No description provided for this product."}
            </div>
          </div>

          {/* Nutritional Information if available */}
          {product.hasNutritionalInfo && product.nutritionalInfo ? (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Nutritional Information ({product.nutritionalInfo.servingSize || "Approx per 100g"})
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="rounded-xl border border-stone-200/80 bg-stone-50 p-2.5 dark:border-stone-800 dark:bg-stone-900/50">
                  <p className="text-[10px] text-stone-400">Energy</p>
                  <p className="font-bold text-stone-900 dark:text-stone-100">{product.nutritionalInfo.energy || "—"}</p>
                </div>
                <div className="rounded-xl border border-stone-200/80 bg-stone-50 p-2.5 dark:border-stone-800 dark:bg-stone-900/50">
                  <p className="text-[10px] text-stone-400">Protein</p>
                  <p className="font-bold text-stone-900 dark:text-stone-100">{product.nutritionalInfo.protein || "—"}</p>
                </div>
                <div className="rounded-xl border border-stone-200/80 bg-stone-50 p-2.5 dark:border-stone-800 dark:bg-stone-900/50">
                  <p className="text-[10px] text-stone-400">Carbs</p>
                  <p className="font-bold text-stone-900 dark:text-stone-100">{product.nutritionalInfo.carbs || "—"}</p>
                </div>
                <div className="rounded-xl border border-stone-200/80 bg-stone-50 p-2.5 dark:border-stone-800 dark:bg-stone-900/50">
                  <p className="text-[10px] text-stone-400">Fats</p>
                  <p className="font-bold text-stone-900 dark:text-stone-100">{product.nutritionalInfo.fats || "—"}</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Store & Admin Integration Badges */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Store Integration & Trust</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-stone-200/70 p-3.5 dark:border-stone-800/70">
                <Store className="h-5 w-5 text-stone-400" />
                <div>
                  <p className="text-xs text-stone-500">Store Name</p>
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {store?.name || store?.storeName || "My Store"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-stone-200/70 p-3.5 dark:border-stone-800/70">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-xs text-stone-500">Store Tier</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {store?.badge === "royal"
                        ? "👑 Royal Partner"
                        : store?.badge === "verified" || store?.isVerified
                          ? "✓ Verified Store"
                          : "Standard Seller"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-stone-200/60 bg-stone-50/40 p-4 text-xs text-stone-500 dark:border-stone-800/60 dark:bg-stone-900/30 sm:grid-cols-4">
            <div>
              <p className="font-medium text-stone-400">Created</p>
              <p className="mt-1 font-semibold text-stone-700 dark:text-stone-300">
                {product.createdAt ? new Date(product.createdAt).toLocaleDateString("en-IN") : "—"}
              </p>
            </div>
            <div>
              <p className="font-medium text-stone-400">Last Updated</p>
              <p className="mt-1 font-semibold text-stone-700 dark:text-stone-300">
                {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString("en-IN") : "—"}
              </p>
            </div>
            <div>
              <p className="font-medium text-stone-400">Stock Count</p>
              <p className="mt-1 font-semibold text-stone-700 dark:text-stone-300">{quantity} units</p>
            </div>
            <div>
              <p className="font-medium text-stone-400">Catalog Visibility</p>
              <p className="mt-1 font-semibold text-stone-700 dark:text-stone-300">
                {product.isActive ? "Active" : "Archived / Inactive"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-stone-100 p-5 dark:border-stone-800/60">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>

          <div className="flex gap-2">
            {onRestock ? (
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  onRestock(product);
                }}
              >
                <Package className="mr-1.5 h-4 w-4" />
                Adjust Stock
              </Button>
            ) : null}

            {onEdit ? (
              <Button
                onClick={() => {
                  onClose();
                  onEdit(product);
                }}
              >
                <Edit className="mr-1.5 h-4 w-4" />
                Edit Product
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
