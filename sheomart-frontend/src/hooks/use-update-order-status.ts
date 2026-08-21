"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus } from "@/services/store-orders";

interface UpdateOrderStatusVariables {
  orderId: string;
  status: string;
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
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables);
    },
  });
}
