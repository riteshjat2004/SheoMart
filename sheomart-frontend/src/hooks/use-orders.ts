"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelCustomerOrder, fetchOrders, rateOrder } from "@/services/orders";
import type { OrderRecord } from "@/services/orders";

export function useOrders() {
  return useQuery<OrderRecord[], Error>({
    queryKey: ["customer-orders"],
    queryFn: fetchOrders,
    staleTime: 1000 * 30,
    retry: 1,
    refetchOnWindowFocus: true,
  });
}

export function useCancelCustomerOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      cancelCustomerOrder(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
    },
  });
}

export function useRateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, rating, comment }: { orderId: string; rating: number; comment?: string }) =>
      rateOrder(orderId, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
    },
  });
}

