"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchOrders } from "@/services/orders";
import type { OrderRecord } from "@/services/orders";

export function useOrders() {
  return useQuery<OrderRecord[], Error>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 2,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
