"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStores } from "@/services/store";
import type { StoreItem } from "@/types/marketplace";

export function useStores() {
  return useQuery<StoreItem[], Error>({
    queryKey: ["stores"],
    queryFn: async () => fetchStores(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
