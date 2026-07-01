import api from "./api";
import type { ApiResponse } from "@/types/api";
import type { ProductItem } from "@/types/marketplace";

export interface GetProductsResponse {
  products: ProductItem[];
}

export async function fetchProducts() {
  const response = await api.get<ApiResponse<GetProductsResponse>>("/api/v1/products");
  return response.data.data?.products ?? [];
}
