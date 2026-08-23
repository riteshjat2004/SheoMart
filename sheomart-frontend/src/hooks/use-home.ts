"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchHeroCarousel, fetchTrendingProducts, type HeroShowcaseItem } from "@/services/home";
import type { ProductItem } from "@/types/marketplace";

export function useHeroCarousel() {
  return useQuery<HeroShowcaseItem[], Error>({
    queryKey: ["hero-carousel"],
    queryFn: fetchHeroCarousel,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export const useHeroShowcase = useHeroCarousel;

export function useTrendingProducts() {
  return useQuery<ProductItem[], Error>({
    queryKey: ["trending-products"],
    queryFn: fetchTrendingProducts,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
