"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useCart, useAddCartItem } from "@/hooks/use-cart";
import { useCartConflictStore } from "@/store/cart-conflict-store";
import type { ProductItem, ProductVariant } from "@/types/marketplace";
import type { AddCartItemPayload } from "@/services/cart";

interface AddItemOptions {
  product: ProductItem;
  variant?: ProductVariant | null;
  quantity?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useCartAction() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const cartQuery = useCart();
  const addCartItemMutation = useAddCartItem();
  const { openConflict } = useCartConflictStore();

  const addItem = ({
    product,
    variant,
    quantity = 1,
    onSuccess,
    onError,
  }: AddItemOptions) => {
    if (!product.productId) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const targetStoreId = product.storeId;
    const targetStoreName = product.storeName || "the new store";

    const payload: AddCartItemPayload = {
      productId: product.productId,
      storeId: targetStoreId || undefined,
      quantity,
      variantId: variant?.variantId || undefined,
      variantLabel: variant?.label || undefined,
    };

    // Check if cart already has items from a different store
    const cartItems = cartQuery.data?.cartItems || [];
    if (cartItems.length > 0 && targetStoreId) {
      const firstItem = cartItems[0];
      const existingStoreId = firstItem.product.storeId;
      const existingStoreName = firstItem.product.storeName || "your current store";

      if (existingStoreId && existingStoreId !== targetStoreId) {
        // Open instant confirmation popup to clear previous store's items
        openConflict({
          existingStoreName,
          newStoreName: targetStoreName,
          payload,
          onSuccess,
        });
        return;
      }
    }

    addCartItemMutation.mutate(payload, {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
      onError: (error) => {
        // Fallback: If backend returns 409 conflict, also trigger the modal
        const message = error.message || "";
        if (message.includes("Cart can contain products from only one store") || message.includes("already contains items from")) {
          const firstItem = cartItems[0];
          const existingStoreName = firstItem?.product?.storeName || "your current store";
          openConflict({
            existingStoreName,
            newStoreName: targetStoreName,
            payload,
            onSuccess,
          });
          return;
        }

        if (onError) onError(error);
      },
    });
  };

  return {
    addItem,
    isPending: addCartItemMutation.isPending,
  };
}
