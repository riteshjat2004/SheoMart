"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/services/category";
import type { CategoryItem } from "@/types/marketplace";

export function useCategories() {
  return useQuery<CategoryItem[], Error>({
    queryKey: ["categories"],
    queryFn: async () => fetchCategories(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
