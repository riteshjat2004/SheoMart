"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchHeroCarousel,
  fetchTrendingProducts,
  fetchMarketplaceStats,
  fetchFeaturedReviews,
  type HeroShowcaseItem,
  type HomeLocationParams,
  type MarketplaceStats,
  type FeaturedReviewItem,
} from "@/services/home";
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

export function useMarketplaceStats() {
  return useQuery<MarketplaceStats, Error>({
    queryKey: ["marketplace-stats"],
    queryFn: fetchMarketplaceStats,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });
}

export function useFeaturedReviews(params?: HomeLocationParams) {
  return useQuery<FeaturedReviewItem[], Error>({
    queryKey: ["featured-reviews", params?.pincode ?? null, params?.city ?? null],
    queryFn: () => fetchFeaturedReviews(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });
}

