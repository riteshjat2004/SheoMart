"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { useCart, useAddCartItem } from "@/hooks/use-cart";
import { useCartConflictStore } from "@/store/cart-conflict-store";
import { usePincodeMismatchStore } from "@/store/pincode-mismatch-store";
import { useCustomerLocation } from "@/hooks/use-customer-location";
import { fetchStoreById } from "@/services/store";
import type { ProductItem, ProductVariant, StoreItem } from "@/types/marketplace";
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
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const cartQuery = useCart();
  const addCartItemMutation = useAddCartItem();
  const { openConflict } = useCartConflictStore();
  const { openMismatch } = usePincodeMismatchStore();
  const { activePincode } = useCustomerLocation();

  const addItem = async ({
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
    let targetStoreName = product.storeName || "";
    let targetStorePin = product.storePincode?.trim() || "";

    // Resolve target store details if not yet on product
    if (targetStoreId && (!targetStoreName || !targetStorePin)) {
      const cached = queryClient.getQueryData<StoreItem>(["store", targetStoreId]);
      if (cached) {
        if (!targetStoreName) targetStoreName = cached.storeName || cached.name || "";
        if (!targetStorePin) targetStorePin = cached.pincode?.trim() || "";
      }
      if (!targetStoreName || !targetStorePin) {
        try {
          const fetched = await fetchStoreById(targetStoreId);
          if (fetched) {
            if (!targetStoreName) targetStoreName = fetched.storeName || fetched.name || "";
            if (!targetStorePin) targetStorePin = fetched.pincode?.trim() || "";
          }
        } catch {
          // Ignore network failure and continue with fallbacks
        }
      }
    }

    if (!targetStoreName) {
      targetStoreName = "the new store";
    }

    const payload: AddCartItemPayload = {
      productId: product.productId,
      storeId: targetStoreId || undefined,
      customerPincode: activePincode || undefined,
      quantity,
      variantId: variant?.variantId || undefined,
      variantLabel: variant?.label || undefined,
    };

    // 2-Step Verification (Step 1: Frontend Guard): Block out-of-zone cart addition
    if (activePincode && targetStorePin && activePincode.trim() !== targetStorePin) {
      openMismatch({
        customerPincode: activePincode.trim(),
        storePincode: targetStorePin,
        storeName: targetStoreName !== "the new store" ? targetStoreName : undefined,
        productName: product.name,
        payload,
        onSuccess,
      });
      return;
    }

    // Check if cart already has items from a different store
    const cartItems = cartQuery.data?.cartItems || [];
    if (cartItems.length > 0 && targetStoreId) {
      const firstItem = cartItems[0];
      const existingStoreId = firstItem.product?.storeId || firstItem.storeId;

      if (existingStoreId && existingStoreId !== targetStoreId) {
        // Resolve existingStoreName accurately
        let existingStoreName =
          firstItem.product?.storeName ||
          firstItem.storeName ||
          "";

        if (!existingStoreName && existingStoreId) {
          const cached = queryClient.getQueryData<StoreItem>(["store", existingStoreId]);
          if (cached) {
            existingStoreName = cached.storeName || cached.name || "";
          }
        }

        if (!existingStoreName && existingStoreId) {
          try {
            const fetched = await fetchStoreById(existingStoreId);
            if (fetched) {
              existingStoreName = fetched.storeName || fetched.name || "";
            }
          } catch {
            // Ignore failure
          }
        }

        if (!existingStoreName) {
          existingStoreName = "your current store";
        }

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
        const message = error.message || "";

        // Fallback: If backend returns PIN mismatch error, trigger the mismatch modal
        if (message.includes("only serves PIN") || message.includes("location is set to PIN")) {
          if (targetStorePin && activePincode) {
            openMismatch({
              customerPincode: activePincode.trim(),
              storePincode: targetStorePin,
              storeName: targetStoreName !== "the new store" ? targetStoreName : undefined,
              productName: product.name,
              payload,
              onSuccess,
            });
            return;
          }
        }

        // Fallback: If backend returns 409 conflict, also trigger the modal
        if (message.includes("Cart can contain products from only one store") || message.includes("already contains items from")) {
          const match = message.match(/already contains items from (.*?)\. Do you want to clear your cart and start adding items from (.*?)\?/i);
          const parsedExisting = match ? match[1] : undefined;
          const parsedNew = match ? match[2] : undefined;

          const firstItem = cartItems[0];
          const existingStoreName =
            parsedExisting ||
            firstItem?.product?.storeName ||
            firstItem?.storeName ||
            "your current store";

          openConflict({
            existingStoreName,
            newStoreName: parsedNew || targetStoreName,
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
