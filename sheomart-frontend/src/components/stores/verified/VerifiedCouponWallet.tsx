"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, ShieldCheck, TicketPercent, Tag } from "lucide-react";
import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { StoreItem } from "@/types/marketplace";
import { verifiedTheme } from "@/themes/verifiedTheme";
import { VerifiedSectionHeader } from "./VerifiedSectionHeader";

interface VerifiedCoupon {
  code: string;
  discount: string;
  description: string;
  eligibility: string;
}

interface VerifiedCouponWalletProps {
  store?: StoreItem;
}

export function VerifiedCouponWallet({ store }: VerifiedCouponWalletProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const storeName = store?.storeName ?? store?.name ?? "Verified Store";
  const freeDeliveryThreshold = store?.freeDeliveryAbove ?? store?.freeDeliveryThreshold;

  // Fetch active marketplace/store coupons from promotions API
  const couponsQuery = useQuery({
    queryKey: ["active-coupons-verified", store?.storeId],
    queryFn: async () => {
      try {
        const res = await api.get<ApiResponse<{ coupons: any[] }>>("/api/v1/promotions/coupons/active");
        return res.data.data?.coupons ?? [];
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const rawCoupons = couponsQuery.data || [];
  const matchingCoupons: VerifiedCoupon[] = rawCoupons
    .filter(
      (c) =>
        c.isActive !== false &&
        (!c.storeId || c.storeId === store?.storeId || c.applicableScope === "marketplace")
    )
    .map((c) => ({
      code: c.code,
      discount: c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`,
      description: c.title || c.description || "Exclusive verified saving on grocery order",
      eligibility: c.minimumCartValue ? `Orders above ₹${c.minimumCartValue}` : "All grocery items",
    }));

  const defaultCoupons: VerifiedCoupon[] = [
    ...(freeDeliveryThreshold
      ? [
          {
            code: "FREELOCAL",
            discount: "FREE DELIVERY",
            description: `Complimentary doorstep delivery directly from ${storeName}`,
            eligibility: `Orders above ₹${freeDeliveryThreshold}`,
          },
        ]
      : []),
    {
      code: "VERIFIED10",
      discount: "10% OFF",
      description: `Welcome discount on fresh groceries from ${storeName}`,
      eligibility: "Valid for all registered shoppers",
    },
    {
      code: "SAVE100",
      discount: "₹100 OFF",
      description: "Instant discount on daily essentials & pantry staples",
      eligibility: "Orders above ₹699",
    },
    {
      code: "FRESHPACK",
      discount: "EXTRA 5%",
      description: "Special daily essentials bundle savings",
      eligibility: "Applicable on fresh produce & dairy",
    },
  ];

  const displayedCoupons = matchingCoupons.length ? matchingCoupons.slice(0, 4) : defaultCoupons;

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
    <section className="space-y-4" aria-labelledby="verified-coupons-heading">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <VerifiedSectionHeader
          icon={TicketPercent}
          title="Verified Coupon Wallet"
          subtitle="Exclusive verified store vouchers and savings for your basket."
        />
        <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
          Copy code to apply during checkout
        </p>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {displayedCoupons.map(({ code, discount, description, eligibility }) => {
          const isCopied = copiedCode === code;

          return (
            <article
              key={code}
              className={`relative flex flex-col justify-between rounded-3xl border border-emerald-200/80 p-5 shadow-xs transition-all duration-200 ${verifiedTheme.panel}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                  <TicketPercent className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  {discount}
                </span>

                <button
                  type="button"
                  onClick={() => handleCopy(code)}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
                    isCopied
                      ? "bg-emerald-600 text-white"
                      : "border border-emerald-300 bg-white hover:border-emerald-400 hover:bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-stone-900 dark:text-emerald-200 dark:hover:bg-emerald-900"
                  }`}
                  aria-label={`Copy coupon code ${code}`}
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3 w-3" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> {code}
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4">
                <p className="text-sm font-semibold text-stone-900 dark:text-white leading-snug">{description}</p>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
                  <Tag className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{eligibility}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
