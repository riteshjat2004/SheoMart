import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { AdminReviewFilters, AdminReviewListResponse } from "@/types/admin-review";

export async function fetchAdminReviews(filters: AdminReviewFilters): Promise<AdminReviewListResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.productId) params.set("productId", filters.productId);
  if (filters.storeId) params.set("storeId", filters.storeId);
  if (filters.userId) params.set("userId", filters.userId);
  if (typeof filters.rating === "number") params.set("rating", String(filters.rating));
  if (typeof filters.isVisible === "boolean") params.set("isVisible", String(filters.isVisible));
  if (typeof filters.isDeleted === "boolean") params.set("isDeleted", String(filters.isDeleted));
  if (typeof filters.isVerifiedPurchase === "boolean") params.set("isVerifiedPurchase", String(filters.isVerifiedPurchase));
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

  const response = await api.get<ApiResponse<AdminReviewListResponse>>(`/api/v1/reviews/admin?${params.toString()}`);
  return response.data.data ?? {
    reviews: [],
    pagination: { page: filters.page, limit: filters.limit, total: 0, totalPages: 0 },
  };
}

export async function updateAdminReviewVisibility(reviewId: string, isVisible: boolean) {
  const response = await api.patch<ApiResponse<{ review: { reviewId: string; isVisible: boolean } }>>(`/api/v1/reviews/${reviewId}/visibility`, { isVisible });
  return response.data.data?.review ?? null;
}
