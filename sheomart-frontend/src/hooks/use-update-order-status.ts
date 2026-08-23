"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus } from "@/services/store-orders";

interface UpdateOrderStatusVariables {
  orderId: string;
  status: "PREPARING" | "READY_FOR_PICKUP" | "PICKED_UP" | "CANCELLED";
}

export function useUpdateOrderStatus(options?: {
  onSuccess?: (data: Awaited<ReturnType<typeof updateOrderStatus>>, variables: UpdateOrderStatusVariables) => void;
  onError?: (error: unknown, variables: UpdateOrderStatusVariables) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: UpdateOrderStatusVariables) => updateOrderStatus(orderId, status),
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["store-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["store-order", variables.orderId] });
      await queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["order-details"] });
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables);
    },
  });
}
