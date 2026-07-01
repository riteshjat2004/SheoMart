"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/services/product";
import type { ProductItem } from "@/types/marketplace";

export function useProducts() {
  return useQuery<ProductItem[], Error>({
    queryKey: ["products"],
    queryFn: async () => fetchProducts(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
