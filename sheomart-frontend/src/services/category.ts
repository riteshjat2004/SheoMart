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

export async function fetchCategoryById(categoryId: string) {
  const response = await api.get<ApiResponse<GetCategoryResponse>>(`/api/v1/categories/${categoryId}`);
  return response.data.data?.category ?? null;
}
