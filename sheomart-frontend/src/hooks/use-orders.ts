"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchOrders } from "@/services/orders";
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
