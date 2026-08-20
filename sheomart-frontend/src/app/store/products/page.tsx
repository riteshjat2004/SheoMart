"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { Pagination } from "@/components/dashboard/Pagination";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { DeleteDialog } from "@/components/dashboard/DeleteDialog";
import { Button } from "@/components/ui/button";
import { ProductModal } from "@/components/dashboard/store/ProductModal";
import { ProductForm, type ProductFormValues } from "@/components/dashboard/store/ProductForm";
import { ProductManagementTable } from "@/components/dashboard/store/ProductManagementTable";
import { fetchCategories } from "@/services/category";
import { fetchStoreProducts } from "@/services/product";
import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { CategoryItem, ProductItem } from "@/types/marketplace";

const PAGE_SIZE = 6;
const CREATE_FORM_ID = "store-create-product-form";
const EDIT_FORM_ID = "store-edit-product-form";

type Feedback = { type: "success" | "error"; message: string } | null;

function getMutationError(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function StoreProductsPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ProductItem | null>(null);
  const [pendingStatus, setPendingStatus] = useState<ProductItem | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const { data: products = [], isLoading, isError, error } = useQuery<ProductItem[], Error>({
    queryKey: ["store-products"],
    queryFn: async () => fetchStoreProducts(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: categories = [] } = useQuery<CategoryItem[], Error>({
    queryKey: ["categories"],
    queryFn: async () => fetchCategories(),
    staleTime: 1000 * 60 * 5,
  });

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch = !normalized || `${product.name ?? ""} ${product.sku ?? ""} ${product.category ?? ""}`.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "all" || (statusFilter === "published" && product.isPublished) || (statusFilter === "draft" && !product.isPublished) || (statusFilter === "hidden" && product.isActive === false);
      return matchesSearch && matchesStatus;
    });
  }, [products, query, statusFilter]);

  const pagedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  const createMutation = useMutation({
    mutationFn: async (payload: ProductFormValues) => {
      const createPayload = Object.fromEntries(Object.entries(payload).filter(([key]) => key !== "isActive"));
      const response = await api.post<ApiResponse<{ product: ProductItem }>>("/api/v1/products", createPayload);
      return response.data.data?.product;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["store-products"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-map"] }),
      ]);
      setIsCreateOpen(false);
      setPage(1);
      setFeedback({ type: "success", message: "Product created successfully." });
    },
    onError: (error) => setFeedback({ type: "error", message: getMutationError(error, "Unable to create product.") }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ productId, payload }: { productId: string; payload: ProductFormValues }) => {
      const response = await api.patch<ApiResponse<{ product: ProductItem }>>(`/api/v1/products/${productId}`, payload);
      return response.data.data?.product;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["store-products"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-map"] }),
      ]);
      setEditingProduct(null);
      setPage(1);
      setFeedback({ type: "success", message: "Product updated successfully." });
    },
    onError: (error) => setFeedback({ type: "error", message: getMutationError(error, "Unable to update product.") }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await api.delete<ApiResponse<{ product: ProductItem }>>(`/api/v1/products/${productId}`);
      return response.data.data?.product;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["store-products"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-map"] }),
      ]);
      setPendingDelete(null);
      setFeedback({ type: "success", message: "Product archived successfully." });
    },
    onError: (error) => setFeedback({ type: "error", message: getMutationError(error, "Unable to archive product.") }),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ productId, isActive }: { productId: string; isActive: boolean }) => {
      const response = await api.patch<ApiResponse<{ product: ProductItem }>>(`/api/v1/products/${productId}/status`, { isActive });
      return response.data.data?.product;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["store-products"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-map"] }),
      ]);
      setPendingStatus(null);
      setFeedback({ type: "success", message: "Product visibility updated successfully." });
    },
    onError: (error) => setFeedback({ type: "error", message: getMutationError(error, "Unable to update product visibility.") }),
  });

  const handleCreate = (values: ProductFormValues) => {
    setFeedback(null);
    createMutation.mutate(values);
  };

  const handleEdit = (values: ProductFormValues) => {
    if (!editingProduct?.productId) {
      return;
    }
    setFeedback(null);
    updateMutation.mutate({ productId: editingProduct.productId, payload: values });
  };

  const handleDelete = () => {
    if (!pendingDelete?.productId) {
      return;
    }
    setFeedback(null);
    deleteMutation.mutate(pendingDelete.productId);
  };

  const handleStatusToggle = () => {
    if (!pendingStatus?.productId) {
      return;
    }
    setFeedback(null);
    statusMutation.mutate({ productId: pendingStatus.productId, isActive: pendingStatus.isActive === false });
  };

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Store" }, { label: "Products" }]} />
      <PageHeader
        title="Product management"
        description="Create, edit, publish, and organize your catalog from the dashboard."
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New product
          </Button>
        }
      />

      {feedback ? <div className={`rounded-2xl border p-4 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{feedback.message}</div> : null}

      <DashboardCard title="Catalog controls" description="Use the search, filters, and actions below to keep your manager inventory tidy.">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <SearchBar placeholder="Search by name, SKU, or category" value={query} onChange={(value) => { setQuery(value); setPage(1); }} />
          </div>
          <FilterBar>
            <label className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
              <span className="font-medium">Status</span>
              <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="rounded-full border border-stone-200 bg-white px-3 py-2 text-sm outline-none dark:border-stone-800 dark:bg-stone-900">
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="hidden">Hidden</option>
              </select>
            </label>
          </FilterBar>
        </div>

        {isLoading ? <div className="mt-4 rounded-2xl border border-dashed border-stone-200 p-6 text-sm text-stone-500">Loading your products…</div> : null}

        {isError ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error?.message ?? "Unable to load your products"}</div> : null}

        {!isLoading && !isError ? (
          <div className="mt-4 space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-200 p-6 text-sm text-stone-500">No products match your search yet.</div>
            ) : (
              <>
                <ProductManagementTable
                  products={pagedProducts}
                  onEdit={(product) => setEditingProduct(product)}
                  onDelete={(product) => setPendingDelete(product)}
                  onToggleStatus={(product) => setPendingStatus(product)}
                />
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </div>
        ) : null}
      </DashboardCard>

      <ProductModal
        open={isCreateOpen}
        title="Create product"
        description="Add a new product to your catalog and share it with customers once you publish it."
        onClose={() => setIsCreateOpen(false)}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={createMutation.isPending}>Cancel</Button>
            <Button type="submit" form={CREATE_FORM_ID} disabled={createMutation.isPending}>{createMutation.isPending ? "Saving..." : "Create product"}</Button>
          </>
        }
      >
        <ProductForm key="create" formId={CREATE_FORM_ID} categories={categories} onSubmit={handleCreate} />
      </ProductModal>

      <ProductModal
        open={Boolean(editingProduct)}
        title="Edit product"
        description="Update the product details, pricing, and image URLs."
        onClose={() => setEditingProduct(null)}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setEditingProduct(null)} disabled={updateMutation.isPending}>Cancel</Button>
            <Button type="submit" form={EDIT_FORM_ID} disabled={updateMutation.isPending}>{updateMutation.isPending ? "Saving..." : "Save changes"}</Button>
          </>
        }
      >
        {editingProduct ? (
          <ProductForm
            initialValues={{
              name: editingProduct.name,
              description: editingProduct.description ?? "",
              brand: editingProduct.brand ?? "",
              sku: editingProduct.sku ?? "",
              price: editingProduct.price,
              discountPrice: editingProduct.discountPrice ?? 0,
              categoryId: editingProduct.categoryId ?? "",
              images: editingProduct.images ?? [],
              isPublished: editingProduct.isPublished ?? false,
              isActive: editingProduct.isActive ?? true,
            }}
            categories={categories}
            onSubmit={handleEdit}
            formId={EDIT_FORM_ID}
          />
        ) : null}
      </ProductModal>

      <ProductModal open={Boolean(pendingDelete)} title="Delete product" description="This will remove the product from active catalog management." onClose={() => setPendingDelete(null)}>
        {pendingDelete ? (
          <DeleteDialog title="Delete this product?" description={`This action will archive ${pendingDelete.name} from your catalog.`}>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleDelete} disabled={deleteMutation.isPending}>
              Delete
            </Button>
          </DeleteDialog>
        ) : null}
      </ProductModal>

      <ProductModal open={Boolean(pendingStatus)} title="Update product visibility" description="Choose whether the product should remain visible in the catalog." onClose={() => setPendingStatus(null)}>
        {pendingStatus ? (
          <ConfirmDialog title={pendingStatus.isActive === false ? "Restore this product?" : "Hide this product?"} description="This changes whether the product is available for shoppers.">
            <Button variant="outline" onClick={() => setPendingStatus(null)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleStatusToggle} disabled={statusMutation.isPending}>
              {pendingStatus.isActive === false ? "Restore" : "Hide"}
            </Button>
          </ConfirmDialog>
        ) : null}
      </ProductModal>
    </DashboardContent>
  );
}
