"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchHomepageCoupons, fetchHomepageOffers, type CouponItem, type OfferItem } from "@/services/promotions";

function isActivePromotion(item: { isActive: boolean; startsAt: string; endsAt: string }) {
  const now = Date.now();
  return item.isActive && new Date(item.startsAt).getTime() <= now && new Date(item.endsAt).getTime() >= now;
}

export function useOffers() {
  return useQuery<OfferItem[], Error>({
    queryKey: ["offers"],
    queryFn: fetchHomepageOffers,
    select: (offers) => offers.filter(isActivePromotion).sort((first, second) => second.priority - first.priority),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useCoupons() {
  return useQuery<CouponItem[], Error>({
    queryKey: ["coupons"],
    queryFn: fetchHomepageCoupons,
    select: (coupons) => coupons.filter(isActivePromotion).sort((first, second) => new Date(first.endsAt).getTime() - new Date(second.endsAt).getTime()),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
