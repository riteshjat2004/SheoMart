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

export async function fetchProductById(productId: string, storeId?: string) {
  const response = await api.get<ApiResponse<{ product: ProductItem }>>(`/api/v1/products/${productId}`, { params: storeId ? { storeId } : undefined });
  return response.data.data?.product ?? null;
}

export async function fetchStoreProducts() {
  const response = await api.get<ApiResponse<GetProductsResponse>>("/api/v1/products/me");
  return response.data.data?.products ?? [];
}

export async function fetchProductsByCategory(categoryId: string) {
  const products = await fetchProducts();
  return products.filter((product) => product.categoryId === categoryId || product.category === categoryId);
}

export async function fetchProductsByStore(storeId: string) {
  const products = await fetchProducts();
  return products.filter((product) => product.storeId === storeId);
}
