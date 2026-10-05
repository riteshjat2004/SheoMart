import api from "./api";
import type { ApiResponse } from "@/types/api";
import type { ProductItem } from "@/types/marketplace";

export interface GetProductsResponse {
  products: ProductItem[];
}

export interface SubmitReviewPayload {
  rating: number;
  title?: string;
  comment?: string;
}

export interface ReviewResponse {
  reviewId: string;
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  createdAt: string;
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

export async function submitProductReview(
  productId: string,
  payload: SubmitReviewPayload
): Promise<ReviewResponse> {
  const response = await api.post<ApiResponse<ReviewResponse>>(
    `/api/v1/products/${productId}/reviews`,
    payload
  );
  if (!response.data.data) throw new Error("Failed to submit review");
  return response.data.data;
}

export async function createStoreProduct(payload: FormData | Record<string, unknown>) {
  const response = await api.post<ApiResponse<{ product: ProductItem }>>("/api/v1/products", payload);
  return response.data.data?.product;
}

export async function updateStoreProduct(productId: string, payload: FormData | Record<string, unknown>) {
  const response = await api.patch<ApiResponse<{ product: ProductItem }>>(`/api/v1/products/${productId}`, payload);
  return response.data.data?.product;
}

export async function deleteStoreProduct(productId: string) {
  const response = await api.delete<ApiResponse<{ product: ProductItem }>>(`/api/v1/products/${productId}`);
  return response.data.data?.product;
}

export async function updateStoreProductStatus(productId: string, isActive: boolean) {
  const response = await api.patch<ApiResponse<{ product: ProductItem }>>(`/api/v1/products/${productId}/status`, { isActive });
  return response.data.data?.product;
}

export async function duplicateStoreProduct(productId: string) {
  const response = await api.post<ApiResponse<{ product: ProductItem }>>(`/api/v1/products/${productId}/duplicate`);
  return response.data.data?.product;
}

export interface CloneProductsToStorePayload {
  targetStoreId: string;
  productIds: string[];
  defaultStock?: number;
  isPublished?: boolean;
}

export interface CloneProductsToStoreResult {
  clonedCount: number;
  skippedCount?: number;
  skippedProducts?: string[];
  products?: ProductItem[];
}

export interface StoreExistingProductsResponse {
  storeId: string;
  totalCount: number;
  existingProducts: Array<{
    productId: string;
    name: string;
    sku: string;
    sourceProductId?: string | null;
  }>;
  existingSourceProductIds: string[];
  existingNames: string[];
  existingCleanSkus: string[];
}

export async function fetchStoreExistingProducts(storeId: string): Promise<StoreExistingProductsResponse> {
  const response = await api.get<ApiResponse<StoreExistingProductsResponse>>(
    `/api/v1/products/admin/store/${storeId}/existing-products`
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to fetch existing products for store");
  }
  return response.data.data;
}

export async function cloneProductsToStore(payload: CloneProductsToStorePayload): Promise<CloneProductsToStoreResult> {
  const response = await api.post<ApiResponse<CloneProductsToStoreResult>>(
    "/api/v1/products/admin/clone-to-store",
    payload
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to clone products to store");
  }
  return response.data.data;
}

export interface MasterCatalogProduct extends ProductItem {
  isAlreadyInStore?: boolean;
  totalStoreCopies?: number;
}

export interface MasterCatalogResponse {
  products: MasterCatalogProduct[];
  totalCount: number;
  availableCount: number;
  inStoreCount: number;
}

export async function fetchMasterCatalog(params?: {
  targetStoreId?: string;
  search?: string;
  categoryId?: string;
}): Promise<MasterCatalogResponse> {
  const response = await api.get<ApiResponse<MasterCatalogResponse>>(
    "/api/v1/products/admin/master-catalog",
    {
      params: {
        targetStoreId: params?.targetStoreId || undefined,
        search: params?.search?.trim() || undefined,
        categoryId: params?.categoryId && params.categoryId !== "all" ? params.categoryId : undefined,
      },
    }
  );
  return (
    response.data.data ?? {
      products: [],
      totalCount: 0,
      availableCount: 0,
      inStoreCount: 0,
    }
  );
}




