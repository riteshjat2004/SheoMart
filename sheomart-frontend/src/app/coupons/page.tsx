"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Tag, Copy, Check, Sparkles, Clock, ArrowRight, Percent, Gift } from "lucide-react";
import { useCoupons } from "@/hooks/use-promotions";
import { PromotionCouponCard } from "@/components/marketplace/PromotionCouponCard";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";

export default function CouponsPage() {
  const [search, setSearch] = useState("");
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "sitewide" | "store_exclusive" | "first_order" | "percentage" | "flat">("all");

  const couponsQuery = useCoupons();
  const allCoupons = couponsQuery.data ?? [];

  const filteredCoupons = useMemo(() => {
    return allCoupons.filter((c) => {
      const isStoreCoupon = Boolean(c.storeId || c.applicableScope === "store");

      if (filterType === "sitewide" && isStoreCoupon) {
        return false;
      }
      if (filterType === "store_exclusive" && !isStoreCoupon) {
        return false;
      }
      if (filterType === "first_order" && !c.newUsersOnly && !c.code.includes("FIRST")) {
        return false;
      }
      if (filterType === "percentage" && c.discountType !== "percentage") {
        return false;
      }
      if (filterType === "flat" && c.discountType !== "flat") {
        return false;
      }

      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const matchesCode = c.code.toLowerCase().includes(query);
        const matchesTitle = c.title?.toLowerCase().includes(query);
        const matchesDesc = c.description?.toLowerCase().includes(query);
        const matchesStore = c.storeName?.toLowerCase().includes(query);
        if (!matchesCode && !matchesTitle && !matchesDesc && !matchesStore) return false;
      }

      return true;
    });
  }, [allCoupons, filterType, search]);

  const copyCoupon = async (code: string) => {
    await navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    window.setTimeout(() => setCopiedCoupon(null), 2000);
  };

  return (
    <PageWrapper>
      <Section className="space-y-6 py-6 sm:py-8 lg:py-10">
        <Container className="space-y-6">
          {/* Header Banner */}
          <div className="rounded-[2rem] border border-emerald-100 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-700 p-6 sm:p-8 text-white shadow-lg shadow-emerald-500/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  <Gift className="h-3.5 w-3.5" />
                  SheoMart Coupon Rewards Center
                </span>
                <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
                  Unlock Instant Grocery Discounts
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-emerald-50 max-w-xl">
                  Copy active coupon codes and apply them at checkout for instant savings across your
                  favorite local groceries.
                </p>
              </div>

              <Button asChild className="rounded-full bg-white text-emerald-900 hover:bg-stone-100">
                <Link href="/explore">
                  Start Shopping <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-stone-800 dark:bg-zinc-900">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: "all", label: "All Coupons" },
                { id: "sitewide", label: "🌐 Sitewide Deals" },
                { id: "store_exclusive", label: "🏪 Store Exclusive" },
                { id: "first_order", label: "First Order Deals" },
                { id: "percentage", label: "Percentage % Off" },
                { id: "flat", label: "Flat ₹ Off" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterType(tab.id as typeof filterType)}
                  className={`rounded-full px-3.5 py-1.5 font-semibold transition ${
                    filterType === tab.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-stone-50 text-stone-600 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coupon code or store..."
              className="w-full sm:w-64 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </div>

          {copiedCoupon && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-bold text-emerald-800 dark:border-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-300">
              Copied code &ldquo;{copiedCoupon}&rdquo; to clipboard! Paste it at checkout.
            </div>
          )}

          {/* Coupons Grid */}
          {couponsQuery.isLoading ? (
            <LoadingSkeleton rows={4} />
          ) : couponsQuery.isError ? (
            <ErrorState message={couponsQuery.error.message} />
          ) : filteredCoupons.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCoupons.map((coupon) => (
                <PromotionCouponCard
                  key={coupon.couponId}
                  coupon={coupon}
                  copied={copiedCoupon === coupon.code}
                  onCopy={copyCoupon}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No matching coupons available"
              description="Check back soon for upcoming holiday promotions and weekend grocery codes."
            />
          )}
        </Container>
      </Section>
    </PageWrapper>
  );
}
