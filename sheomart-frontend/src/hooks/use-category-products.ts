"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProductsByCategory } from "@/services/product";
import type { ProductItem } from "@/types/marketplace";

export function useCategoryProducts(categoryId?: string) {
  return useQuery<ProductItem[], Error>({
    queryKey: ["category-products", categoryId],
    queryFn: async () => (categoryId ? fetchProductsByCategory(categoryId) : []),
    enabled: Boolean(categoryId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
