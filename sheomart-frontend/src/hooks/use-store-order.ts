"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStoreOrder } from "@/services/store-orders";
import type { StoreOrder } from "@/types/store-order";

export function useStoreOrder(orderId: string) {
  return useQuery<StoreOrder | null, Error>({
    queryKey: ["store-order", orderId],
    queryFn: () => fetchStoreOrder(orderId),
    enabled: Boolean(orderId),
    staleTime: 1000 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}