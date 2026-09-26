import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  AdminReview,
  AdminReviewFilters,
  AdminReviewListResponse,
  ReviewStats,
  ReviewStatus,
} from "@/types/admin-review";

export async function fetchAdminReviews(filters: AdminReviewFilters): Promise<AdminReviewListResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.productId) params.set("productId", filters.productId);
  if (filters.storeId) params.set("storeId", filters.storeId);
  if (filters.userId) params.set("userId", filters.userId);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (typeof filters.rating === "number") params.set("rating", String(filters.rating));
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (typeof filters.isVisible === "boolean") params.set("isVisible", String(filters.isVisible));
  if (typeof filters.isDeleted === "boolean") params.set("isDeleted", String(filters.isDeleted));
  if (typeof filters.isVerifiedPurchase === "boolean") params.set("isVerifiedPurchase", String(filters.isVerifiedPurchase));
  if (typeof filters.isReported === "boolean") params.set("isReported", String(filters.isReported));
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
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

export async function fetchAdminReviewStats(): Promise<ReviewStats> {
  const response = await api.get<ApiResponse<ReviewStats>>("/api/v1/reviews/admin/stats");
  return (
    response.data.data ?? {
      total: 0,
      averageRating: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      hidden: 0,
      reported: 0,
      deleted: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    }
  );
}

export async function fetchAdminReviewDetails(reviewId: string) {
  const response = await api.get<ApiResponse<{ review: AdminReview; reviewer: any; product: any; store: any }>>(
    `/api/v1/reviews/admin/${reviewId}`
  );
  return response.data.data;
}

export async function moderateAdminReview(
  reviewId: string,
  status: ReviewStatus,
  reason?: string
): Promise<AdminReview> {
  const response = await api.patch<ApiResponse<{ review: AdminReview }>>(
    `/api/v1/reviews/admin/${reviewId}/moderate`,
    { status, reason }
  );
  if (!response.data.data?.review) {
    throw new Error(response.data.message || "Failed to moderate review");
  }
  return response.data.data.review;
}

export async function softDeleteAdminReview(reviewId: string): Promise<void> {
  await api.delete<ApiResponse<unknown>>(`/api/v1/reviews/admin/${reviewId}`);
}

export async function restoreAdminReview(reviewId: string): Promise<AdminReview> {
  const response = await api.patch<ApiResponse<{ review: AdminReview }>>(
    `/api/v1/reviews/admin/${reviewId}/restore`,
    {}
  );
  if (!response.data.data?.review) {
    throw new Error(response.data.message || "Failed to restore review");
  }
  return response.data.data.review;
}

export async function flagAdminReview(reviewId: string, type: "spam" | "abuse"): Promise<AdminReview> {
  const response = await api.post<ApiResponse<{ review: AdminReview }>>(
    `/api/v1/reviews/admin/${reviewId}/flag`,
    { type }
  );
  if (!response.data.data?.review) {
    throw new Error(response.data.message || "Failed to flag review");
  }
  return response.data.data.review;
}

export async function bulkAdminReviewAction(
  reviewIds: string[],
  action: "approve" | "reject" | "hide" | "unhide" | "delete" | "restore" | "mark_spam" | "mark_abuse",
  reason?: string
): Promise<{ affectedCount: number; message: string }> {
  const response = await api.post<ApiResponse<{ action: string; affectedCount: number; message: string }>>(
    "/api/v1/reviews/admin/bulk-action",
    { reviewIds, action, reason }
  );
  return {
    affectedCount: response.data.data?.affectedCount ?? 0,
    message: response.data.data?.message || response.data.message || "Action executed",
  };
}

export async function updateAdminReviewVisibility(reviewId: string, isVisible: boolean) {
  const response = await api.patch<ApiResponse<{ review: { reviewId: string; isVisible: boolean } }>>(
    `/api/v1/reviews/${reviewId}/visibility`,
    { isVisible }
  );
  return response.data.data?.review ?? null;
}

