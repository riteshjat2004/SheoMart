import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminReviews,
  fetchAdminReviewStats,
  fetchAdminReviewDetails,
  moderateAdminReview,
  softDeleteAdminReview,
  restoreAdminReview,
  flagAdminReview,
  bulkAdminReviewAction,
} from "@/services/admin-reviews";
import type { AdminReviewFilters, ReviewStatus } from "@/types/admin-review";

export function useAdminReviews(filters: AdminReviewFilters) {
  return useQuery({
    queryKey: ["admin-reviews", filters],
    queryFn: () => fetchAdminReviews(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminReviewStats() {
  return useQuery({
    queryKey: ["admin-reviews-stats"],
    queryFn: () => fetchAdminReviewStats(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminReviewDetails(reviewId?: string | null) {
  return useQuery({
    queryKey: ["admin-review-details", reviewId],
    queryFn: () => (reviewId ? fetchAdminReviewDetails(reviewId) : null),
    enabled: Boolean(reviewId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useModerateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, status, reason }: { reviewId: string; status: ReviewStatus; reason?: string }) =>
      moderateAdminReview(reviewId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-review-details"] });
    },
  });
}

export function useSoftDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => softDeleteAdminReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-review-details"] });
    },
  });
}

export function useRestoreReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => restoreAdminReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-review-details"] });
    },
  });
}

export function useFlagReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, type }: { reviewId: string; type: "spam" | "abuse" }) =>
      flagAdminReview(reviewId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-review-details"] });
    },
  });
}

export function useBulkReviewAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reviewIds,
      action,
      reason,
    }: {
      reviewIds: string[];
      action: "approve" | "reject" | "hide" | "unhide" | "delete" | "restore" | "mark_spam" | "mark_abuse";
      reason?: string;
    }) => bulkAdminReviewAction(reviewIds, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-review-details"] });
    },
  });
}
