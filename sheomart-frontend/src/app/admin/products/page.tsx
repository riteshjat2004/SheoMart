"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Search,
  RotateCcw,
  Package,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Store as StoreIcon,
  Tag,
  CheckSquare,
  Square,
  Layers,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { ProductDetailsModal } from "@/components/dashboard/admin/ProductDetailsModal";
import { ProductFormModal } from "@/components/dashboard/admin/ProductFormModal";
import { fetchAdminCategories } from "@/services/category";
import { fetchAdminStores } from "@/services/store";
import {
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  restoreAdminProduct,
  updateAdminProductStatus,
  bulkAdminProductAction,
} from "@/services/admin-products";
import type {
  AdminProduct,
  AdminProductFilters,
  AdminProductInventoryStatus,
} from "@/types/admin-product";
import type { CategoryItem, StoreItem } from "@/types/marketplace";

const defaultFilters: AdminProductFilters = {
  page: 1,
  limit: 25,
  sortBy: "createdAt",
  sortOrder: "desc",
};

const inventoryStatuses: Array<{ value: AdminProductInventoryStatus; label: string }> = [
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "discontinued", label: "Discontinued" },
  { value: "unavailable", label: "Unavailable" },
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<AdminProductFilters>(defaultFilters);
  const [searchInput, setSearchInput] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Modal States
  const [detailsProduct, setDetailsProduct] = useState<AdminProduct | null>(null);
  const [formProduct, setFormProduct] = useState<AdminProduct | null | undefined>(undefined); // undefined: closed, null: create, object: edit
  const [pendingDelete, setPendingDelete] = useState<AdminProduct | null>(null);
  const [pendingRestore, setPendingRestore] = useState<AdminProduct | null>(null);
  const [pendingStatusToggle, setPendingStatusToggle] = useState<AdminProduct | null>(null);
  const [pendingBulkAction, setPendingBulkAction] = useState<
    "activate" | "deactivate" | "delete" | "restore" | "feature" | "unfeature" | null
  >(null);

  // Toast feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Debounce search input by 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput.trim() || undefined, page: 1 }));
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Auto-dismiss feedback
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Main Products Query
  const productsQuery = useQuery({
    queryKey: ["admin-products", filters],
    queryFn: () => fetchAdminProducts(filters),
    staleTime: 1000 * 60 * 2,
  });

  const products = productsQuery.data?.products ?? [];
  const stats = productsQuery.data?.stats;
  const pagination = productsQuery.data?.pagination;

  // Categories & Stores for filters and modals
  const categoriesQuery = useQuery<CategoryItem[], Error>({
    queryKey: ["admin-categories"],
    queryFn: fetchAdminCategories,
    staleTime: 1000 * 60 * 5,
  });

  const storesQuery = useQuery<StoreItem[], Error>({
    queryKey: ["stores", "admin"],
    queryFn: fetchAdminStores,
    staleTime: 1000 * 60 * 5,
  });

  const invalidateProductQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (formData: FormData) => createAdminProduct(formData),
    onSuccess: (newProduct) => {
      invalidateProductQueries();
      setFeedback({ type: "success", message: `Product "${newProduct?.name ?? "New"}" created successfully.` });
      setFormProduct(undefined);
    },
    onError: (err: unknown) => {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Failed to create product." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, formData }: { productId: string; formData: FormData }) =>
      updateAdminProduct(productId, formData),
    onSuccess: (updatedProduct) => {
      invalidateProductQueries();
      setFeedback({ type: "success", message: `Product "${updatedProduct?.name ?? ""}" updated successfully.` });
      setFormProduct(undefined);
    },
    onError: (err: unknown) => {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Failed to update product." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => deleteAdminProduct(productId),
    onSuccess: (delProd) => {
      invalidateProductQueries();
      setFeedback({ type: "success", message: `Product "${delProd?.name ?? ""}" deleted successfully.` });
      setPendingDelete(null);
    },
    onError: (err: unknown) => {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Failed to delete product." });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (productId: string) => restoreAdminProduct(productId),
    onSuccess: (resProd) => {
      invalidateProductQueries();
      setFeedback({ type: "success", message: `Product "${resProd?.name ?? ""}" restored successfully.` });
      setPendingRestore(null);
    },
    onError: (err: unknown) => {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Failed to restore product." });
    },
  });

  const statusToggleMutation = useMutation({
    mutationFn: ({ productId, isActive }: { productId: string; isActive: boolean }) =>
      updateAdminProductStatus(productId, isActive),
    onSuccess: (resProd) => {
      invalidateProductQueries();
      const statusText = resProd?.isActive ? "activated" : "deactivated";
      setFeedback({ type: "success", message: `Product "${resProd?.name ?? ""}" ${statusText} successfully.` });
      setPendingStatusToggle(null);
    },
    onError: (err: unknown) => {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Failed to update status." });
    },
  });

  const bulkMutation = useMutation({
    mutationFn: ({
      productIds,
      action,
    }: {
      productIds: string[];
      action: "activate" | "deactivate" | "delete" | "restore" | "feature" | "unfeature";
    }) => bulkAdminProductAction(productIds, action),
    onSuccess: (res) => {
      invalidateProductQueries();
      setFeedback({
        type: "success",
        message: `Bulk ${pendingBulkAction} applied to ${res?.modifiedCount ?? selectedProductIds.length} products.`,
      });
      setSelectedProductIds([]);
      setPendingBulkAction(null);
    },
    onError: (err: unknown) => {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Bulk action failed." });
    },
  });

  // Filter Helpers
  const updateFilters = (updates: Partial<AdminProductFilters>) => {
    setFilters((current) => ({ ...current, ...updates, page: 1 }));
  };

  const clearFilters = () => {
    setSearchInput("");
    setActiveTab("all");
    setSelectedProductIds([]);
    setFilters(defaultFilters);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "all") {
      updateFilters({ status: undefined, isDeleted: false });
    } else if (tab === "deleted") {
      updateFilters({ status: "deleted", isDeleted: true });
    } else {
      updateFilters({ status: tab, isDeleted: false });
    }
  };

  // Selection Helpers
  const isAllSelected = products.length > 0 && selectedProductIds.length === products.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map((p) => p.productId));
    }
  };

  const toggleSelectProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Admin" }, { label: "Products" }]} />

      <PageHeader
        title="Product Management"
        description="Comprehensive platform catalog oversight: inspect inventory, pricing, publication status, bulk actions, and marketplace vendor products."
        actions={
          <Button
            onClick={() => setFormProduct(null)}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Product
          </Button>
        }
      />

      {/* Floating Feedback Alert */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl border p-4 text-sm shadow-sm transition-all ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            &times;
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Products</span>
            <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100">
            {stats?.total ?? products.length}
          </p>
          <span className="mt-1 block text-xs text-stone-400">In platform catalog</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active</span>
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats?.active ?? 0}
          </p>
          <span className="mt-1 block text-xs text-stone-400">Live for shoppers</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between text-sky-600 dark:text-sky-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Draft</span>
            <Layers className="h-5 w-5" />
          </div>
          <p className="mt-2 text-2xl font-bold text-sky-600 dark:text-sky-400">
            {stats?.draft ?? 0}
          </p>
          <span className="mt-1 block text-xs text-stone-400">Unpublished drafts</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Out of Stock</span>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {stats?.outOfStock ?? 0}
          </p>
          <span className="mt-1 block text-xs text-stone-400">0 units inventory</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Featured</span>
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats?.featured ?? 0}
          </p>
          <span className="mt-1 block text-xs text-stone-400">Highlighted in app</span>
        </div>
      </div>

      {/* Main Catalog View */}
      <DashboardCard
        title="Products Catalog"
        description="Filter products, inspect stock, toggle status, and run bulk operations."
      >
        {/* Status Filter Tabs */}
        <div className="mb-4 flex flex-wrap gap-1.5 rounded-xl border border-stone-200 bg-stone-50 p-1 dark:border-stone-800 dark:bg-stone-900/60">
          {[
            { id: "all", label: "All Products" },
            { id: "active", label: "Active" },
            { id: "inactive", label: "Inactive" },
            { id: "draft", label: "Drafts" },
            { id: "out_of_stock", label: "Out of Stock" },
            { id: "featured", label: "Featured" },
            { id: "deleted", label: "Deleted" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeTab === tab.id
                  ? "bg-white text-emerald-700 shadow-sm dark:bg-stone-800 dark:text-emerald-400"
                  : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Controls Row */}
        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(14rem,1.5fr)_repeat(3,minmax(9rem,1fr))_auto]">
          {/* Search Box */}
          <label className="flex min-h-10 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-500 shadow-sm dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400">
            <Search className="h-4 w-4 shrink-0" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search product name, SKU, brand..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="text-stone-400 hover:text-stone-600"
              >
                &times;
              </button>
            )}
          </label>

          {/* Store Selector */}
          <select
            value={filters.storeId ?? ""}
            onChange={(e) => updateFilters({ storeId: e.target.value || undefined })}
            className="min-h-10 rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-700 outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200"
          >
            <option value="">All Stores</option>
            {storesQuery.data?.map((store) => (
              <option key={store.storeId ?? store._id} value={store.storeId ?? store._id ?? ""}>
                {store.storeName ?? store.name ?? "Store"}
              </option>
            ))}
          </select>

          {/* Category Selector */}
          <select
            value={filters.categoryId ?? ""}
            onChange={(e) => updateFilters({ categoryId: e.target.value || undefined })}
            className="min-h-10 rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-700 outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200"
          >
            <option value="">All Categories</option>
            {categoriesQuery.data?.map((category) => (
              <option key={category.categoryId ?? category._id} value={category.categoryId ?? category._id ?? ""}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Inventory Status Selector */}
          <select
            value={filters.inventoryStatus ?? ""}
            onChange={(e) =>
              updateFilters({
                inventoryStatus: (e.target.value || undefined) as AdminProductInventoryStatus | undefined,
              })
            }
            className="min-h-10 rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-700 outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200"
          >
            <option value="">All Inventory Statuses</option>
            {inventoryStatuses.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>

          {/* Clear Filters Button */}
          <Button type="button" variant="outline" size="sm" onClick={clearFilters} className="h-10 px-3">
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        </div>

        {/* Floating Bulk Actions Toolbar (when products selected) */}
        {selectedProductIds.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-sm text-emerald-900 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-200">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                {selectedProductIds.length}
              </span>
              <span className="font-medium">
                {selectedProductIds.length === 1 ? "1 product" : `${selectedProductIds.length} products`} selected
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPendingBulkAction("activate")}
                className="h-8 text-xs bg-white dark:bg-stone-900"
              >
                Activate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPendingBulkAction("deactivate")}
                className="h-8 text-xs bg-white dark:bg-stone-900"
              >
                Deactivate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPendingBulkAction("feature")}
                className="h-8 text-xs bg-white dark:bg-stone-900"
              >
                <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
                Feature
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPendingBulkAction("delete")}
                className="h-8 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 bg-white dark:bg-stone-900"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedProductIds([])}
                className="h-8 text-xs text-stone-500"
              >
                Deselect All
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {productsQuery.isLoading && (
          <EmptyState title="Loading Products" description="Fetching platform products catalog..." />
        )}

        {/* Error State */}
        {productsQuery.isError && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center dark:border-rose-900/60 dark:bg-rose-950/20">
            <XCircle className="h-10 w-10 text-rose-500 mb-2" />
            <h4 className="font-semibold text-rose-700 dark:text-rose-400">Failed to load products</h4>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              {productsQuery.error instanceof Error ? productsQuery.error.message : "Unable to load products."}
            </p>
            <Button variant="outline" size="sm" onClick={() => productsQuery.refetch()} className="mt-4">
              Try Again
            </Button>
          </div>
        )}

        {/* Products Table */}
        {!productsQuery.isLoading && !productsQuery.isError && (
          <>
            {products.length === 0 ? (
              <EmptyState
                title="No products found"
                description={
                  searchInput
                    ? `No products match "${searchInput}". Try changing your search query or filters.`
                    : "No products in this view."
                }
              />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/80 text-xs font-semibold uppercase tracking-wider text-stone-600 backdrop-blur dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-400">
                    <tr>
                      <th className="w-10 py-3.5 pl-4 pr-2">
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          className="flex items-center text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                        >
                          {isAllSelected ? (
                            <CheckSquare className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </th>
                      <th className="py-3.5 pl-2 pr-3">Product</th>
                      <th className="px-3 py-3.5">Store & Category</th>
                      <th className="px-3 py-3.5">Price & Value</th>
                      <th className="px-3 py-3.5">Stock</th>
                      <th className="px-3 py-3.5">Status</th>
                      <th className="py-3.5 pl-3 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white dark:divide-stone-800/60 dark:bg-stone-950">
                    {products.map((product) => {
                      const isSelected = selectedProductIds.includes(product.productId);
                      const hasDiscount =
                        product.discountPrice > 0 && product.discountPrice < product.price;

                      return (
                        <tr
                          key={product.productId}
                          className={`transition hover:bg-stone-50/60 dark:hover:bg-stone-900/50 ${
                            isSelected ? "bg-emerald-50/40 dark:bg-emerald-950/20" : ""
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3 pl-4 pr-2">
                            <button
                              type="button"
                              onClick={() => toggleSelectProduct(product.productId)}
                              className="flex items-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          </td>

                          {/* Product Thumbnail & Identity */}
                          <td className="py-3 pl-2 pr-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-900">
                                {product.thumbnail ? (
                                  <img
                                    src={product.thumbnail}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <Package className="h-5 w-5 text-stone-400" />
                                )}
                              </div>
                              <div className="min-w-0 max-w-xs">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => setDetailsProduct(product)}
                                    className="font-medium text-stone-900 hover:text-emerald-600 dark:text-stone-100 dark:hover:text-emerald-400 truncate text-left"
                                  >
                                    {product.name}
                                  </button>
                                  {product.isFeatured && (
                                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-mono">
                                  <span>{product.sku}</span>
                                  {product.brand && (
                                    <>
                                      <span>·</span>
                                      <span className="font-sans font-normal truncate">{product.brand}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Store & Category */}
                          <td className="px-3 py-3 text-xs">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-stone-800 dark:text-stone-200 truncate">
                                <StoreIcon className="h-3 w-3 text-stone-400 shrink-0" />
                                <span className="truncate">{product.store?.storeName ?? "Unassigned"}</span>
                              </div>
                              <div className="flex items-center gap-1 text-stone-500 dark:text-stone-400 truncate">
                                <Tag className="h-3 w-3 text-stone-400 shrink-0" />
                                <span className="truncate">{product.category?.name ?? "Unassigned"}</span>
                              </div>
                            </div>
                          </td>

                          {/* Price & Value */}
                          <td className="px-3 py-3">
                            {hasDiscount ? (
                              <div>
                                <span className="block font-semibold text-emerald-700 dark:text-emerald-400">
                                  {formatPrice(product.discountPrice)}
                                </span>
                                <span className="text-xs text-stone-400 line-through">
                                  {formatPrice(product.price)}
                                </span>
                              </div>
                            ) : (
                              <span className="font-semibold text-stone-900 dark:text-stone-100">
                                {formatPrice(product.price)}
                              </span>
                            )}
                          </td>

                          {/* Stock Quantity */}
                          <td className="px-3 py-3">
                            <div className="space-y-1">
                              <span
                                className={`inline-block font-semibold text-xs ${
                                  product.quantity <= 0
                                    ? "text-rose-600"
                                    : product.quantity <= 10
                                    ? "text-amber-600"
                                    : "text-stone-900 dark:text-stone-100"
                                }`}
                              >
                                {product.quantity} units
                              </span>
                              <span className="block text-[11px] capitalize text-stone-400">
                                {product.inventoryStatus.replace("_", " ")}
                              </span>
                            </div>
                          </td>

                          {/* Status Badges */}
                          <td className="px-3 py-3">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium w-fit ${
                                  product.isActive
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                    : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    product.isActive ? "bg-emerald-500" : "bg-stone-400"
                                  }`}
                                />
                                {product.isActive ? "Active" : "Inactive"}
                              </span>

                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] w-fit ${
                                  product.isPublished
                                    ? "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400"
                                    : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                                }`}
                              >
                                {product.isPublished ? "Published" : "Draft"}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 pl-3 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* View Details */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDetailsProduct(product)}
                                className="h-8 w-8 p-0"
                                title="View details"
                              >
                                <Eye className="h-3.5 w-3.5 text-stone-600 dark:text-stone-400" />
                              </Button>

                              {/* Edit */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setFormProduct(product)}
                                className="h-8 w-8 p-0"
                                title="Edit product"
                              >
                                <Pencil className="h-3.5 w-3.5 text-stone-600 dark:text-stone-400" />
                              </Button>

                              {/* Status Toggle */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPendingStatusToggle(product)}
                                className="h-8 w-8 p-0"
                                title={product.isActive ? "Deactivate product" : "Activate product"}
                              >
                                {product.isActive ? (
                                  <ToggleRight className="h-4 w-4 text-emerald-600" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-stone-400" />
                                )}
                              </Button>

                              {/* Delete or Restore */}
                              {product.isDeleted ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setPendingRestore(product)}
                                  className="h-8 px-2 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                  title="Restore product"
                                >
                                  Restore
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setPendingDelete(product)}
                                  className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                                  title="Delete product"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Pagination Bar */}
        {pagination && pagination.totalPages > 0 && (
          <div className="mt-5 flex flex-col gap-3 border-t border-stone-200 pt-4 text-sm text-stone-600 dark:border-stone-800 dark:text-stone-300 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Page {pagination.page} of {pagination.totalPages} — {pagination.total} total products
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1 || productsQuery.isFetching}
                onClick={() => updateFilters({ page: pagination.page - 1 })}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages || productsQuery.isFetching}
                onClick={() => updateFilters({ page: pagination.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </DashboardCard>

      {/* Details Modal */}
      <ProductDetailsModal
        product={detailsProduct}
        open={Boolean(detailsProduct)}
        onClose={() => setDetailsProduct(null)}
        onEdit={(p) => setFormProduct(p)}
        onToggleStatus={(p) => setPendingStatusToggle(p)}
        onDelete={(p) => setPendingDelete(p)}
        onRestore={(p) => setPendingRestore(p)}
      />

      {/* Form Modal (Create or Edit) */}
      <ProductFormModal
        open={formProduct !== undefined}
        product={formProduct}
        stores={storesQuery.data ?? []}
        categories={categoriesQuery.data ?? []}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onClose={() => setFormProduct(undefined)}
        onSubmit={(formData) => {
          if (formProduct?.productId) {
            updateMutation.mutate({ productId: formProduct.productId, formData });
          } else {
            createMutation.mutate(formData);
          }
        }}
      />

      {/* Status Toggle Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(pendingStatusToggle)}
        title={pendingStatusToggle?.isActive ? "Deactivate Product?" : "Activate Product?"}
        description={
          pendingStatusToggle?.isActive
            ? `Deactivating "${pendingStatusToggle?.name}" will prevent shoppers from adding it to cart or checking out.`
            : `Activating "${pendingStatusToggle?.name}" will make it immediately purchasable on the storefront.`
        }
        confirmLabel={pendingStatusToggle?.isActive ? "Deactivate" : "Activate"}
        isConfirming={statusToggleMutation.isPending}
        onClose={() => setPendingStatusToggle(null)}
        onConfirm={() => {
          if (pendingStatusToggle?.productId) {
            statusToggleMutation.mutate({
              productId: pendingStatusToggle.productId,
              isActive: !pendingStatusToggle.isActive,
            });
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete Product?"
        description={`Are you sure you want to delete "${pendingDelete?.name}"? It will be soft-deleted and removed from active marketplace listings.`}
        confirmLabel="Delete Product"
        confirmVariant="default"
        isConfirming={deleteMutation.isPending}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete?.productId) {
            deleteMutation.mutate(pendingDelete.productId);
          }
        }}
      />

      {/* Restore Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(pendingRestore)}
        title="Restore Product?"
        description={`Are you sure you want to restore "${pendingRestore?.name}" back to the active catalog?`}
        confirmLabel="Restore Product"
        isConfirming={restoreMutation.isPending}
        onClose={() => setPendingRestore(null)}
        onConfirm={() => {
          if (pendingRestore?.productId) {
            restoreMutation.mutate(pendingRestore.productId);
          }
        }}
      />

      {/* Bulk Action Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(pendingBulkAction)}
        title={`Apply Bulk ${pendingBulkAction?.toUpperCase()}?`}
        description={`This will apply "${pendingBulkAction}" to all ${selectedProductIds.length} selected products.`}
        confirmLabel={`Confirm ${pendingBulkAction}`}
        isConfirming={bulkMutation.isPending}
        onClose={() => setPendingBulkAction(null)}
        onConfirm={() => {
          if (pendingBulkAction && selectedProductIds.length > 0) {
            bulkMutation.mutate({
              productIds: selectedProductIds,
              action: pendingBulkAction,
            });
          }
        }}
      />
    </DashboardContent>
  );
}
