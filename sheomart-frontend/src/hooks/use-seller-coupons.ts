"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchSellerCoupons,
  fetchSellerCouponSummary,
  fetchSellerCouponAnalytics,
  fetchSellerCouponRedemptions,
  fetchSellerCoupon,
  createSellerCoupon,
  updateSellerCoupon,
  updateSellerCouponStatus,
  deleteSellerCoupon,
  duplicateSellerCoupon,
  bulkSellerCouponAction,
} from "@/services/seller-coupons";
import type {
  SellerCouponFilters,
  CreateSellerCouponPayload,
  UpdateSellerCouponPayload,
} from "@/types/seller-coupon";

const COUPONS_KEY = ["seller-coupons"];
const SUMMARY_KEY = ["seller-coupons-summary"];
const ANALYTICS_KEY = ["seller-coupons-analytics"];
const REDEMPTIONS_KEY = ["seller-coupons-redemptions"];

export function useSellerCoupons(filters: SellerCouponFilters) {
  return useQuery({
    queryKey: [...COUPONS_KEY, filters],
    queryFn: () => fetchSellerCoupons(filters),
    staleTime: 1000 * 30,
  });
}

export function useSellerCouponSummary() {
  return useQuery({
    queryKey: SUMMARY_KEY,
    queryFn: fetchSellerCouponSummary,
    staleTime: 1000 * 45,
  });
}

export function useSellerCouponAnalytics() {
  return useQuery({
    queryKey: ANALYTICS_KEY,
    queryFn: fetchSellerCouponAnalytics,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSellerCouponRedemptions(filters?: {
  page?: number;
  limit?: number;
  couponCode?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [...REDEMPTIONS_KEY, filters],
    queryFn: () => fetchSellerCouponRedemptions(filters),
    staleTime: 1000 * 30,
  });
}

export function useSellerCoupon(couponId: string | null) {
  return useQuery({
    queryKey: ["seller-coupon", couponId],
    queryFn: () => fetchSellerCoupon(couponId as string),
    enabled: Boolean(couponId),
    staleTime: 1000 * 30,
  });
}

export function useCreateSellerCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSellerCouponPayload) => createSellerCoupon(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_KEY });
      queryClient.invalidateQueries({ queryKey: SUMMARY_KEY });
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEY });
    },
  });
}

export function useUpdateSellerCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      couponId,
      payload,
    }: {
      couponId: string;
      payload: UpdateSellerCouponPayload;
    }) => updateSellerCoupon(couponId, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: COUPONS_KEY });
      queryClient.invalidateQueries({ queryKey: ["seller-coupon", vars.couponId] });
      queryClient.invalidateQueries({ queryKey: SUMMARY_KEY });
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEY });
    },
  });
}

export function useUpdateSellerCouponStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      couponId,
      isActive,
    }: {
      couponId: string;
      isActive: boolean;
    }) => updateSellerCouponStatus(couponId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_KEY });
      queryClient.invalidateQueries({ queryKey: SUMMARY_KEY });
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEY });
    },
  });
}

export function useDeleteSellerCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (couponId: string) => deleteSellerCoupon(couponId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_KEY });
      queryClient.invalidateQueries({ queryKey: SUMMARY_KEY });
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEY });
    },
  });
}

export function useDuplicateSellerCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (couponId: string) => duplicateSellerCoupon(couponId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_KEY });
      queryClient.invalidateQueries({ queryKey: SUMMARY_KEY });
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEY });
    },
  });
}

export function useBulkSellerCouponAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      action,
      couponIds,
    }: {
      action: "activate" | "deactivate" | "delete";
      couponIds: string[];
    }) => bulkSellerCouponAction(action, couponIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_KEY });
      queryClient.invalidateQueries({ queryKey: SUMMARY_KEY });
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEY });
    },
  });
}
