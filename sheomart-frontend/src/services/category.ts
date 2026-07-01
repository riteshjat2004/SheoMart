import api from "./api";
import type { ApiResponse } from "@/types/api";
import type { CategoryItem } from "@/types/marketplace";

export interface GetCategoriesResponse {
  categories: CategoryItem[];
}

export async function fetchCategories() {
  const response = await api.get<ApiResponse<GetCategoriesResponse>>("/api/v1/categories");
  return response.data.data?.categories ?? [];
}
