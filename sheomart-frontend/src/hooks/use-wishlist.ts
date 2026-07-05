"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addWishlistItem, fetchWishlist, removeWishlistItem } from "@/services/wishlist";
import type { WishlistItem } from "@/types/marketplace";

export function useWishlist() {
  return useQuery<WishlistItem[], Error>({
    queryKey: ["wishlist"],
    queryFn: fetchWishlist,
    staleTime: 1000 * 60 * 2,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useAddWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation<WishlistItem | undefined, Error, { productId: string }>({
    mutationFn: addWishlistItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}

export function useRemoveWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation<WishlistItem | undefined, Error, string>({
    mutationFn: removeWishlistItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}
