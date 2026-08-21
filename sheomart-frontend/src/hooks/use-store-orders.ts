"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStoreOrders } from "@/services/store-orders";
import type { StoreOrderFilters, StoreOrdersResponse } from "@/types/store-order";

export function useStoreOrders(filters: StoreOrderFilters) {
  return useQuery<StoreOrdersResponse, Error>({ queryKey: ["store-orders", filters], queryFn: () => fetchStoreOrders(filters), staleTime: 1000 * 30, retry: 1, refetchOnWindowFocus: false });
}