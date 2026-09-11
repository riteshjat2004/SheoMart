"use client";

import { useState } from "react";
import { useCoupons } from "@/hooks/use-promotions";
import { PromotionCouponCard } from "@/components/marketplace/PromotionCouponCard";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";

export default function CouponsPage() {
  const [search, setSearch] = useState("");
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const couponsQuery = useCoupons();
  const coupons = (couponsQuery.data ?? []).filter((coupon) => !search.trim() || `${coupon.title} ${coupon.code}`.toLowerCase().includes(search.trim().toLowerCase()));
  const copyCoupon = async (code: string) => { await navigator.clipboard?.writeText(code); setCopiedCoupon(code); window.setTimeout(() => setCopiedCoupon(null), 1800); };

  return <PageWrapper><Section className="py-8 sm:py-10"><Container className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Basket savings</p><h1 className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-50">All Coupons</h1><p className="mt-2 text-stone-600 dark:text-stone-300">Save more with active SheoMart coupon codes.</p></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search coupons" className="min-h-11 w-full max-w-xl rounded-full border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900" />{couponsQuery.isLoading ? <LoadingSkeleton rows={4} /> : couponsQuery.isError ? <ErrorState message={couponsQuery.error.message} /> : coupons.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{coupons.map((coupon) => <PromotionCouponCard key={coupon.couponId} coupon={coupon} copied={copiedCoupon === coupon.code} onCopy={copyCoupon} />)}</div> : <EmptyState title="No active coupons" description="Check back soon for new savings." />}</Container></Section></PageWrapper>;
}
