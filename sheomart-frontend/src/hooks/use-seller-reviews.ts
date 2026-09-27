import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchStoreReviews,
  replyToStoreReview,
  reportStoreReview,
  type StoreReviewParams,
  type StoreReviewsResponse,
} from "@/services/seller-reviews";

export function useStoreReviews(params?: StoreReviewParams) {
  return useQuery<StoreReviewsResponse | undefined>({
    queryKey: ["store-reviews", params],
    queryFn: () => fetchStoreReviews(params),
    staleTime: 1000 * 60 * 3,
  });
}

export function useReplyToStoreReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, comment }: { reviewId: string; comment: string }) =>
      replyToStoreReview(reviewId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-reviews"] });
    },
  });
}

export function useReportStoreReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, reason }: { reviewId: string; reason: string }) =>
      reportStoreReview(reviewId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-reviews"] });
    },
  });
}
