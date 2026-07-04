"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStoreById } from "@/services/store";
import type { StoreItem } from "@/types/marketplace";

export function useStore(storeId?: string) {
  return useQuery<StoreItem | null, Error>({
    queryKey: ["store", storeId],
    queryFn: async () => (storeId ? fetchStoreById(storeId) : null),
    enabled: Boolean(storeId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
