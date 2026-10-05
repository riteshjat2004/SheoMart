"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Package,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { Pagination } from "@/components/dashboard/Pagination";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { DeleteDialog } from "@/components/dashboard/DeleteDialog";
import { Button } from "@/components/ui/button";
import { ProductModal } from "@/components/dashboard/store/ProductModal";
import { ProductForm, type ProductFormValues } from "@/components/dashboard/store/ProductForm";
import { ProductManagementTable } from "@/components/dashboard/store/ProductManagementTable";
import { ProductDetailsModal } from "@/components/dashboard/store/ProductDetailsModal";
import { RestockModal } from "@/components/dashboard/store/RestockModal";
import { useRestockInventory } from "@/hooks/use-restock-inventory";
import { fetchCategories } from "@/services/category";
import {
  fetchStoreProducts,
  createStoreProduct,
  updateStoreProduct,
  deleteStoreProduct,
  updateStoreProductStatus,
  duplicateStoreProduct,
} from "@/services/product";
import { fetchMyStore } from "@/services/store";
import type { CategoryItem, ProductItem, StoreItem } from "@/types/marketplace";

const PAGE_SIZE = 8;
const CREATE_FORM_ID = "store-create-product-form";
const EDIT_FORM_ID = "store-edit-product-form";

type Feedback = { type: "success" | "error"; message: string } | null;

function getMutationError(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function toProductRequest(payload: ProductFormValues): FormData | Record<string, unknown> {
  if (!payload.imageFile) {
    const jsonPayload = { ...payload } as Record<string, unknown>;
    delete jsonPayload.imageFile;
    if (jsonPayload.quantity === undefined) {
      delete jsonPayload.quantity;
    }
    jsonPayload.variants = payload.variants ?? [];
    return jsonPayload;
  }

  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("description", payload.description);
  formData.append("brand", payload.brand);
  formData.append("sku", payload.sku);
  formData.append("price", String(payload.price));
  formData.append("discountPrice", String(payload.discountPrice));
  if (payload.quantity !== undefined) {
    formData.append("quantity", String(payload.quantity));
  }
  formData.append("categoryId", payload.categoryId);
  formData.append("isPublished", String(payload.isPublished));
  formData.append("isActive", String(payload.isActive));
  if (payload.isFeatured !== undefined) formData.append("isFeatured", String(payload.isFeatured));
  if (payload.sellingType) formData.append("sellingType", payload.sellingType);
  if (payload.baseUnit) formData.append("baseUnit", payload.baseUnit);
  if (payload.unitLabel) formData.append("unitLabel", payload.unitLabel);
  if (payload.minQuantity !== undefined) formData.append("minQuantity", String(payload.minQuantity));
  if (payload.stepQuantity !== undefined) formData.append("stepQuantity", String(payload.stepQuantity));
  if (payload.allowCustomQuantity !== undefined) formData.append("allowCustomQuantity", String(payload.allowCustomQuantity));
  if (payload.stockTrackingMode) formData.append("stockTrackingMode", payload.stockTrackingMode);
  if (payload.hasNutritionalInfo !== undefined) formData.append("hasNutritionalInfo", String(payload.hasNutritionalInfo));
  if (payload.nutritionalInfo) formData.append("nutritionalInfo", JSON.stringify(payload.nutritionalInfo));
  formData.append("variants", JSON.stringify(payload.variants ?? []));
  if (payload.imageUrl) formData.append("imageUrl", payload.imageUrl);
  if (payload.imageFile) formData.append("image", payload.imageFile);
  return formData;
}

export default function StoreProductsPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<ProductItem | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [restockProduct, setRestockProduct] = useState<{ product: ProductItem; quantity: number } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ProductItem | null>(null);
  const [pendingStatus, setPendingStatus] = useState<ProductItem | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  // Queries
  const { data: products = [], isLoading, isError, error } = useQuery<ProductItem[], Error>({
    queryKey: ["store-products"],
    queryFn: fetchStoreProducts,
    staleTime: 1000 * 60 * 3,
  });

  const { data: categories = [] } = useQuery<CategoryItem[], Error>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
  });

  const { data: store = null } = useQuery<StoreItem | null, Error>({
    queryKey: ["my-store"],
    queryFn: fetchMyStore,
    staleTime: 1000 * 60 * 10,
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

  // KPIs
  const kpiStats = useMemo(() => {
    let total = products.length;
    let published = 0;
    let drafts = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let featured = 0;

    for (const p of products) {
      if (p.isActive && p.isPublished) published++;
      if (p.isActive && !p.isPublished) drafts++;
      const qty = p.quantity ?? 0;
      if (qty === 0) outOfStock++;
      else if (qty <= 5) lowStock++;
      if (p.isFeatured) featured++;
    }

    return { total, published, drafts, lowStock, outOfStock, featured };
  }, [products]);

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return products
      .filter((product) => {
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
          statusFilter === "all" ||
          (statusFilter === "published" && product.isPublished && product.isActive) ||
          (statusFilter === "draft" && !product.isPublished && product.isActive) ||
          (statusFilter === "hidden" && product.isActive === false);

        const qty = product.quantity ?? 0;
        const matchesStock =
          stockFilter === "all" ||
          (stockFilter === "in_stock" && qty > 5) ||
          (stockFilter === "low_stock" && qty > 0 && qty <= 5) ||
          (stockFilter === "out_of_stock" && qty === 0);

        return matchesSearch && matchesCategory && matchesStatus && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") {
          const priceA = a.discountPrice && a.discountPrice > 0 ? a.discountPrice : a.price;
          const priceB = b.discountPrice && b.discountPrice > 0 ? b.discountPrice : b.price;
          return priceA - priceB;
        }
        if (sortBy === "price_desc") {
          const priceA = a.discountPrice && a.discountPrice > 0 ? a.discountPrice : a.price;
          const priceB = b.discountPrice && b.discountPrice > 0 ? b.discountPrice : b.price;
          return priceB - priceA;
        }
        if (sortBy === "stock_asc") {
          return (a.quantity ?? 0) - (b.quantity ?? 0);
        }
        if (sortBy === "oldest") {
          return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
        }
        // Default: newest
        return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
      });
  }, [products, query, categoryFilter, statusFilter, stockFilter, sortBy, categoryNames]);

  const pagedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  // Mutations
  const invalidateProductQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["store-products"] }),
      queryClient.invalidateQueries({ queryKey: ["products"] }),
      queryClient.invalidateQueries({ queryKey: ["product"] }),
      queryClient.invalidateQueries({ queryKey: ["inventory-map"] }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: async (payload: ProductFormValues) => {
      const createPayload = toProductRequest(payload);
      return createStoreProduct(createPayload);
    },
    onSuccess: async () => {
      await invalidateProductQueries();
      setIsCreateOpen(false);
      setPage(1);
      setFeedback({ type: "success", message: "Product created successfully." });
    },
    onError: (err) =>
      setFeedback({ type: "error", message: getMutationError(err, "Unable to create product.") }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      productId,
      payload,
    }: {
      productId: string;
      payload: ProductFormValues;
    }) => {
      return updateStoreProduct(productId, toProductRequest(payload));
    },
    onSuccess: async () => {
      await invalidateProductQueries();
      setEditingProduct(null);
      setFeedback({ type: "success", message: "Product updated successfully." });
    },
    onError: (err) =>
      setFeedback({ type: "error", message: getMutationError(err, "Unable to update product.") }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      return deleteStoreProduct(productId);
    },
    onSuccess: async () => {
      await invalidateProductQueries();
      setPendingDelete(null);
      setFeedback({ type: "success", message: "Product archived successfully." });
    },
    onError: (err) =>
      setFeedback({ type: "error", message: getMutationError(err, "Unable to archive product.") }),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ productId, isActive }: { productId: string; isActive: boolean }) => {
      return updateStoreProductStatus(productId, isActive);
    },
    onSuccess: async () => {
      await invalidateProductQueries();
      setPendingStatus(null);
      setFeedback({
        type: "success",
        message: "Product visibility updated successfully.",
      });
    },
    onError: (err) =>
      setFeedback({
        type: "error",
        message: getMutationError(err, "Unable to update product visibility."),
      }),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (productId: string) => {
      return duplicateStoreProduct(productId);
    },
    onSuccess: async (duplicated) => {
      await invalidateProductQueries();
      setFeedback({
        type: "success",
        message: `Product duplicated successfully as "${duplicated?.name || "Copy"}".`,
      });
    },
    onError: (err) =>
      setFeedback({
        type: "error",
        message: getMutationError(err, "Unable to duplicate product."),
      }),
  });

  const restockMutation = useRestockInventory({
    onSuccess: () => {
      setRestockProduct(null);
      setFeedback({ type: "success", message: "Stock updated successfully." });
    },
    onError: (err) =>
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Unable to restock product.",
      }),
  });

  // Action handlers
  const handleCreate = (values: ProductFormValues) => {
    setFeedback(null);
    createMutation.mutate(values);
  };

  const handleEdit = (values: ProductFormValues) => {
    if (!editingProduct?.productId) return;
    setFeedback(null);
    updateMutation.mutate({ productId: editingProduct.productId, payload: values });
  };

  const handleDelete = () => {
    if (!pendingDelete?.productId) return;
    setFeedback(null);
    deleteMutation.mutate(pendingDelete.productId);
  };

  const handleStatusToggle = () => {
    if (!pendingStatus?.productId) return;
    setFeedback(null);
    statusMutation.mutate({
      productId: pendingStatus.productId,
      isActive: pendingStatus.isActive === false,
    });
  };

  const resetFilters = () => {
    setQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setStockFilter("all");
    setSortBy("newest");
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(query) ||
    categoryFilter !== "all" ||
    statusFilter !== "all" ||
    stockFilter !== "all" ||
    sortBy !== "newest";

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Store" }, { label: "Products" }]} />

      <PageHeader
        title="Product Management"
        description="Organize your store catalog, control pricing, monitor stock levels, and publish items."
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="rounded-xl">
            <Plus className="mr-1.5 h-4 w-4" />
            New Product
          </Button>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Products"
          value={String(kpiStats.total)}
          description="All catalog items"
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          title="Live & Published"
          value={String(kpiStats.published)}
          description="Visible to customers"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          title="Draft Items"
          value={String(kpiStats.drafts)}
          description="Unpublished items"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          title="Low Stock"
          value={String(kpiStats.lowStock)}
          description="5 or fewer units"
          icon={<AlertCircle className="h-5 w-5" />}
        />
        <StatCard
          title="Out of Stock"
          value={String(kpiStats.outOfStock)}
          description="Requires restocking"
          icon={<XCircle className="h-5 w-5" />}
        />
        <StatCard
          title="Featured"
          value={String(kpiStats.featured)}
          description="Highlighted on store"
          icon={<Sparkles className="h-5 w-5" />}
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

      {/* Main Catalog Card */}
      <DashboardCard
        title="Product Catalog"
        description="Search, filter, edit, restock, and manage actions across your inventory."
      >
        {/* Search & Filters Bar */}
        <div className="space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <SearchBar
                placeholder="Search by name, SKU, or brand..."
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
                <option value="all">All Visibility</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="hidden">Hidden / Inactive</option>
              </select>

              {/* Stock Filter */}
              <select
                value={stockFilter}
                onChange={(e) => {
                  setStockFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
              >
                <option value="all">All Stock Levels</option>
                <option value="in_stock">In Stock (&gt;5)</option>
                <option value="low_stock">Low Stock (1–5)</option>
                <option value="out_of_stock">Out of Stock (0)</option>
              </select>

              {/* Sorting */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="stock_asc">Stock: Low to High</option>
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

        {/* Loading state */}
        {isLoading ? (
          <div className="mt-6 rounded-2xl border border-dashed border-stone-200 p-8 text-center text-sm text-stone-500 dark:border-stone-800">
            Loading products...
          </div>
        ) : null}

        {/* Error state */}
        {isError ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
            {error?.message ?? "Unable to load products."}
          </div>
        ) : null}

        {/* Data table */}
        {!isLoading && !isError ? (
          <div className="mt-6 space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-200 p-8 text-center text-sm text-stone-500 dark:border-stone-800">
                {products.length === 0
                  ? "You haven't added any products to your store yet. Click 'New Product' above to start selling!"
                  : "No products match the selected filters. Try adjusting your search query or reset filters."}
              </div>
            ) : (
              <>
                <ProductManagementTable
                  products={pagedProducts}
                  categoryNames={categoryNames}
                  onViewDetails={(product) => setViewingProduct(product)}
                  onEdit={(product) => setEditingProduct(product)}
                  onDuplicate={(product) => {
                    if (product.productId) duplicateMutation.mutate(product.productId);
                  }}
                  onRestock={(product) =>
                    setRestockProduct({ product, quantity: product.quantity ?? 0 })
                  }
                  onDelete={(product) => setPendingDelete(product)}
                  onToggleStatus={(product) => setPendingStatus(product)}
                  isDuplicating={duplicateMutation.isPending}
                />
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </div>
        ) : null}
      </DashboardCard>

      {/* Product Details Modal */}
      {viewingProduct ? (
        <ProductDetailsModal
          product={viewingProduct}
          categoryName={
            viewingProduct.categoryId ? categoryNames.get(viewingProduct.categoryId) : undefined
          }
          store={store}
          onClose={() => setViewingProduct(null)}
          onEdit={(product) => setEditingProduct(product)}
          onRestock={(product) =>
            setRestockProduct({ product, quantity: product.quantity ?? 0 })
          }
        />
      ) : null}

      {/* Create Product Modal */}
      <ProductModal
        open={isCreateOpen}
        title="Create Product"
        description="Add a new item to your catalog, define pricing, upload media, and set inventory."
        onClose={() => setIsCreateOpen(false)}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={CREATE_FORM_ID}
              disabled={createMutation.isPending}
              className="rounded-xl"
            >
              {createMutation.isPending ? "Creating..." : "Create Product"}
            </Button>
          </>
        }
      >
        <ProductForm
          key="create"
          formId={CREATE_FORM_ID}
          categories={categories}
          onSubmit={handleCreate}
          isEdit={false}
        />
      </ProductModal>

      {/* Edit Product Modal */}
      <ProductModal
        open={Boolean(editingProduct)}
        title="Edit Product"
        description="Update product information, pricing, categories, and media."
        onClose={() => setEditingProduct(null)}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingProduct(null)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={EDIT_FORM_ID}
              disabled={updateMutation.isPending}
              className="rounded-xl"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </>
        }
      >
        {editingProduct ? (
          <ProductForm
            key={`edit-${editingProduct.productId}`}
            initialValues={{
              name: editingProduct.name,
              description: editingProduct.description ?? "",
              brand: editingProduct.brand ?? "",
              sku: editingProduct.sku ?? "",
              price: editingProduct.price,
              discountPrice: editingProduct.discountPrice ?? 0,
              quantity: editingProduct.quantity ?? 0,
              categoryId: editingProduct.categoryId ?? "",
              sellingType: editingProduct.sellingType ?? "PIECE",
              baseUnit: editingProduct.baseUnit ?? "piece",
              unitLabel: editingProduct.unitLabel ?? "",
              minQuantity: editingProduct.minQuantity ?? 1,
              stepQuantity: editingProduct.stepQuantity ?? 1,
              allowCustomQuantity: editingProduct.allowCustomQuantity ?? false,
              stockTrackingMode: editingProduct.stockTrackingMode ?? "SEPARATE",
              hasNutritionalInfo: editingProduct.hasNutritionalInfo ?? false,
              nutritionalInfo: editingProduct.nutritionalInfo ?? null,
              variants: editingProduct.variants ?? [],
              images: editingProduct.images ?? [],
              imageUrl: editingProduct.image?.url,
              isPublished: editingProduct.isPublished ?? false,
              isActive: editingProduct.isActive ?? true,
              isFeatured: editingProduct.isFeatured ?? false,
            }}
            categories={categories}
            onSubmit={handleEdit}
            formId={EDIT_FORM_ID}
            isEdit={true}
          />
        ) : null}
      </ProductModal>

      {/* Quick Restock Modal from Products Table */}
      {restockProduct ? (
        <RestockModal
          product={restockProduct.product}
          currentQuantity={restockProduct.quantity}
          isSubmitting={restockMutation.isPending}
          onClose={() => {
            if (!restockMutation.isPending) setRestockProduct(null);
          }}
          onSubmit={(quantity, note) => {
            setFeedback(null);
            restockMutation.mutate({
              productId: restockProduct.product.productId ?? "",
              currentQuantity: restockProduct.quantity,
              quantity,
              note,
            });
          }}
        />
      ) : null}

      {/* Delete / Archive Confirmation Dialog */}
      <ProductModal
        open={Boolean(pendingDelete)}
        title="Archive Product"
        description="This will remove the product from your active store catalog."
        onClose={() => setPendingDelete(null)}
      >
        {pendingDelete ? (
          <DeleteDialog
            title="Archive this product?"
            description={`Are you sure you want to remove "${pendingDelete.name}" (SKU: ${pendingDelete.sku || "—"})? Customers won't be able to purchase it.`}
          >
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deleteMutation.isPending ? "Archiving..." : "Archive Product"}
            </Button>
          </DeleteDialog>
        ) : null}
      </ProductModal>

      {/* Hide / Restore Visibility Dialog */}
      <ProductModal
        open={Boolean(pendingStatus)}
        title="Product Visibility"
        description="Control whether this item is currently discoverable by shoppers."
        onClose={() => setPendingStatus(null)}
      >
        {pendingStatus ? (
          <ConfirmDialog
            title={
              pendingStatus.isActive === false
                ? "Restore Product to Catalog?"
                : "Hide Product from Catalog?"
            }
            description={
              pendingStatus.isActive === false
                ? `"${pendingStatus.name}" will become discoverable again for customers.`
                : `"${pendingStatus.name}" will be hidden from search and store pages without deleting its inventory data.`
            }
          >
            <Button variant="outline" onClick={() => setPendingStatus(null)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleStatusToggle}
              disabled={statusMutation.isPending}
              className="rounded-xl"
            >
              {statusMutation.isPending
                ? "Updating..."
                : pendingStatus.isActive === false
                  ? "Restore"
                  : "Hide"}
            </Button>
          </ConfirmDialog>
        ) : null}
      </ProductModal>
    </DashboardContent>
  );
}
