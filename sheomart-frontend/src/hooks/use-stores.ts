"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStores, type StoreLocation } from "@/services/store";
import type { StoreItem } from "@/types/marketplace";

export function useStores(location?: StoreLocation) {
  return useQuery<StoreItem[], Error>({
    queryKey: ["stores", location],
    queryFn: async () => fetchStores(location),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
