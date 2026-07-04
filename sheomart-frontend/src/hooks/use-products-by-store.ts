"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProductsByStore } from "@/services/product";
import type { ProductItem } from "@/types/marketplace";

export function useProductsByStore(storeId?: string) {
  return useQuery<ProductItem[], Error>({
    queryKey: ["store-products", storeId],
    queryFn: async () => (storeId ? fetchProductsByStore(storeId) : []),
    enabled: Boolean(storeId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
