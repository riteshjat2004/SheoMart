"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Boxes,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Coins,
  PackageCheck,
  PlusCircle,
  RotateCcw,
} from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { Pagination } from "@/components/dashboard/Pagination";
import { Button } from "@/components/ui/button";
import { ProductModal } from "@/components/dashboard/store/ProductModal";
import { InventoryForm, type InventoryFormValues } from "@/components/dashboard/store/InventoryForm";
import { InventoryManagementTable } from "@/components/dashboard/store/InventoryManagementTable";
import { fetchStoreProducts } from "@/services/product";
import { fetchCategories } from "@/services/category";
import { syncStoreInventory, updateInventory } from "@/services/inventory";
import { useInvalidatePosCatalog } from "@/hooks/use-pos-catalog";
import type { CategoryItem, ProductItem, ProductVariant } from "@/types/marketplace";
import type { InventoryItem, UpdateInventoryPayload } from "@/types/inventory";


const PAGE_SIZE = 8;
type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock" | "discontinued";

function getInventoryStatus(inventory: InventoryItem | null): InventoryStatus {
  if (inventory?.status === "discontinued") return "discontinued";
  const available = inventory?.availableQuantity ?? 0;
  const threshold = inventory?.lowStockThreshold ?? 5;

  if (available === 0) return "out_of_stock";
  return available <= threshold ? "low_stock" : "in_stock";
}

export default function StoreInventoryPage() {
  const queryClient = useQueryClient();
  const invalidatePosCatalog = useInvalidatePosCatalog();
  const [query, setQuery] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("stock_asc");
  const [page, setPage] = useState(1);

  // Selection states
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkRestockOpen, setIsBulkRestockOpen] = useState(false);
  const [bulkAmount, setBulkAmount] = useState("10");

  // Edit modal
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Queries
  const productsQuery = useQuery<ProductItem[], Error>({
    queryKey: ["store-products"],
    queryFn: fetchStoreProducts,
    staleTime: 1000 * 60 * 3,
  });
  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);

  const { data: categories = [] } = useQuery<CategoryItem[], Error>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
  });

  const categoryNames = useMemo(
    () =>
      new Map(
        categories.flatMap((category) =>
          category.categoryId ? [[category.categoryId, category.name] as const] : []
        )
      ),
    [categories]
  );

  const inventoryQuery = useQuery<Record<string, InventoryItem | null>>({
    queryKey: ["inventory-map", products.map((product) => product.productId).filter(Boolean)],
    queryFn: async () => {
      const results: Record<string, InventoryItem | null> = {};
      const inventories = await syncStoreInventory();
      for (const inv of inventories) {
        if (inv.productId) {
          results[inv.productId] = inv;
        }
      }
      return results;
    },
    enabled: products.length > 0,
    staleTime: 1000 * 60 * 3,
  });
  const inventoryMap = useMemo(() => inventoryQuery.data ?? {}, [inventoryQuery.data]);

  // Combined rows
  const inventoryRows = useMemo(
    () =>
      products.map((product) => ({
        product,
        inventory: product.productId ? inventoryMap[product.productId] ?? null : null,
      })),
    [products, inventoryMap]
  );

  // KPIs
  const summary = useMemo(() => {
    let totalItems = inventoryRows.length;
    let totalUnits = 0;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let totalValue = 0;

    for (const row of inventoryRows) {
      const available = row.inventory?.availableQuantity ?? 0;
      const price =
        row.product.discountPrice && row.product.discountPrice > 0
          ? row.product.discountPrice
          : row.product.price;
      totalUnits += available;
      totalValue += available * price;

      const st = getInventoryStatus(row.inventory);
      if (st === "in_stock") inStock++;
      else if (st === "low_stock") lowStock++;
      else if (st === "out_of_stock") outOfStock++;
    }

    return { totalItems, totalUnits, inStock, lowStock, outOfStock, totalValue };
  }, [inventoryRows]);

  // Filtering & Sorting
  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return inventoryRows
      .filter(({ product, inventory }) => {
        const categoryName = product.categoryId ? categoryNames.get(product.categoryId) ?? "" : "";
        const matchesSearch =
          !normalized ||
          [product.name, product.sku, product.brand, categoryName]
            .filter(Boolean)
            .some((val) => val?.toLowerCase().includes(normalized));

        const matchesCategory =
          categoryFilter === "all" ||
          product.categoryId === categoryFilter ||
          product.category === categoryFilter;

        const matchesStatus =
          statusFilter === "all" || getInventoryStatus(inventory) === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        const stockA = a.inventory?.availableQuantity ?? 0;
        const stockB = b.inventory?.availableQuantity ?? 0;

        if (sortBy === "stock_asc") return stockA - stockB;
        if (sortBy === "stock_desc") return stockB - stockA;
        if (sortBy === "name_asc") return a.product.name.localeCompare(b.product.name);
        if (sortBy === "value_desc") {
          const valA = stockA * (a.product.discountPrice || a.product.price);
          const valB = stockB * (b.product.discountPrice || b.product.price);
          return valB - valA;
        }
        return 0;
      });
  }, [inventoryRows, query, categoryFilter, statusFilter, sortBy, categoryNames]);

  const pagedRows = useMemo(
    () => filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredRows, page]
  );
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  // Mutations
  const invalidateInventoryQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["inventory-map"] }),
      queryClient.invalidateQueries({ queryKey: ["store-products"] }),
      queryClient.invalidateQueries({ queryKey: ["products"] }),
      queryClient.invalidateQueries({ queryKey: ["product"] }),
      queryClient.invalidateQueries({ queryKey: ["inventory-ledger"] }),
      invalidatePosCatalog(), // Keep POS Billing catalog in sync
    ]);
  };


  const updateMutation = useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: string;
      payload: UpdateInventoryPayload;
    }) => updateInventory(productId, payload),
    onSuccess: async () => {
      await invalidateInventoryQueries();
      setEditingProduct(null);
      setFeedback({ type: "success", message: "Inventory updated successfully." });
    },
    onError: (err) =>
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Unable to update inventory.",
      }),
  });

  const handleUpdate = (values: InventoryFormValues, variants?: ProductVariant[]) => {
    if (!editingProduct?.productId) return;
    setFeedback(null);
    updateMutation.mutate({
      productId: editingProduct.productId,
      payload: {
        ...values,
        variants,
      },
    });
  };

  const handleQuickAdjust = async (
    productId: string,
    newQuantity: number,
    note?: string,
    variants?: ProductVariant[]
  ) => {
    setFeedback(null);
    await updateMutation.mutateAsync({
      productId,
      payload: {
        availableQuantity: newQuantity,
        note,
        variants,
      },
    });
  };

  // Bulk Restock Handler
  const handleBulkRestock = async () => {
    const addUnits = parseInt(bulkAmount, 10);
    if (isNaN(addUnits) || addUnits <= 0) return;

    try {
      setFeedback(null);
      for (const prodId of selectedProductIds) {
        const currentQty = inventoryMap[prodId]?.availableQuantity ?? 0;
        await updateInventory(prodId, { availableQuantity: currentQty + addUnits });
      }
      await invalidateInventoryQueries();
      setIsBulkRestockOpen(false);
      setSelectedProductIds([]);
      setFeedback({
        type: "success",
        message: `Successfully added ${addUnits} units to ${selectedProductIds.length} products.`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error during bulk stock update.",
      });
    }
  };

  // Selection toggle handlers
  const handleToggleSelect = (productId: string) => {
    setSelectedProductIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
    );
  };

  const handleSelectAll = (select: boolean) => {
    if (select) {
      const allIds = filteredRows
        .map((r) => r.product.productId)
        .filter(Boolean) as string[];
      setSelectedProductIds(allIds);
    } else {
      setSelectedProductIds([]);
    }
  };

  const refreshInventory = async () => {
    setFeedback(null);
    await Promise.all([productsQuery.refetch(), inventoryQuery.refetch()]);
  };

  const resetFilters = () => {
    setQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setSortBy("stock_asc");
    setPage(1);
  };

  const isLoading = productsQuery.isLoading || inventoryQuery.isLoading;
  const isRefreshing = productsQuery.isFetching || inventoryQuery.isFetching;
  const isError = productsQuery.isError || inventoryQuery.isError;
  const error = productsQuery.error ?? inventoryQuery.error;
  const hasActiveFilters =
    Boolean(query) || categoryFilter !== "all" || statusFilter !== "all" || sortBy !== "stock_asc";

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Store" }, { label: "Inventory" }]} />

      <PageHeader
        title="Inventory Management"
        description="Monitor stock levels, execute quick adjustments, inspect movement ledgers, and manage bulk restocks."
        actions={
          <Button
            variant="outline"
            onClick={refreshInventory}
            disabled={isRefreshing}
            className="rounded-xl"
          >
            <RefreshCw className={`mr-1.5 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh Inventory"}
          </Button>
        }
      />

      {/* Summary KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Total Products"
          value={String(summary.totalItems)}
          description="Tracked SKUs in store"
          icon={<Boxes className="h-5 w-5" />}
        />
        <StatCard
          title="Total Stock Units"
          value={`${summary.totalUnits.toLocaleString("en-IN")}`}
          description="Available in warehouse/store"
          icon={<PackageCheck className="h-5 w-5" />}
        />
        <StatCard
          title="Stock Value"
          value={`₹${Math.round(summary.totalValue).toLocaleString("en-IN")}`}
          description="Estimated inventory value"
          icon={<Coins className="h-5 w-5" />}
        />
        <StatCard
          title="Low Stock"
          value={String(summary.lowStock)}
          description="At or below threshold"
          icon={<AlertCircle className="h-5 w-5" />}
        />
        <StatCard
          title="Out of Stock"
          value={String(summary.outOfStock)}
          description="Requires immediate restocking"
          icon={<XCircle className="h-5 w-5" />}
        />
      </div>

      {feedback ? (
        <div
          className={`flex items-center justify-between rounded-2xl border p-4 text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {/* Bulk Selection Action Bar */}
      {selectedProductIds.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 dark:border-emerald-500/20">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              {selectedProductIds.length}
            </span>
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              products selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsBulkRestockOpen(true)}
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <PlusCircle className="mr-1.5 h-4 w-4" />
              Bulk Restock Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedProductIds([])}
              className="rounded-xl text-xs"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      ) : null}

      {/* Main Inventory Card */}
      <DashboardCard
        title="Stock & Inventory Levels"
        description="Filter products, review stock health bars, and view real-time movement history."
      >
        <div className="space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <SearchBar
                placeholder="Search inventory by product, SKU, or brand..."
                value={query}
                onChange={(value) => {
                  setQuery(value);
                  setPage(1);
                }}
              />
            </div>

            <FilterBar>
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.categoryId ?? c._id} value={c.categoryId ?? c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
              >
                <option value="all">All Statuses</option>
                <option value="in_stock">In Stock (&gt;5)</option>
                <option value="low_stock">Low Stock (1–5)</option>
                <option value="out_of_stock">Out of Stock (0)</option>
                <option value="discontinued">Discontinued</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
              >
                <option value="stock_asc">Stock: Low to High</option>
                <option value="stock_desc">Stock: High to Low</option>
                <option value="value_desc">Inventory Value: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>

              {hasActiveFilters ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-8 rounded-full text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                >
                  <RotateCcw className="mr-1 h-3.5 w-3.5" />
                  Reset
                </Button>
              ) : null}
            </FilterBar>
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="mt-6">
            <LoadingSkeleton rows={6} />
          </div>
        ) : null}

        {/* Error */}
        {isError ? (
          <div className="mt-6 space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
            <p>{error?.message ?? "Unable to load inventory data."}</p>
            <Button variant="outline" size="sm" onClick={refreshInventory}>
              Retry
            </Button>
          </div>
        ) : null}

        {/* Table & Pagination */}
        {!isLoading && !isError ? (
          <div className="mt-6 space-y-4">
            {filteredRows.length === 0 ? (
              <EmptyState
                title={inventoryRows.length === 0 ? "No inventory recorded" : "No matching inventory"}
                description={
                  inventoryRows.length === 0
                    ? "Create products in your store to begin tracking inventory and stock."
                    : "Try adjusting your search criteria or resetting filters."
                }
              />
            ) : (
              <>
                <InventoryManagementTable
                  rows={pagedRows}
                  categoryNames={categoryNames}
                  selectedProductIds={selectedProductIds}
                  onToggleSelect={handleToggleSelect}
                  onSelectAll={handleSelectAll}
                  onEditFull={(product) => setEditingProduct(product)}
                  onQuickAdjustSubmit={handleQuickAdjust}
                  isAdjusting={updateMutation.isPending}
                />
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </div>
        ) : null}
      </DashboardCard>

      {/* Advanced Full Edit Inventory Modal */}
      <ProductModal
        open={Boolean(editingProduct)}
        title="Inventory Configurations"
        description="Fine-tune stock limits, reserved allocations, and low-stock alerting thresholds."
        onClose={() => setEditingProduct(null)}
      >
        {editingProduct?.productId ? (
          <InventoryForm
            product={editingProduct}
            initialValues={{
              availableQuantity: inventoryMap[editingProduct.productId]?.availableQuantity ?? 0,
              reservedQuantity: inventoryMap[editingProduct.productId]?.reservedQuantity ?? 0,
              soldQuantity: inventoryMap[editingProduct.productId]?.soldQuantity ?? 0,
              lowStockThreshold: inventoryMap[editingProduct.productId]?.lowStockThreshold ?? 5,
              status: inventoryMap[editingProduct.productId]?.status ?? "in_stock",
            }}
            isSubmitting={updateMutation.isPending}
            onSubmit={handleUpdate}
          />
        ) : null}
      </ProductModal>

      {/* Bulk Restock Modal */}
      {isBulkRestockOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-950">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-50">
              Bulk Restock Products
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              Add units simultaneously to {selectedProductIds.length} selected products.
            </p>

            <div className="mt-4 space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500">
                Units to add to each product
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={bulkAmount}
                  onChange={(e) => setBulkAmount(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-stone-200 bg-white px-3.5 py-2 text-sm font-semibold outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                />
              </label>

              <div className="flex gap-2">
                {[5, 10, 20, 50].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setBulkAmount(String(num))}
                    className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-700 hover:border-emerald-500 hover:bg-emerald-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
                  >
                    +{num}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsBulkRestockOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkRestock}
                className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Apply Restock
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardContent>
  );
}
