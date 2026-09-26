"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  FolderTree,
  CheckCircle2,
  XCircle,
  Package,
  Layers,
  Image as ImageIcon,
  RotateCcw,
} from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { CategoryModal } from "@/components/dashboard/admin/CategoryModal";
import { CategoryForm, type CategoryFormValues } from "@/components/dashboard/admin/CategoryForm";
import {
  fetchAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
  updateCategoryStatus,
} from "@/services/category";
import type { CategoryItem } from "@/types/marketplace";

function toCategoryRequest(payload: CategoryFormValues): FormData | Omit<CategoryFormValues, "imageFile" | "image"> {
  if (payload.imageFile) {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("description", payload.description || "");
    formData.append("sortOrder", String(payload.sortOrder ?? 0));
    formData.append("isActive", String(payload.isActive ?? true));
    if (payload.imageUrl) formData.append("imageUrl", payload.imageUrl);
    formData.append("image", payload.imageFile);
    return formData;
  }

  const { imageFile: _imageFile, image: _image, ...request } = payload;
  return request;
}

function getCategoryImageUrl(image: unknown): string {
  if (typeof image === "string") return image;
  if (image && typeof image === "object" && "url" in image && typeof image.url === "string") {
    return image.url;
  }
  return "";
}

type CategoryFilterTab = "all" | "active" | "inactive" | "has_products" | "empty";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<CategoryFilterTab>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CategoryItem | null>(null);
  const [pendingRestore, setPendingRestore] = useState<CategoryItem | null>(null);
  const [pendingStatus, setPendingStatus] = useState<CategoryItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const createFormRef = useRef<HTMLFormElement | null>(null);
  const editFormRef = useRef<HTMLFormElement | null>(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Auto-dismiss toast feedback
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<CategoryItem[], Error>({
    queryKey: ["admin-categories"],
    queryFn: () => fetchAdminCategories(),
    staleTime: 1000 * 60 * 3,
  });

  // Category statistics
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.isActive && !c.isDeleted).length;
    const inactive = categories.filter((c) => !c.isActive && !c.isDeleted).length;
    const empty = categories.filter((c) => !c.productCount || c.productCount === 0).length;
    return { total, active, inactive, empty };
  }, [categories]);

  // Filtered categories based on search and tab
  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      // Tab filter
      if (activeTab === "active" && !category.isActive) return false;
      if (activeTab === "inactive" && category.isActive) return false;
      if (activeTab === "has_products" && (!category.productCount || category.productCount === 0)) return false;
      if (activeTab === "empty" && (category.productCount ?? 0) > 0) return false;

      // Search filter
      if (debouncedSearch) {
        const nameMatch = (category.name || "").toLowerCase().includes(debouncedSearch);
        const slugMatch = (category.slug || "").toLowerCase().includes(debouncedSearch);
        const descMatch = (category.description || "").toLowerCase().includes(debouncedSearch);
        if (!nameMatch && !slugMatch && !descMatch) return false;
      }

      return true;
    });
  }, [categories, activeTab, debouncedSearch]);

  const invalidateCategoryQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const createMutation = useMutation({
    mutationFn: async (payload: CategoryFormValues) => {
      return createCategory(toCategoryRequest(payload));
    },
    onSuccess: (createdCategory) => {
      invalidateCategoryQueries();
      setFeedback({ type: "success", message: `Category "${createdCategory?.name ?? "New"}" created successfully.` });
      setIsCreateOpen(false);
    },
    onError: (err: unknown) => {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Unable to create category." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ categoryId, payload }: { categoryId: string; payload: CategoryFormValues }) => {
      return updateCategory(categoryId, toCategoryRequest(payload));
    },
    onSuccess: (updatedCategory) => {
      invalidateCategoryQueries();
      setFeedback({ type: "success", message: `Category "${updatedCategory?.name ?? ""}" updated successfully.` });
      setEditingCategory(null);
    },
    onError: (err: unknown) => {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Unable to update category." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      return deleteCategory(categoryId);
    },
    onSuccess: (deletedCategory) => {
      invalidateCategoryQueries();
      setFeedback({ type: "success", message: `Category "${deletedCategory?.name ?? ""}" removed successfully.` });
      setPendingDelete(null);
    },
    onError: (err: unknown) => {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Unable to delete category." });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      return restoreCategory(categoryId);
    },
    onSuccess: (restoredCategory) => {
      invalidateCategoryQueries();
      setFeedback({ type: "success", message: `Category "${restoredCategory?.name ?? ""}" restored successfully.` });
      setPendingRestore(null);
    },
    onError: (err: unknown) => {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Unable to restore category." });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ categoryId, isActive }: { categoryId: string; isActive: boolean }) => {
      return updateCategoryStatus(categoryId, isActive);
    },
    onSuccess: (updatedCategory) => {
      invalidateCategoryQueries();
      const statusText = updatedCategory?.isActive ? "activated" : "deactivated";
      setFeedback({ type: "success", message: `Category "${updatedCategory?.name ?? ""}" ${statusText} successfully.` });
      setPendingStatus(null);
    },
    onError: (err: unknown) => {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Unable to update category status." });
    },
  });

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Admin" }, { label: "Categories" }]} />

      <PageHeader
        title="Category Management"
        description="Create, edit, organize, and control marketplace categories and store taxonomy."
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="bg-emerald-600 text-white hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-1.5" />
            New Category
          </Button>
        }
      />

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

      {/* Top Summary Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Categories</span>
            <FolderTree className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-stone-900 dark:text-stone-100">{stats.total}</p>
          <span className="mt-1 block text-xs text-stone-500 dark:text-stone-400">Total in catalog</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active</span>
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</p>
          <span className="mt-1 block text-xs text-stone-500 dark:text-stone-400">Visible to shoppers</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Inactive</span>
            <XCircle className="h-5 w-5" />
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.inactive}</p>
          <span className="mt-1 block text-xs text-stone-500 dark:text-stone-400">Hidden from storefront</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Empty</span>
            <Package className="h-5 w-5 text-stone-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-stone-700 dark:text-stone-300">{stats.empty}</p>
          <span className="mt-1 block text-xs text-stone-500 dark:text-stone-400">No products assigned</span>
        </div>
      </div>

      {/* Main Table Card */}
      <DashboardCard title="Categories Catalog" description="Manage, filter, and inspect marketplace taxonomy.">
        {/* Controls Bar: Search & Tabs */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Tab Filters */}
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-stone-200 bg-stone-50 p-1 dark:border-stone-800 dark:bg-stone-900/60">
            {(
              [
                { id: "all", label: "All Categories", count: stats.total },
                { id: "active", label: "Active", count: stats.active },
                { id: "inactive", label: "Inactive", count: stats.inactive },
                { id: "has_products", label: "Has Products", count: stats.total - stats.empty },
                { id: "empty", label: "Empty", count: stats.empty },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeTab === tab.id
                    ? "bg-white text-emerald-700 shadow-sm dark:bg-stone-800 dark:text-emerald-400"
                    : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    activeTab === tab.id
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] max-w-sm flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search category name or slug..."
              className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-8 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-stone-800 dark:bg-stone-950"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <EmptyState title="Loading Categories" description="Retrieving categories and product count aggregation..." />
        )}

        {/* Error State */}
        {isError && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center dark:border-rose-900/60 dark:bg-rose-950/20">
            <XCircle className="h-10 w-10 text-rose-500 mb-2" />
            <h4 className="font-semibold text-rose-700 dark:text-rose-400">Failed to load categories</h4>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{error?.message ?? "An error occurred."}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
              Try Again
            </Button>
          </div>
        )}

        {/* Content Table */}
        {!isLoading && !isError && (
          <>
            {filteredCategories.length === 0 ? (
              <EmptyState
                title="No categories found"
                description={
                  debouncedSearch
                    ? `No categories match "${debouncedSearch}". Try a different search.`
                    : "No categories in this filter tab."
                }
              />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/80 text-xs font-semibold uppercase tracking-wider text-stone-600 backdrop-blur dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-400">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3">Category</th>
                      <th className="px-3 py-3.5">Slug</th>
                      <th className="px-3 py-3.5">Products</th>
                      <th className="px-3 py-3.5">Sort Order</th>
                      <th className="px-3 py-3.5">Status</th>
                      <th className="py-3.5 pl-3 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white dark:divide-stone-800/60 dark:bg-stone-950">
                    {filteredCategories.map((category) => {
                      const imageUrl = getCategoryImageUrl(category.image);
                      const productCount = category.productCount ?? 0;
                      const activeProductCount = category.activeProductCount ?? 0;

                      return (
                        <tr
                          key={category.categoryId ?? category._id}
                          className="transition hover:bg-stone-50/60 dark:hover:bg-stone-900/50"
                        >
                          {/* Category Image & Info */}
                          <td className="py-3 pl-4 pr-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-900">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={category.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      // Fallback on broken image
                                      (e.target as HTMLElement).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <ImageIcon className="h-5 w-5 text-stone-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="block font-medium text-stone-900 dark:text-stone-100 truncate">
                                  {category.name}
                                </span>
                                {category.description && (
                                  <span className="block text-xs text-stone-500 dark:text-stone-400 truncate max-w-xs">
                                    {category.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Slug */}
                          <td className="px-3 py-3 font-mono text-xs text-stone-500 dark:text-stone-400">
                            {category.slug || "—"}
                          </td>

                          {/* Product Count */}
                          <td className="px-3 py-3">
                            {productCount > 0 ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                                <Package className="h-3.5 w-3.5" />
                                {productCount} {productCount === 1 ? "product" : "products"}
                                {activeProductCount < productCount && (
                                  <span className="text-[10px] text-stone-500">
                                    ({activeProductCount} active)
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-500 dark:bg-stone-800/80 dark:text-stone-400">
                                0 empty
                              </span>
                            )}
                          </td>

                          {/* Sort Order */}
                          <td className="px-3 py-3 text-xs text-stone-600 dark:text-stone-400">
                            {category.sortOrder ?? 0}
                          </td>

                          {/* Status */}
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                category.isActive
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                  : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  category.isActive ? "bg-emerald-500" : "bg-stone-400"
                                }`}
                              />
                              {category.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 pl-3 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Toggle Status */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPendingStatus(category)}
                                className="h-8 px-2.5 text-xs"
                                title={category.isActive ? "Deactivate category" : "Activate category"}
                              >
                                {category.isActive ? (
                                  <ToggleRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-stone-400" />
                                )}
                                <span className="ml-1 hidden sm:inline">
                                  {category.isActive ? "Deactivate" : "Activate"}
                                </span>
                              </Button>

                              {/* Edit */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingCategory(category)}
                                className="h-8 px-2.5 text-xs"
                                title="Edit category"
                              >
                                <Pencil className="h-3.5 w-3.5 mr-1" />
                                <span className="hidden sm:inline">Edit</span>
                              </Button>

                              {/* Delete */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPendingDelete(category)}
                                className="h-8 px-2.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                                title="Delete category"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
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
      </DashboardCard>

      {/* Create Modal */}
      <CategoryModal
        open={isCreateOpen}
        title="Create Category"
        description="Add a new marketplace category with custom name, icon, and sorting order."
        submitLabel="Create Category"
        isSubmitting={createMutation.isPending}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={() => {
          createFormRef.current?.requestSubmit();
        }}
      >
        <CategoryForm ref={createFormRef} onSubmit={(values) => createMutation.mutate(values)} />
      </CategoryModal>

      {/* Edit Modal */}
      <CategoryModal
        open={Boolean(editingCategory)}
        title="Edit Category"
        description={`Update category details and assets for "${editingCategory?.name ?? ""}".`}
        submitLabel="Save Changes"
        isSubmitting={updateMutation.isPending}
        onClose={() => setEditingCategory(null)}
        onSubmit={() => {
          editFormRef.current?.requestSubmit();
        }}
      >
        {editingCategory && (
          <CategoryForm
            ref={editFormRef}
            initialValues={editingCategory}
            onSubmit={(values) => {
              if (editingCategory.categoryId) {
                updateMutation.mutate({ categoryId: editingCategory.categoryId, payload: values });
              }
            }}
          />
        )}
      </CategoryModal>

      {/* Status Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(pendingStatus)}
        title={pendingStatus?.isActive ? "Deactivate Category?" : "Activate Category?"}
        description={
          pendingStatus?.isActive
            ? `Deactivating "${pendingStatus?.name}" will hide it from the storefront navigation and catalog browsing.`
            : `Activating "${pendingStatus?.name}" will make it immediately visible to marketplace shoppers.`
        }
        confirmLabel={pendingStatus?.isActive ? "Deactivate" : "Activate"}
        isConfirming={statusMutation.isPending}
        onClose={() => setPendingStatus(null)}
        onConfirm={() => {
          if (pendingStatus?.categoryId) {
            statusMutation.mutate({
              categoryId: pendingStatus.categoryId,
              isActive: !pendingStatus.isActive,
            });
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete Category?"
        description={`Are you sure you want to remove "${pendingDelete?.name}"? It will be soft-deleted and removed from active storefront listings.`}
        confirmLabel="Delete Category"
        confirmVariant="default"
        isConfirming={deleteMutation.isPending}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete?.categoryId) {
            deleteMutation.mutate(pendingDelete.categoryId);
          }
        }}
      />
    </DashboardContent>
  );
}
