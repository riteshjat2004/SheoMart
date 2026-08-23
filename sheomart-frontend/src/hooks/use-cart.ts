"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addCartItem, clearCart, fetchCart, removeCartItem, updateCartItem, type CartMutationResponse } from "@/services/cart";
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
  return useMutation<{ cartItem?: CartItem; cart: CartResponse }, Error, { productId: string; storeId?: string; quantity?: number }, { previousCount?: number; previousCart?: CartResponse }>({
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
  return useMutation<CartMutationResponse, Error, { cartItemId: string; quantity: number }, { previousCart?: CartResponse; previousCount?: number }>({
    mutationFn: (payload) => updateCartItem(payload.cartItemId, { quantity: payload.quantity }),
    onMutate: async ({ cartItemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      await queryClient.cancelQueries({ queryKey: ["cart-count"] });
      const previousCart = queryClient.getQueryData<CartResponse>(["cart"]);
      const previousCount = queryClient.getQueryData<number>(["cart-count"]);
      if (previousCart) {
        const item = previousCart.cartItems.find((cartItem) => cartItem.cartItemId === cartItemId);
        if (item) {
          const quantityDelta = quantity - item.quantity;
          queryClient.setQueryData<CartResponse>(["cart"], {
            ...previousCart,
            cartItems: previousCart.cartItems.map((cartItem) => cartItem.cartItemId === cartItemId ? { ...cartItem, quantity } : cartItem),
            summary: { ...previousCart.summary, totalItems: previousCart.summary.totalItems + quantityDelta, subtotal: previousCart.summary.subtotal + (item.product.discountPrice ?? item.product.price) * quantityDelta, estimatedSavings: previousCart.summary.estimatedSavings + Math.max(0, item.product.price - (item.product.discountPrice ?? item.product.price)) * quantityDelta },
          });
        }
      }
      if (previousCount !== undefined) queryClient.setQueryData(["cart-count"], previousCount + quantity - (previousCart?.cartItems.find((item) => item.cartItemId === cartItemId)?.quantity ?? quantity));
      return { previousCart, previousCount };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCart) queryClient.setQueryData(["cart"], context.previousCart);
      if (context?.previousCount !== undefined) queryClient.setQueryData(["cart-count"], context.previousCount);
    },
    onSuccess: (result) => {
      queryClient.setQueryData(["cart"], result.cart);
      queryClient.setQueryData(["cart-count"], result.cart.summary.totalItems);
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
      void queryClient.invalidateQueries({ queryKey: ["cart-count"] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation<CartMutationResponse, Error, string, { previousCart?: CartResponse; previousCount?: number }>({
    mutationFn: removeCartItem,
    onMutate: async (cartItemId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      await queryClient.cancelQueries({ queryKey: ["cart-count"] });
      const previousCart = queryClient.getQueryData<CartResponse>(["cart"]);
      const previousCount = queryClient.getQueryData<number>(["cart-count"]);
      const item = previousCart?.cartItems.find((cartItem) => cartItem.cartItemId === cartItemId);
      if (previousCart && item) {
        queryClient.setQueryData<CartResponse>(["cart"], {
          ...previousCart,
          cartItems: previousCart.cartItems.filter((cartItem) => cartItem.cartItemId !== cartItemId),
          summary: {
            ...previousCart.summary,
            totalItems: previousCart.summary.totalItems - item.quantity,
            totalProducts: previousCart.summary.totalProducts - 1,
            subtotal: previousCart.summary.subtotal - (item.product.discountPrice ?? item.product.price) * item.quantity,
            estimatedSavings: previousCart.summary.estimatedSavings - Math.max(0, item.product.price - (item.product.discountPrice ?? item.product.price)) * item.quantity,
          },
        });
      }
      if (previousCount !== undefined && item) queryClient.setQueryData(["cart-count"], previousCount - item.quantity);
      return { previousCart, previousCount };
    },
    onError: (_error, _cartItemId, context) => {
      if (context?.previousCart) queryClient.setQueryData(["cart"], context.previousCart);
      if (context?.previousCount !== undefined) queryClient.setQueryData(["cart-count"], context.previousCount);
    },
    onSuccess: (result) => {
      queryClient.setQueryData(["cart"], result.cart);
      queryClient.setQueryData(["cart-count"], result.cart.summary.totalItems);
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
      void queryClient.invalidateQueries({ queryKey: ["cart-count"] });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, void>({
    mutationFn: clearCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });
}
