"use client";

import { useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AdminProductRow } from "@/components/dashboard/admin/AdminProductRow";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { fetchCategories } from "@/services/category";
import { fetchAdminStores } from "@/services/store";
import { useAdminProducts } from "@/hooks/use-admin-products";
import type { AdminProductFilters, AdminProductInventoryStatus } from "@/types/admin-product";
import type { CategoryItem, StoreItem } from "@/types/marketplace";

const defaultFilters: AdminProductFilters = {
  page: 1,
  limit: 25,
  sortBy: "createdAt",
  sortOrder: "desc",
};

const inventoryStatuses: Array<{ value: AdminProductInventoryStatus; label: string }> = [
  { value: "in_stock", label: "In stock" },
  { value: "low_stock", label: "Low stock" },
  { value: "out_of_stock", label: "Out of stock" },
  { value: "discontinued", label: "Discontinued" },
  { value: "unavailable", label: "Unavailable" },
];

function parseBooleanFilter(value: string) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export default function AdminProductsPage() {
  const [filters, setFilters] = useState<AdminProductFilters>(defaultFilters);
  const productsQuery = useAdminProducts(filters);
  const products = productsQuery.data?.products ?? [];
  const pagination = productsQuery.data?.pagination;

  const categoriesQuery = useQuery<CategoryItem[], Error>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
  });
  const storesQuery = useQuery<StoreItem[], Error>({
    queryKey: ["stores", "admin"],
    queryFn: fetchAdminStores,
    staleTime: 1000 * 60 * 5,
  });

  const updateFilters = (updates: Partial<AdminProductFilters>) => {
    setFilters((current) => ({ ...current, ...updates, page: 1 }));
  };

  const clearFilters = () => setFilters(defaultFilters);

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Admin" }, { label: "Products" }]} />
      <PageHeader title="Product catalog" description="Review the platform catalog, ownership, pricing, publication, and inventory visibility from one read-only workspace." />

      <DashboardCard title="Catalog view" description="Search and filter products without changing catalog, inventory, image, category, or store data.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(17rem,1.6fr)_repeat(3,minmax(10rem,1fr))_auto]">
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-500 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
            <Search className="h-4 w-4 shrink-0" />
            <input value={filters.search ?? ""} onChange={(event) => updateFilters({ search: event.target.value || undefined })} placeholder="Search name, SKU, brand, or ID" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-stone-400" />
          </label>

          <select value={filters.storeId ?? ""} onChange={(event) => updateFilters({ storeId: event.target.value || undefined })} className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
            <option value="">All stores</option>
            {storesQuery.data?.map((store) => <option key={store.storeId ?? store._id} value={store.storeId ?? store._id ?? ""}>{store.storeName ?? store.name ?? "Store"}</option>)}
          </select>

          <select value={filters.categoryId ?? ""} onChange={(event) => updateFilters({ categoryId: event.target.value || undefined })} className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
            <option value="">All categories</option>
            {categoriesQuery.data?.map((category) => <option key={category.categoryId ?? category._id} value={category.categoryId ?? category._id ?? ""}>{category.name}</option>)}
          </select>

          <select value={filters.inventoryStatus ?? ""} onChange={(event) => updateFilters({ inventoryStatus: (event.target.value || undefined) as AdminProductInventoryStatus | undefined })} className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
            <option value="">All inventory</option>
            {inventoryStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </select>

          <select value={filters.isActive === undefined ? "" : String(filters.isActive)} onChange={(event) => updateFilters({ isActive: parseBooleanFilter(event.target.value) })} className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
            <option value="">All activity</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <select value={filters.isPublished === undefined ? "" : String(filters.isPublished)} onChange={(event) => updateFilters({ isPublished: parseBooleanFilter(event.target.value) })} className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
            <option value="">All publication</option>
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>

          <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
            <RotateCcw className="h-4 w-4" />
            Clear
          </Button>
        </div>

        <div className="mt-5">
          {productsQuery.isLoading ? <EmptyState title="Loading products" description="Fetching the latest platform catalog." /> : null}
          {productsQuery.isError ? <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300">{productsQuery.error instanceof Error ? productsQuery.error.message : "Unable to load products."}</div> : null}
          {!productsQuery.isLoading && !productsQuery.isError && products.length === 0 ? <EmptyState title="No products found" description="No products match the current search and filters." /> : null}
          {!productsQuery.isLoading && !productsQuery.isError && products.length > 0 ? <div className="space-y-3">{products.map((product) => <AdminProductRow key={product.productId} product={product} />)}</div> : null}
        </div>

        {pagination && pagination.totalPages > 0 ? (
          <div className="mt-5 flex flex-col gap-3 border-t border-stone-200 pt-4 text-sm text-stone-600 dark:border-stone-800 dark:text-stone-300 sm:flex-row sm:items-center sm:justify-between">
            <span>Page {pagination.page} of {pagination.totalPages} - {pagination.total} products</span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" disabled={pagination.page <= 1 || productsQuery.isFetching} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}>Previous</Button>
              <Button type="button" variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages || productsQuery.isFetching} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}>Next</Button>
            </div>
          </div>
        ) : null}
      </DashboardCard>
    </DashboardContent>
  );
}
