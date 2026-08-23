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
  return useMutation<{ cartItem?: CartItem; cart: CartResponse }, Error, { productId: string; quantity?: number }, { previousCount?: number; previousCart?: CartResponse }>({
    mutationFn: addCartItem,
    onMutate: async ({ quantity = 1 }) => {
      await queryClient.cancelQueries({ queryKey: ["cart-count"] });
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCount = queryClient.getQueryData<number>(["cart-count"]);
      const previousCart = queryClient.getQueryData<CartResponse>(["cart"]);
      if (previousCount !== undefined) {
        queryClient.setQueryData(["cart-count"], previousCount + quantity);
      }
      if (previousCart) {
        queryClient.setQueryData<CartResponse>(["cart"], {
          ...previousCart,
          summary: {
            ...previousCart.summary,
            totalItems: previousCart.summary.totalItems + quantity,
          },
        });
      }
      return { previousCount, previousCart };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(["cart-count"], context.previousCount);
      }
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData(["cart"], result.cart);
      queryClient.setQueryData(["cart-count"], result.cart.summary.totalItems);
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
      void queryClient.invalidateQueries({ queryKey: ["cart-count"] });
    },
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
