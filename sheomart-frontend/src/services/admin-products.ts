import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { AdminProductFilters, AdminProductListResponse } from "@/types/admin-product";

export async function fetchAdminProducts(filters: AdminProductFilters): Promise<AdminProductListResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.storeId) params.set("storeId", filters.storeId);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.status) params.set("status", filters.status);
  if (typeof filters.isActive === "boolean") params.set("isActive", String(filters.isActive));
  if (typeof filters.isPublished === "boolean") params.set("isPublished", String(filters.isPublished));
  if (typeof filters.isFeatured === "boolean") params.set("isFeatured", String(filters.isFeatured));
  if (typeof filters.isDeleted === "boolean") params.set("isDeleted", String(filters.isDeleted));
  if (typeof filters.minPrice === "number") params.set("minPrice", String(filters.minPrice));
  if (typeof filters.maxPrice === "number") params.set("maxPrice", String(filters.maxPrice));
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

export async function createAdminProduct(payload: FormData | Record<string, unknown>) {
  const response = await api.post<ApiResponse<{ product: import("@/types/marketplace").ProductItem }>>("/api/v1/products", payload);
  return response.data.data?.product;
}

export async function updateAdminProduct(productId: string, payload: FormData | Record<string, unknown>) {
  const response = await api.patch<ApiResponse<{ product: import("@/types/marketplace").ProductItem }>>(`/api/v1/products/${productId}`, payload);
  return response.data.data?.product;
}

export async function deleteAdminProduct(productId: string) {
  const response = await api.delete<ApiResponse<{ product: import("@/types/marketplace").ProductItem }>>(`/api/v1/products/${productId}`);
  return response.data.data?.product;
}

export async function restoreAdminProduct(productId: string) {
  const response = await api.patch<ApiResponse<{ product: import("@/types/marketplace").ProductItem }>>(`/api/v1/products/${productId}/restore`);
  return response.data.data?.product;
}

export async function updateAdminProductStatus(productId: string, isActive: boolean) {
  const response = await api.patch<ApiResponse<{ product: import("@/types/marketplace").ProductItem }>>(`/api/v1/products/${productId}/status`, { isActive });
  return response.data.data?.product;
}

export async function bulkAdminProductAction(
  productIds: string[],
  action: "activate" | "deactivate" | "delete" | "restore" | "feature" | "unfeature"
) {
  const response = await api.post<ApiResponse<{ matchedCount: number; modifiedCount: number }>>(
    "/api/v1/products/admin/bulk-action",
    { productIds, action }
  );
  return response.data.data;
}

export async function toggleAdminProductFeatured(
  productId: string,
  isFeatured: boolean,
  priority?: number
) {
  const response = await api.patch<ApiResponse<{ product: import("@/types/marketplace").ProductItem }>>(
    `/api/v1/products/admin/${productId}/feature`,
    { isFeatured, priority }
  );
  return response.data.data?.product;
}

export async function updateAdminProductFeaturedPriority(
  productId: string,
  priority: number
) {
  const response = await api.patch<ApiResponse<{ product: import("@/types/marketplace").ProductItem }>>(
    `/api/v1/products/admin/${productId}/featured-priority`,
    { priority }
  );
  return response.data.data?.product;
}

