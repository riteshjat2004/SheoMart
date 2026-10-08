import api from "./api";
import type { ApiResponse } from "@/types/api";

export interface CustomerReview {
  reviewId: string;
  productId: string;
  orderId?: string;
  storeId?: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    userId?: string;
    name?: string;
    avatar?: string;
    isVerifiedCustomer?: boolean;
  } | null;
  sellerReply?: {
    comment: string;
    repliedAt?: string;
    repliedBy?: string;
  };
  product?: {
    productId: string;
    name: string;
    thumbnail: string;
    sku?: string;
    brand?: string;
    price?: number;
    discountPrice?: number;
  } | null;
  store?: {
    storeId?: string;
    storeName?: string;
    logo?: string;
    phone?: string;
    address?: string;
    city?: string;
  } | null;
}

export interface CreateReviewPayload {
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}

export async function fetchProductReviews(productId: string) {
  const response = await api.get<ApiResponse<{ product: unknown; reviews: CustomerReview[] }>>(
    `/api/v1/products/${productId}/reviews`
  );
  return response.data.data?.reviews ?? [];
}

export async function fetchMyReviews() {
  const response = await api.get<ApiResponse<{ reviews: CustomerReview[] }>>("/api/v1/reviews/me");
  return response.data.data?.reviews ?? [];
}

export async function createProductReview(productId: string, payload: CreateReviewPayload) {
  const response = await api.post<ApiResponse<{ review: CustomerReview }>>(
    `/api/v1/products/${productId}/reviews`,
    payload
  );
  return response.data.data?.review;
}

export async function updateProductReview(reviewId: string, payload: Partial<CreateReviewPayload>) {
  const response = await api.patch<ApiResponse<{ review: CustomerReview }>>(
    `/api/v1/reviews/${reviewId}`,
    payload
  );
  return response.data.data?.review;
}

export async function deleteProductReview(reviewId: string) {
  const response = await api.delete<ApiResponse<{ review: CustomerReview }>>(
    `/api/v1/reviews/${reviewId}`
  );
  return response.data.data?.review;
}
