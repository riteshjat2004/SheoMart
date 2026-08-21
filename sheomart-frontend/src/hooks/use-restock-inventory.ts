"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInventory } from "@/services/inventory";

interface RestockVariables {
  productId: string;
  currentQuantity: number;
  quantity: number;
  note?: string;
}

export function useRestockInventory(options?: { onSuccess?: () => void; onError?: (error: unknown) => void }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, currentQuantity, quantity }: RestockVariables) => updateInventory(productId, { availableQuantity: currentQuantity + quantity }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory-map"] }),
        queryClient.invalidateQueries({ queryKey: ["store-products"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-ledger"] }),
      ]);
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}