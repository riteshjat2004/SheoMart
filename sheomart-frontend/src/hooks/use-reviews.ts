"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProductReview,
  deleteProductReview,
  fetchMyReviews,
  fetchProductReviews,
  updateProductReview,
  type CreateReviewPayload,
  type CustomerReview,
} from "@/services/reviews";

export function useProductReviews(productId?: string) {
  return useQuery<CustomerReview[], Error>({
    queryKey: ["product-reviews", productId],
    queryFn: () => (productId ? fetchProductReviews(productId) : Promise.resolve([])),
    enabled: Boolean(productId),
    staleTime: 1000 * 60,
  });
}

export function useMyReviews(enabled = true) {
  return useQuery<CustomerReview[], Error>({
    queryKey: ["my-reviews"],
    queryFn: fetchMyReviews,
    enabled,
    staleTime: 1000 * 60,
  });
}

export function useCreateProductReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: CreateReviewPayload }) =>
      createProductReview(productId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.productId] });
    },
  });
}

export function useUpdateProductReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: Partial<CreateReviewPayload>; productId?: string }) =>
      updateProductReview(reviewId, payload),
    onSuccess: (_data, variables) => {
      if (variables.productId) {
        queryClient.invalidateQueries({ queryKey: ["product-reviews", variables.productId] });
      }
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
    },
  });
}

export function useDeleteProductReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, productId }: { reviewId: string; productId?: string }) =>
      deleteProductReview(reviewId),
    onSuccess: (_data, variables) => {
      if (variables.productId) {
        queryClient.invalidateQueries({ queryKey: ["product-reviews", variables.productId] });
      }
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
    },
  });
}
