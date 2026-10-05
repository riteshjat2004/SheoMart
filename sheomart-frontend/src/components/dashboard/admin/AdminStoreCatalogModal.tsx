"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  Search,
  Filter,
  CheckSquare,
  Square,
  Package,
  Sparkles,
  Layers,
  ArrowRight,
  Store,
  Plus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchProducts, fetchStoreExistingProducts } from "@/services/product";
import { fetchCategories } from "@/services/category";
import type { ProductItem, StoreItem } from "@/types/marketplace";

interface AdminStoreCatalogModalProps {
  store: StoreItem | null;
  open: boolean;
  onClose: () => void;
  onCloneSuccess: (clonedCount: number) => void;
  onCreateCustomProduct?: (store: StoreItem) => void;
  onClone: (payload: {
    targetStoreId: string;
    productIds: string[];
    defaultStock: number;
    isPublished: boolean;
  }) => Promise<void>;
  isCloning?: boolean;
}

export function AdminStoreCatalogModal({
  store,
  open,
  onClose,
  onCloneSuccess,
  onCreateCustomProduct,
  onClone,
  isCloning = false,
}: AdminStoreCatalogModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [presenceFilter, setPresenceFilter] = useState<"all" | "available" | "existing">("all");
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [defaultStock, setDefaultStock] = useState<number>(20);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const targetStoreId = store?.storeId || store?._id || "";

  // Fetch all master catalog products
  const {
    data: allProducts = [],
    isLoading: isLoadingProducts,
    isError: isProductsError,
  } = useQuery({
    queryKey: ["admin-master-catalog-products"],
    queryFn: fetchProducts,
    enabled: open,
    staleTime: 60 * 1000,
  });

  // Fetch categories for filtering
  const { data: categories = [] } = useQuery({
    queryKey: ["categories-list"],
    queryFn: fetchCategories,
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch target store's existing products to prevent duplicate additions
  const {
    data: existingStoreData,
    isLoading: isLoadingExisting,
  } = useQuery({
    queryKey: ["admin-store-existing-products", targetStoreId],
    queryFn: () => fetchStoreExistingProducts(targetStoreId),
    enabled: open && Boolean(targetStoreId),
    staleTime: 30 * 1000,
  });

  const existingProductIds = useMemo(() => {
    return new Set(existingStoreData?.existingSourceProductIds || []);
  }, [existingStoreData]);

  const existingNames = useMemo(() => {
    return new Set(existingStoreData?.existingNames || []);
  }, [existingStoreData]);

  const existingCleanSkus = useMemo(() => {
    return new Set(existingStoreData?.existingCleanSkus || []);
  }, [existingStoreData]);

  // Check if a catalog product is already present in this store
  const isProductAlreadyInStore = (product: ProductItem): boolean => {
    if (product.storeId === targetStoreId) return true;
    const pid = product.productId || product._id;
    if (pid && existingProductIds.has(pid)) return true;
    if (product.sourceProductId && existingProductIds.has(product.sourceProductId)) return true;
    if (product.name && existingNames.has(product.name.trim().toLowerCase())) return true;
    const cleanSku = product.sku?.replace(/-STR\w+(-[0-9]+)?$/i, "").trim().toUpperCase();
    if (cleanSku && existingCleanSkus.has(cleanSku)) return true;
    return false;
  };

  // Compute counts
  const counts = useMemo(() => {
    let availableCount = 0;
    let inStoreCount = 0;
    for (const p of allProducts) {
      if (isProductAlreadyInStore(p)) {
        inStoreCount++;
      } else {
        availableCount++;
      }
    }
    return {
      total: allProducts.length,
      available: availableCount,
      inStore: inStoreCount,
    };
  }, [allProducts, existingProductIds, existingNames, existingCleanSkus, targetStoreId]);

  // Filter catalog products
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const alreadyInStore = isProductAlreadyInStore(product);

      // Presence filter
      if (presenceFilter === "available" && alreadyInStore) {
        return false;
      }
      if (presenceFilter === "existing" && !alreadyInStore) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesBrand = (product.brand ?? "").toLowerCase().includes(q);
        const matchesSku = (product.sku ?? "").toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesSku) return false;
      }

      // Filter by category
      if (selectedCategory !== "all") {
        const matchesCatId = product.categoryId === selectedCategory;
        const matchesCatName = product.category === selectedCategory;
        if (!matchesCatId && !matchesCatName) return false;
      }

      return true;
    });
  }, [
    allProducts,
    targetStoreId,
    searchQuery,
    selectedCategory,
    presenceFilter,
    existingProductIds,
    existingNames,
    existingCleanSkus,
  ]);

  const selectableFilteredProducts = useMemo(() => {
    return filteredProducts.filter((p) => !isProductAlreadyInStore(p));
  }, [filteredProducts, existingProductIds, existingNames, existingCleanSkus, targetStoreId]);

  const allFilteredSelected =
    selectableFilteredProducts.length > 0 &&
    selectableFilteredProducts.every((p) => p.productId && selectedProductIds.has(p.productId));

  const toggleSelectAllFiltered = () => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        // Deselect filtered selectable
        selectableFilteredProducts.forEach((p) => {
          if (p.productId) next.delete(p.productId);
        });
      } else {
        // Select all filtered selectable
        selectableFilteredProducts.forEach((p) => {
          if (p.productId) next.add(p.productId);
        });
      }
      return next;
    });
  };

  const toggleProduct = (product: ProductItem) => {
    if (isProductAlreadyInStore(product)) return;
    const pid = product.productId || product._id;
    if (!pid) return;

    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) {
        next.delete(pid);
      } else {
        next.add(pid);
      }
      return next;
    });
  };

  const handleImport = async () => {
    // Filter out any IDs that might already be present in store
    const validProductIds = Array.from(selectedProductIds).filter((pid) => {
      const prod = allProducts.find((p) => p.productId === pid || p._id === pid);
      return prod ? !isProductAlreadyInStore(prod) : false;
    });

    if (validProductIds.length === 0) {
      setErrorMsg("Please select at least one product that is not already present in this store.");
      return;
    }
    if (!targetStoreId) {
      setErrorMsg("Store ID is missing.");
      return;
    }

    try {
      setErrorMsg(null);
      await onClone({
        targetStoreId,
        productIds: validProductIds,
        defaultStock: Number(defaultStock) || 0,
        isPublished,
      });
      onCloneSuccess(validProductIds.length);
      setSelectedProductIds(new Set());
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to assign products to store";
      setErrorMsg(msg);
    }
  };

  if (!open || !store) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">
                  Stock Store from Master Catalog
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <Store className="h-3 w-3" />
                  {store.storeName || store.name}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                Instantly populate this store with existing SheoMart catalog items. Images are shared to save Cloudinary storage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onCreateCustomProduct && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onCreateCustomProduct(store);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Create New Custom Product
              </Button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Filters & Options */}
        <div className="border-b border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search products by title, brand, or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2 pl-9 pr-4 text-sm text-stone-900 placeholder-stone-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-stone-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter products by category"
                className="w-full sm:w-48 rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-sm text-stone-700 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.categoryId || cat._id || cat.name} value={cat.categoryId || cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Presence Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-100 dark:border-stone-800/60">
            <span className="text-xs font-medium text-stone-400">Filter:</span>
            <div className="flex items-center gap-1.5 bg-stone-100/80 dark:bg-stone-800/80 p-0.5 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setPresenceFilter("all")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  presenceFilter === "all"
                    ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
              >
                All ({counts.total})
              </button>
              <button
                type="button"
                onClick={() => setPresenceFilter("available")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition ${
                  presenceFilter === "available"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
              >
                <Sparkles className="h-3 w-3" />
                Available to Stock ({counts.available})
              </button>
              <button
                type="button"
                onClick={() => setPresenceFilter("existing")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition ${
                  presenceFilter === "existing"
                    ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-sm"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Already in Store ({counts.inStore})
              </button>
            </div>
          </div>

          {/* Configuration & Selection Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleSelectAllFiltered}
                disabled={selectableFilteredProducts.length === 0}
                className="h-8 text-xs font-medium text-stone-700 dark:text-stone-300 disabled:opacity-40"
              >
                {allFilteredSelected ? (
                  <CheckSquare className="mr-1.5 h-4 w-4 text-emerald-600" />
                ) : (
                  <Square className="mr-1.5 h-4 w-4 text-stone-400" />
                )}
                {allFilteredSelected ? "Deselect Available" : "Select All Available"}
              </Button>

              {selectedProductIds.size > 0 && (
                <>
                  <span className="text-stone-300 dark:text-stone-700">|</span>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {selectedProductIds.size} selected
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedProductIds(new Set())}
                    className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline"
                  >
                    Clear selection
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-stone-500 dark:text-stone-400 font-medium">Initial Stock:</span>
                <input
                  type="number"
                  min="0"
                  max="99999"
                  value={defaultStock}
                  onChange={(e) => setDefaultStock(Math.max(0, parseInt(e.target.value) || 0))}
                  aria-label="Initial stock per product"
                  className="w-16 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-center font-bold text-stone-800 focus:border-emerald-500 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 dark:text-stone-300 font-medium">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                Publish in store immediately
              </label>
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="flex items-center gap-2 border-b border-rose-200 bg-rose-50 px-6 py-2.5 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Product Catalog List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoadingProducts || isLoadingExisting ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
              <p className="mt-3 text-sm text-stone-500">Loading SheoMart master catalog...</p>
            </div>
          ) : isProductsError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-stone-500">
              <AlertCircle className="h-10 w-10 text-rose-500 mb-2" />
              <p className="font-semibold text-stone-800 dark:text-stone-200">Unable to load catalog products</p>
              <p className="text-xs text-stone-400 mt-1">Please try again or check network connection.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-stone-500">
              <Package className="h-10 w-10 text-stone-300 mb-2" />
              <p className="font-semibold text-stone-800 dark:text-stone-200">No products found</p>
              <p className="text-xs text-stone-400 mt-1">
                Try adjusting your search query, filter tabs, or category filter.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const pid = product.productId || product._id || "";
                const isAlready = isProductAlreadyInStore(product);
                const isSelected = selectedProductIds.has(pid);
                const imgSrc = product.image?.url || product.thumbnail || product.images?.[0] || "";

                return (
                  <div
                    key={pid}
                    onClick={() => {
                      if (!isAlready) {
                        toggleProduct(product);
                      }
                    }}
                    title={
                      isAlready
                        ? `${product.name} is already present in this store and cannot be pushed again.`
                        : undefined
                    }
                    className={`group relative flex gap-3 rounded-2xl border p-3.5 transition-all duration-200 ${
                      isAlready
                        ? "border-emerald-200/60 bg-emerald-50/20 dark:border-emerald-900/30 dark:bg-emerald-950/10 cursor-not-allowed opacity-80"
                        : isSelected
                        ? "cursor-pointer border-emerald-500 bg-emerald-50/30 shadow-md ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/20"
                        : "cursor-pointer border-stone-200 bg-white hover:border-emerald-300 hover:shadow-sm dark:border-stone-800 dark:bg-stone-800/60"
                    }`}
                  >
                    {/* Checkbox / Already In Store Indicator */}
                    <div className="pt-0.5 shrink-0">
                      {isAlready ? (
                        <div
                          className="flex h-4 w-4 items-center justify-center rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          title="Already present in store"
                        >
                          <Check className="h-3 w-3" />
                        </div>
                      ) : (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProduct(product)}
                          className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          aria-label={`Select ${product.name}`}
                        />
                      )}
                    </div>

                    {/* Thumbnail */}
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-900">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={product.name}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-stone-400">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-1.5">
                          <h4
                            className={`line-clamp-1 text-sm font-semibold transition ${
                              isAlready
                                ? "text-stone-700 dark:text-stone-300"
                                : "text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400"
                            }`}
                          >
                            {product.name}
                          </h4>
                          {isAlready && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              <Check className="h-2.5 w-2.5" />
                              In Store
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                          <span className="truncate">{product.brand || "SheoMart Basic"}</span>
                          {product.sellingType && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                {product.sellingType === "WEIGHT"
                                  ? `Weight (${product.baseUnit || "kg"})`
                                  : product.sellingType === "VOLUME"
                                  ? `Volume (${product.baseUnit || "L"})`
                                  : "Piece"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          ₹{product.price}
                        </span>
                        {product.variants && product.variants.length > 0 ? (
                          <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                            {product.variants.length} packs
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400 font-mono">
                            SKU: {product.sku?.slice(-6) || "AUTO"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-200 bg-stone-50/70 px-6 py-4 dark:border-stone-800 dark:bg-stone-900/70">
          <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Duplicate prevention active. Products already in {store.storeName || store.name || "this store"} are locked and cannot be pushed again.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isCloning}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={selectedProductIds.size === 0 || isCloning}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20"
            >
              {isCloning ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Assigning products...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  <span>Assign {selectedProductIds.size} Products to Store</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
