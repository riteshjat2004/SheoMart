"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search } from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { DeleteDialog } from "@/components/dashboard/DeleteDialog";
import { Button } from "@/components/ui/button";
import { CategoryModal } from "@/components/dashboard/admin/CategoryModal";
import { CategoryForm, type CategoryFormValues } from "@/components/dashboard/admin/CategoryForm";
import { fetchCategories } from "@/services/category";
import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { CategoryItem } from "@/types/marketplace";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CategoryItem | null>(null);
  const [pendingStatus, setPendingStatus] = useState<CategoryItem | null>(null);

  const { data: categories = [], isLoading, isError, error } = useQuery<CategoryItem[], Error>({
    queryKey: ["categories"],
    queryFn: async () => fetchCategories(),
    staleTime: 1000 * 60 * 5,
  });

  const filteredCategories = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return categories;
    }

    return categories.filter((category) => {
      const haystack = `${category.name ?? ""} ${category.description ?? ""}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [categories, query]);

  const createMutation = useMutation({
    mutationFn: async (payload: CategoryFormValues) => {
      const response = await api.post<ApiResponse<{ category: CategoryItem }>>("/api/v1/categories", payload);
      return response.data.data?.category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsCreateOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ categoryId, payload }: { categoryId: string; payload: CategoryFormValues }) => {
      const response = await api.patch<ApiResponse<{ category: CategoryItem }>>(`/api/v1/categories/${categoryId}`, payload);
      return response.data.data?.category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategory(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await api.delete<ApiResponse<{ category: CategoryItem }>>(`/api/v1/categories/${categoryId}`);
      return response.data.data?.category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setPendingDelete(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ categoryId, isActive }: { categoryId: string; isActive: boolean }) => {
      const response = await api.patch<ApiResponse<{ category: CategoryItem }>>(`/api/v1/categories/${categoryId}/status`, { isActive });
      return response.data.data?.category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setPendingStatus(null);
    },
  });

  const handleCreate = (values: CategoryFormValues) => {
    createMutation.mutate(values);
  };

  const handleEdit = (values: CategoryFormValues) => {
    if (!editingCategory?.categoryId) {
      return;
    }
    updateMutation.mutate({ categoryId: editingCategory.categoryId, payload: values });
  };

  const handleDelete = () => {
    if (!pendingDelete?.categoryId) {
      return;
    }
    deleteMutation.mutate(pendingDelete.categoryId);
  };

  const handleStatusToggle = () => {
    if (!pendingStatus?.categoryId) {
      return;
    }
    statusMutation.mutate({ categoryId: pendingStatus.categoryId, isActive: !pendingStatus.isActive });
  };

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Admin" }, { label: "Categories" }]} />
      <PageHeader
        title="Category management"
        description="Create, edit, deactivate, and remove marketplace categories from the platform admin dashboard."
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New category
          </Button>
        }
      />

      <DashboardCard title="Categories" description="Use the controls below to manage the store taxonomy.">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-sm text-stone-500 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
            <Search className="h-4 w-4" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search categories"
              className="w-full bg-transparent outline-none placeholder:text-stone-400"
            />
          </label>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-stone-200 p-6 text-sm text-stone-500">Loading categories…</div>
        ) : null}

        {isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error?.message ?? "Unable to load categories"}</div>
        ) : null}

        {!isLoading && !isError ? (
          <div className="space-y-3">
            {filteredCategories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-200 p-6 text-sm text-stone-500">No categories found.</div>
            ) : null}

            {filteredCategories.map((category) => (
              <div key={category.categoryId ?? category._id} className="flex flex-col gap-3 rounded-[1.5rem] border border-stone-200 bg-white/80 p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/80 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-semibold text-stone-900 dark:text-stone-50">{category.name}</h4>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${category.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300"}`}>
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{category.description || "No description provided."}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPendingStatus(category)}>
                    {category.isActive ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                    {category.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditingCategory(category)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPendingDelete(category)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </DashboardCard>

      <CategoryModal
        open={isCreateOpen}
        title="Create category"
        description="Add a new marketplace category and make it available to shoppers."
        submitLabel="Create category"
        isSubmitting={createMutation.isPending}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={() => {
          const form = document.querySelector("form");
          if (form) {
            form.requestSubmit();
          }
        }}
      >
        <CategoryForm onSubmit={handleCreate} isSubmitting={createMutation.isPending} />
      </CategoryModal>

      <CategoryModal
        open={Boolean(editingCategory)}
        title="Edit category"
        description="Update the selected category details."
        submitLabel="Save changes"
        isSubmitting={updateMutation.isPending}
        onClose={() => setEditingCategory(null)}
        onSubmit={() => {
          const form = document.querySelector("form");
          if (form) {
            form.requestSubmit();
          }
        }}
      >
        {editingCategory ? (
          <CategoryForm initialValues={editingCategory} onSubmit={handleEdit} isSubmitting={updateMutation.isPending} />
        ) : null}
      </CategoryModal>

      <CategoryModal
        open={Boolean(pendingDelete)}
        title="Delete category"
        description="This will deactivate the category and remove it from active listings."
        submitLabel="Delete category"
        isSubmitting={deleteMutation.isPending}
        onClose={() => setPendingDelete(null)}
        onSubmit={handleDelete}
      >
        {pendingDelete ? (
          <DeleteDialog title="Delete this category?" description={`This action will deactivate ${pendingDelete.name}.`}>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleDelete} disabled={deleteMutation.isPending}>
              Delete
            </Button>
          </DeleteDialog>
        ) : null}
      </CategoryModal>

      <CategoryModal
        open={Boolean(pendingStatus)}
        title="Update category status"
        description="Toggle whether the category remains visible to shoppers."
        submitLabel="Save status"
        isSubmitting={statusMutation.isPending}
        onClose={() => setPendingStatus(null)}
        onSubmit={handleStatusToggle}
      >
        {pendingStatus ? (
          <ConfirmDialog title={pendingStatus.isActive ? "Deactivate this category?" : "Activate this category?"} description="This will change the visibility of the category in the storefront.">
            <Button variant="outline" onClick={() => setPendingStatus(null)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleStatusToggle} disabled={statusMutation.isPending}>
              {pendingStatus.isActive ? "Deactivate" : "Activate"}
            </Button>
          </ConfirmDialog>
        ) : null}
      </CategoryModal>
    </DashboardContent>
  );
}
