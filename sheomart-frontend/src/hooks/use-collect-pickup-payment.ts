"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  confirmOrderPayment,
  collectPickupPayment,
  type PaymentReceivedMethod,
  type PickupPaymentMethod,
} from "@/services/store-orders";
import type { StoreOrder } from "@/types/store-order";

export interface ConfirmOrderPaymentVariables {
  orderId: string;
  paymentMethod: PaymentReceivedMethod;
}

export type CollectPickupPaymentVariables = ConfirmOrderPaymentVariables;

export function useConfirmOrderPayment(options?: {
  onSuccess?: (data: StoreOrder | null, variables: ConfirmOrderPaymentVariables) => void;
  onError?: (error: unknown, variables: ConfirmOrderPaymentVariables) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, paymentMethod }: ConfirmOrderPaymentVariables) =>
      confirmOrderPayment(orderId, paymentMethod),
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["store-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["store-order", variables.orderId] });
      void queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["order-details"] });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
}

export const useCollectPickupPayment = useConfirmOrderPayment;
export const useMarkPaymentReceived = useConfirmOrderPayment;