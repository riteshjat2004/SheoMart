"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Search, Plus } from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { Pagination } from "@/components/dashboard/Pagination";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { ProductModal } from "@/components/dashboard/store/ProductModal";
import { InventoryForm, type InventoryFormValues } from "@/components/dashboard/store/InventoryForm";
import { InventoryManagementTable } from "@/components/dashboard/store/InventoryManagementTable";
import { fetchStoreProducts } from "@/services/product";
import { updateInventory, updateInventoryStatus, fetchInventory } from "@/services/inventory";
import type { ProductItem } from "@/types/marketplace";
import type { InventoryItem } from "@/types/inventory";

const PAGE_SIZE = 6;

export default function StoreInventoryPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [pendingDiscontinue, setPendingDiscontinue] = useState<ProductItem | null>(null);

  const { data: products = [], isLoading, isError, error } = useQuery<ProductItem[], Error>({
    queryKey: ["store-products"],
    queryFn: async () => fetchStoreProducts(),
    staleTime: 1000 * 60 * 5,
  });

  const inventoryQueries = useQuery<Record<string, InventoryItem | null>>({
    queryKey: ["inventory-map"],
    queryFn: async () => {
      const results: Record<string, InventoryItem | null> = {};
      for (const product of products) {
        if (product.productId) {
          results[product.productId] = await fetchInventory(product.productId);
        }
      }
      return results;
    },
    enabled: products.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const inventoryMap = inventoryQueries.data ?? {};

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products
      .map((product) => ({ product, inventory: product.productId ? inventoryMap[product.productId] ?? null : null }))
      .filter(({ product, inventory }) => {
        const matchesSearch = !normalized || `${product.name ?? ""} ${product.sku ?? ""}`.toLowerCase().includes(normalized);
        const matchesFilter = statusFilter === "all" || (statusFilter === "in_stock" && inventory?.status === "in_stock") || (statusFilter === "low_stock" && inventory?.status === "low_stock") || (statusFilter === "out_of_stock" && inventory?.status === "out_of_stock") || (statusFilter === "discontinued" && inventory?.status === "discontinued");
        return matchesSearch && matchesFilter;
      });
  }, [products, inventoryMap, query, statusFilter]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  const updateMutation = useMutation({
    mutationFn: async ({ productId, payload }: { productId: string; payload: InventoryFormValues }) => updateInventory(productId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory-map"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product"] }),
        queryClient.invalidateQueries({ queryKey: ["store-products"] }),
      ]);
      setEditingProduct(null);
      setPage(1);
    },
  });

  const discontinueMutation = useMutation({
    mutationFn: async ({ productId }: { productId: string }) => updateInventoryStatus(productId, "discontinued"),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory-map"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product"] }),
        queryClient.invalidateQueries({ queryKey: ["store-products"] }),
      ]);
      setPendingDiscontinue(null);
    },
  });

  const handleUpdate = (values: InventoryFormValues) => {
    if (!editingProduct?.productId) {
      return;
    }
    updateMutation.mutate({ productId: editingProduct.productId, payload: values });
  };

  const handleDiscontinue = () => {
    if (!pendingDiscontinue?.productId) {
      return;
    }
    discontinueMutation.mutate({ productId: pendingDiscontinue.productId });
  };

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Store" }, { label: "Inventory" }]} />
      <PageHeader title="Inventory management" description="Adjust stock, reserve levels, and monitor availability for each product." actions={<Button variant="outline"><Plus className="h-4 w-4" />Refresh</Button>} />

      <DashboardCard title="Inventory overview" description="Search, filter, and update stock for your product catalog.">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <SearchBar placeholder="Search by product or SKU" value={query} onChange={(value) => { setQuery(value); setPage(1); }} />
          </div>
          <FilterBar>
            <label className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
              <span className="font-medium">Status</span>
              <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="rounded-full border border-stone-200 bg-white px-3 py-2 text-sm outline-none dark:border-stone-800 dark:bg-stone-900">
                <option value="all">All</option>
                <option value="in_stock">In stock</option>
                <option value="low_stock">Low stock</option>
                <option value="out_of_stock">Out of stock</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </label>
          </FilterBar>
        </div>

        {isLoading ? <div className="mt-4 rounded-2xl border border-dashed border-stone-200 p-6 text-sm text-stone-500">Loading inventory…</div> : null}
        {isError ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error?.message ?? "Unable to load inventory"}</div> : null}

        {!isLoading && !isError ? (
          <div className="mt-4 space-y-4">
            {filteredRows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-200 p-6 text-sm text-stone-500">No inventory records match your search.</div>
            ) : (
              <>
                <InventoryManagementTable rows={pagedRows} onEdit={(product) => setEditingProduct(product)} onDiscontinue={(product) => setPendingDiscontinue(product)} />
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </div>
        ) : null}
      </DashboardCard>

      <ProductModal open={Boolean(editingProduct)} title="Update inventory" description="Adjust available stock, reserve levels, and low-stock thresholds." onClose={() => setEditingProduct(null)}>
        {editingProduct?.productId ? (
          <InventoryForm
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

      <ProductModal open={Boolean(pendingDiscontinue)} title="Discontinue product" description="Mark this product as discontinued in inventory." onClose={() => setPendingDiscontinue(null)}>
        {pendingDiscontinue ? (
          <ConfirmDialog title="Mark this product discontinued?" description="This will set the inventory status to discontinued.">
            <Button variant="outline" onClick={() => setPendingDiscontinue(null)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleDiscontinue} disabled={discontinueMutation.isPending}>
              Discontinue
            </Button>
          </ConfirmDialog>
        ) : null}
      </ProductModal>
    </DashboardContent>
  );
}
