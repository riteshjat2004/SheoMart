import api from "./api";
import type { ApiResponse } from "@/types/api";
import type { CategoryItem } from "@/types/marketplace";

export interface GetCategoriesResponse {
  categories: CategoryItem[];
}

export interface GetCategoryResponse {
  category: CategoryItem;
}

export async function fetchCategories() {
  const response = await api.get<ApiResponse<GetCategoriesResponse>>("/api/v1/categories");
  return response.data.data?.categories ?? [];
}

export async function fetchAdminCategories() {
  const response = await api.get<ApiResponse<GetCategoriesResponse>>("/api/v1/categories/admin");
  return response.data.data?.categories ?? [];
}

export async function fetchCategoryById(categoryId: string) {
  const response = await api.get<ApiResponse<GetCategoryResponse>>(`/api/v1/categories/${categoryId}`);
  return response.data.data?.category ?? null;
}

export async function createCategory(payload: FormData | Record<string, unknown>) {
  const response = await api.post<ApiResponse<GetCategoryResponse>>("/api/v1/categories", payload);
  return response.data.data?.category;
}

export async function updateCategory(categoryId: string, payload: FormData | Record<string, unknown>) {
  const response = await api.patch<ApiResponse<GetCategoryResponse>>(`/api/v1/categories/${categoryId}`, payload);
  return response.data.data?.category;
}

export async function deleteCategory(categoryId: string) {
  const response = await api.delete<ApiResponse<GetCategoryResponse>>(`/api/v1/categories/${categoryId}`);
  return response.data.data?.category;
}

export async function restoreCategory(categoryId: string) {
  const response = await api.patch<ApiResponse<GetCategoryResponse>>(`/api/v1/categories/${categoryId}/restore`);
  return response.data.data?.category;
}

export async function updateCategoryStatus(categoryId: string, isActive: boolean) {
  const response = await api.patch<ApiResponse<GetCategoryResponse>>(`/api/v1/categories/${categoryId}/status`, { isActive });
  return response.data.data?.category;
}
