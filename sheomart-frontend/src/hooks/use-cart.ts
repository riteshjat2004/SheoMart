"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addCartItem, clearCart, fetchCart, removeCartItem, updateCartItem } from "@/services/cart";
import type { CartResponse } from "@/services/cart";
import type { CartItem } from "@/types/marketplace";

export function useCart() {
  return useQuery<CartResponse, Error>({
    queryKey: ["cart"],
    queryFn: fetchCart,
    staleTime: 1000 * 60 * 2,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();
  return useMutation<CartItem | undefined, Error, { productId: string; quantity?: number }>({
    mutationFn: addCartItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation<CartItem | undefined, Error, { cartItemId: string; quantity: number }>({
    mutationFn: (payload) => updateCartItem(payload.cartItemId, { quantity: payload.quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation<CartItem | undefined, Error, string>({
    mutationFn: removeCartItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, void>({
    mutationFn: clearCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });
}
