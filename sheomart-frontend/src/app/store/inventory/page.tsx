"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, CheckCircle2, CircleAlert, CircleX, RefreshCw } from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
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
import { fetchInventory, updateInventory } from "@/services/inventory";
import type { ProductItem } from "@/types/marketplace";
import type { InventoryItem } from "@/types/inventory";

const PAGE_SIZE = 6;
type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock";

function getInventoryStatus(inventory: InventoryItem | null): InventoryStatus {
  const availableQuantity = inventory?.availableQuantity ?? 0;
  const threshold = inventory?.lowStockThreshold ?? 0;

  if (availableQuantity === 0) {
    return "out_of_stock";
  }

  return availableQuantity <= threshold ? "low_stock" : "in_stock";
}

export default function StoreInventoryPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const productsQuery = useQuery<ProductItem[], Error>({
    queryKey: ["store-products"],
    queryFn: fetchStoreProducts,
    staleTime: 1000 * 60 * 5,
  });
  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);

  const inventoryQuery = useQuery<Record<string, InventoryItem | null>>({
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
  const inventoryMap = useMemo(() => inventoryQuery.data ?? {}, [inventoryQuery.data]);

  const inventoryRows = useMemo(
    () => products.map((product) => ({ product, inventory: product.productId ? inventoryMap[product.productId] ?? null : null })),
    [products, inventoryMap]
  );

  const summary = useMemo(() => {
    const result: Record<"total" | InventoryStatus, number> = { total: 0, in_stock: 0, low_stock: 0, out_of_stock: 0 };
    for (const row of inventoryRows) {
      result.total += 1;
      result[getInventoryStatus(row.inventory)] += 1;
    }
    return result;
  }, [inventoryRows]);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return inventoryRows.filter(({ product, inventory }) => {
      const matchesSearch = !normalized || `${product.name ?? ""} ${product.sku ?? ""} ${product.category ?? ""}`.toLowerCase().includes(normalized);
      const matchesFilter = statusFilter === "all" || getInventoryStatus(inventory) === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [inventoryRows, query, statusFilter]);

  const pagedRows = useMemo(() => filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredRows, page]);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  const updateMutation = useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: InventoryFormValues }) => updateInventory(productId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory-map"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product"] }),
        queryClient.invalidateQueries({ queryKey: ["store-products"] }),
      ]);
      setEditingProduct(null);
      setPage(1);
      setFeedback({ type: "success", message: "Inventory updated successfully." });
    },
    onError: (error) => setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to update inventory." }),
  });

  const handleUpdate = (values: InventoryFormValues) => {
    if (!editingProduct?.productId) {
      return;
    }
    setFeedback(null);
    updateMutation.mutate({ productId: editingProduct.productId, payload: values });
  };

  const refreshInventory = async () => {
    setFeedback(null);
    await productsQuery.refetch();
    await inventoryQuery.refetch();
  };

  const isLoading = productsQuery.isLoading || inventoryQuery.isLoading;
  const isRefreshing = productsQuery.isFetching || inventoryQuery.isFetching;
  const isError = productsQuery.isError || inventoryQuery.isError;
  const error = productsQuery.error ?? inventoryQuery.error;

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Store" }, { label: "Inventory" }]} />
      <PageHeader title="Inventory management" description="Adjust stock, reserve levels, and monitor availability for each product." actions={<Button variant="outline" onClick={refreshInventory} disabled={isRefreshing}><RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />{isRefreshing ? "Refreshing..." : "Refresh inventory"}</Button>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total products", value: summary.total, icon: Boxes },
          { label: "In stock", value: summary.in_stock, icon: CheckCircle2 },
          { label: "Low stock", value: summary.low_stock, icon: CircleAlert },
          { label: "Out of stock", value: summary.out_of_stock, icon: CircleX },
        ].map((stat) => {
          const Icon = stat.icon;
          return <DashboardCard key={stat.label} title={stat.label}><div className="flex items-center justify-between"><span className="text-2xl font-semibold text-stone-900 dark:text-stone-50">{stat.value}</span><Icon className="h-5 w-5 text-emerald-600" /></div></DashboardCard>;
        })}
      </div>

      {feedback ? <div className={`rounded-2xl border p-4 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{feedback.message}</div> : null}

      <DashboardCard title="Inventory overview" description="Search, filter, and update stock for your product catalog.">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1"><SearchBar placeholder="Search by product, SKU, or category" value={query} onChange={(value) => { setQuery(value); setPage(1); }} /></div>
          <FilterBar><label className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300"><span className="font-medium">Status</span><select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="rounded-full border border-stone-200 bg-white px-3 py-2 text-sm outline-none dark:border-stone-800 dark:bg-stone-900"><option value="all">All</option><option value="in_stock">In stock</option><option value="low_stock">Low stock</option><option value="out_of_stock">Out of stock</option></select></label></FilterBar>
        </div>

        {isLoading ? <div className="mt-4"><LoadingSkeleton rows={6} /></div> : null}
        {isError ? <div className="mt-4 space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><p>{error?.message ?? "Unable to load inventory"}</p><Button variant="outline" onClick={refreshInventory}>Retry</Button></div> : null}

        {!isLoading && !isError ? <div className="mt-4 space-y-4">{filteredRows.length === 0 ? <EmptyState title={inventoryRows.length === 0 ? "No inventory yet" : "No inventory matches your filters"} description={inventoryRows.length === 0 ? "Create products to start tracking stock." : "Try a different search term or status filter."} /> : <><InventoryManagementTable rows={pagedRows} onEdit={setEditingProduct} /><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></>}</div> : null}
      </DashboardCard>

      <ProductModal open={Boolean(editingProduct)} title="Update inventory" description="Adjust available stock, reserve levels, and low-stock thresholds." onClose={() => setEditingProduct(null)}>
        {editingProduct?.productId ? <InventoryForm initialValues={{ availableQuantity: inventoryMap[editingProduct.productId]?.availableQuantity ?? 0, reservedQuantity: inventoryMap[editingProduct.productId]?.reservedQuantity ?? 0, soldQuantity: inventoryMap[editingProduct.productId]?.soldQuantity ?? 0, lowStockThreshold: inventoryMap[editingProduct.productId]?.lowStockThreshold ?? 5, status: inventoryMap[editingProduct.productId]?.status ?? "in_stock" }} isSubmitting={updateMutation.isPending} onSubmit={handleUpdate} /> : null}
      </ProductModal>
    </DashboardContent>
  );
}
