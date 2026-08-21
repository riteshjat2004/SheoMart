"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collectPickupPayment, type PickupPaymentMethod } from "@/services/store-orders";
import type { StoreOrder } from "@/types/store-order";

interface CollectPickupPaymentVariables {
  orderId: string;
  paymentMethod: PickupPaymentMethod;
}

export function useCollectPickupPayment(options?: {
  onSuccess?: (data: StoreOrder | null, variables: CollectPickupPaymentVariables) => void;
  onError?: (error: unknown, variables: CollectPickupPaymentVariables) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, paymentMethod }: CollectPickupPaymentVariables) => collectPickupPayment(orderId, paymentMethod),
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["store-orders"] });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
}