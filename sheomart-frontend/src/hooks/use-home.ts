"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchHeroCarousel, fetchTrendingProducts, type HeroShowcaseItem, type HomeLocationParams } from "@/services/home";
import type { ProductItem } from "@/types/marketplace";

export function useHeroCarousel(params?: HomeLocationParams) {
  return useQuery<HeroShowcaseItem[], Error>({
    queryKey: ["hero-carousel", params?.pincode ?? null, params?.city ?? null],
    queryFn: () => fetchHeroCarousel(params),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export const useHeroShowcase = useHeroCarousel;

export function useTrendingProducts(params?: HomeLocationParams) {
  return useQuery<ProductItem[], Error>({
    queryKey: ["trending-products", params?.pincode ?? null, params?.city ?? null],
    queryFn: () => fetchTrendingProducts(params),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
