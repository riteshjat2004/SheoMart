"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, Crown, Sparkles, Tag, TicketPercent, Calendar } from "lucide-react";
import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { StoreItem } from "@/types/marketplace";
import { royalTheme } from "./royalTheme";

interface SellerCouponData {
  couponId: string;
  code: string;
  title: string;
  description?: string;
  discountType: "flat" | "percentage";
  discountValue: number;
  minimumCartValue?: number;
  maximumDiscount?: number | null;
  endsAt: string;
  isActive: boolean;
  storeId?: string | null;
}

interface RoyalCouponWalletProps {
  store?: StoreItem;
}

export function RoyalCouponWallet({ store }: RoyalCouponWalletProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const storeName = store?.storeName ?? store?.name ?? "Royal Store";

  // Fetch active store coupons directly linked to this seller's store
  const couponsQuery = useQuery({
    queryKey: ["active-coupons-royal", store?.storeId],
    queryFn: async () => {
      if (!store?.storeId) return [];
      try {
        const res = await api.get<ApiResponse<{ coupons: SellerCouponData[] }>>(
          `/api/v1/promotions/coupons/active?storeId=${encodeURIComponent(store.storeId)}`
        );
        return res.data.data?.coupons ?? [];
      } catch {
        return [];
      }
    },
    enabled: Boolean(store?.storeId),
    staleTime: 1000 * 60 * 5,
  });

  const rawCoupons = couponsQuery.data || [];
  // Ensure we only display active coupons belonging to this specific store
  const storeCoupons = rawCoupons.filter(
    (c) => c.isActive !== false && c.storeId === store?.storeId
  );

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(null), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <section className="space-y-4" aria-labelledby="royal-coupons-heading">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${royalTheme.accent}`}>
            <Crown className="h-3.5 w-3.5" />
            Royal Vouchers & Privileges
          </p>
          <h2 id="royal-coupons-heading" className={`mt-1 text-2xl font-bold tracking-tight ${royalTheme.panelText}`}>
            Exclusive Flagship Savings
          </h2>
        </div>
        {storeCoupons.length > 0 && (
          <p className="text-xs text-amber-900/70 dark:text-amber-200/70 font-medium">
            Copy code to apply during checkout
          </p>
        )}
      </div>

      {couponsQuery.isLoading ? (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-3xl border border-amber-200/50 bg-amber-50/40 p-5 dark:border-amber-400/20 dark:bg-stone-900/40"
            />
          ))}
        </div>
      ) : storeCoupons.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-amber-300/60 bg-amber-50/30 p-8 text-center dark:border-amber-400/20 dark:bg-stone-900/30">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100/80 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
            <TicketPercent className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-base font-bold text-stone-900 dark:text-stone-100">
            No Active Store Vouchers
          </h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-stone-600 dark:text-stone-400">
            There are currently no store coupons published by {storeName}. Check back soon for exclusive seller promotions and seasonal savings.
          </p>
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {storeCoupons.map((coupon) => {
            const isCopied = copiedCode === coupon.code;
            const discountLabel =
              coupon.discountType === "percentage"
                ? `${coupon.discountValue}% OFF`
                : `₹${coupon.discountValue} OFF`;
            const minCartLabel = coupon.minimumCartValue
              ? `Orders above ₹${coupon.minimumCartValue}`
              : "Valid on all store items";
            const expiresLabel = coupon.endsAt
              ? `Expires ${new Date(coupon.endsAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}`
              : null;

            return (
              <article
                key={coupon.code}
                className={`relative flex flex-col justify-between rounded-3xl border border-amber-300/80 p-5 shadow-sm shadow-amber-500/10 dark:border-amber-400/40 dark:shadow-black/40 transition-all duration-200 ${royalTheme.panel} ${royalTheme.hover}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-black tracking-wide text-amber-950 dark:border-amber-400/50 dark:bg-stone-900 dark:text-amber-300">
                      <TicketPercent className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      {discountLabel}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopy(coupon.code)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
                        isCopied
                          ? "bg-emerald-600 text-white"
                          : "border border-amber-300 bg-white hover:border-amber-400 hover:bg-amber-50 text-amber-900 dark:border-amber-400/40 dark:bg-stone-900 dark:text-amber-200 dark:hover:bg-amber-400 dark:hover:text-stone-950"
                      }`}
                      aria-label={`Copy coupon code ${coupon.code}`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3 w-3" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> {coupon.code}
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-3.5">
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white leading-snug line-clamp-1">
                      {coupon.title}
                    </h4>
                    {coupon.description && (
                      <p className="mt-1 text-xs text-stone-600 dark:text-stone-400 line-clamp-2">
                        {coupon.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-200/40 dark:border-amber-400/20 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                      {minCartLabel}
                    </span>
                    {coupon.maximumDiscount && (
                      <span className="text-[10px] text-amber-800 dark:text-amber-300 font-medium">
                        Max ₹{coupon.maximumDiscount}
                      </span>
                    )}
                  </div>
                  {expiresLabel && (
                    <div className="flex items-center gap-1 text-[10px] text-stone-400 dark:text-stone-500">
                      <Calendar className="h-2.5 w-2.5" />
                      <span>{expiresLabel}</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
