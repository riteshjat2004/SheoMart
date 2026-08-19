import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { AdminProductFilters, AdminProductListResponse } from "@/types/admin-product";

export async function fetchAdminProducts(filters: AdminProductFilters): Promise<AdminProductListResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.storeId) params.set("storeId", filters.storeId);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (typeof filters.isActive === "boolean") params.set("isActive", String(filters.isActive));
  if (typeof filters.isPublished === "boolean") params.set("isPublished", String(filters.isPublished));
  if (filters.inventoryStatus) params.set("inventoryStatus", filters.inventoryStatus);
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

  const response = await api.get<ApiResponse<AdminProductListResponse>>(`/api/v1/products/admin?${params.toString()}`);
  return response.data.data ?? {
    products: [],
    pagination: { page: filters.page, limit: filters.limit, total: 0, totalPages: 0 },
  };
}
