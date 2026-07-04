"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCategoryById } from "@/services/category";
import type { CategoryItem } from "@/types/marketplace";

export function useCategory(categoryId?: string) {
  return useQuery<CategoryItem | null, Error>({
    queryKey: ["category", categoryId],
    queryFn: async () => (categoryId ? fetchCategoryById(categoryId) : null),
    enabled: Boolean(categoryId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
