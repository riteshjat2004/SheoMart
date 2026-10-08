import api from "./api";
import type { ApiResponse } from "@/types/api";

export interface StoreReviewItem {
  _id: string;
  reviewId: string;
  productId: string;
  orderId?: string;
  storeId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isVisible: boolean;
  status: string;
  reportCount: number;
  sellerReply?: {
    comment: string;
    repliedAt: string;
    repliedBy?: string;
  };
  product?: {
    productId: string;
    name: string;
    thumbnail?: string;
    price: number;
  } | null;
  user?: {
    userId: string;
    name: string;
    email?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoreReviewsResponse {
  reviews: StoreReviewItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    averageRating: number;
    totalReviews: number;
    breakdown: Record<number, number>;
  };
}

export interface StoreReviewParams {
  page?: number;
  limit?: number;
  search?: string;
  rating?: number;
  status?: string;
  sortBy?: string;
}

export async function fetchStoreReviews(params?: StoreReviewParams) {
  const response = await api.get<ApiResponse<StoreReviewsResponse>>(
    "/api/v1/reviews/store/all",
    { params }
  );
  return response.data.data;
}

export async function replyToStoreReview(reviewId: string, comment: string) {
  const response = await api.post<ApiResponse<{ review: StoreReviewItem }>>(
    `/api/v1/reviews/${reviewId}/store-reply`,
    { comment }
  );
  return response.data.data?.review;
}

export async function reportStoreReview(reviewId: string, reason: string) {
  const response = await api.post<ApiResponse<{ review: StoreReviewItem }>>(
    `/api/v1/reviews/${reviewId}/store-report`,
    { reason }
  );
  return response.data.data?.review;
}
