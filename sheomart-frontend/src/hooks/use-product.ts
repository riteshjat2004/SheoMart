"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProductById } from "@/services/product";
import type { ProductItem } from "@/types/marketplace";

export function useProduct(productId?: string, storeId?: string) {
  return useQuery<ProductItem | null, Error>({
    queryKey: ["product", productId, storeId],
    queryFn: async () => (productId ? fetchProductById(productId, storeId) : null),
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 2,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
