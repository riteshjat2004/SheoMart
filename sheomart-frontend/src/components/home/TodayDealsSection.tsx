"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, Clock, Ticket, Copy, Check, ArrowRight, Sparkles, Tag, Store, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { PromotionOfferCard } from "@/components/marketplace/PromotionOfferCard";
import type { CouponItem, OfferItem } from "@/services/promotions";

interface TodayDealsSectionProps {
  offers: OfferItem[];
  coupons: CouponItem[];
  categoryLookup: Map<string, { categoryId: string; name?: string; slug?: string }>;
}

export function TodayDealsSection({ offers, coupons, categoryLookup }: TodayDealsSectionProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 27, seconds: 18 });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // Fallback
    }
  };

  const visibleOffers = offers.slice(0, 4);
  const visibleCoupons = coupons.slice(0, 4);

  const formatDigits = (n: number) => n.toString().padStart(2, "0");

  return (
    <section className="space-y-6">
      {/* Top Header with Live Countdown Urgency Timer */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400">
            <Flame className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            Today's Fresh Deals
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl dark:text-white">
            Save more on daily essentials
          </h2>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Handpicked deals and active neighborhood coupons ready for instant checkout.
          </p>
        </div>

        {/* Live Countdown Badge */}
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-2 text-xs font-medium text-rose-800 backdrop-blur-sm self-start sm:self-auto dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300">
          <Clock className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          <span>Deals refresh in:</span>
          <div className="flex items-center gap-1 font-mono font-bold text-stone-900 text-sm dark:text-white">
            <span className="rounded bg-rose-100 px-1.5 py-0.5 dark:bg-rose-900/60">{formatDigits(timeLeft.hours)}</span>:
            <span className="rounded bg-rose-100 px-1.5 py-0.5 dark:bg-rose-900/60">{formatDigits(timeLeft.minutes)}</span>:
            <span className="rounded bg-rose-100 px-1.5 py-0.5 dark:bg-rose-900/60">{formatDigits(timeLeft.seconds)}</span>
          </div>
        </div>
      </div>

      {/* Coupon Preview Strip */}
      {visibleCoupons.length > 0 && (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {visibleCoupons.map((coupon) => {
            const isCopied = copiedCode === coupon.code;
            const isStoreCoupon = Boolean(coupon.storeId || coupon.applicableScope === "store");
            return (
              <div
                key={coupon.couponId}
                className="group relative flex flex-col justify-between rounded-2xl border border-dashed border-emerald-300/80 bg-gradient-to-br from-emerald-50/70 via-white to-stone-50/60 p-4 shadow-sm transition hover:border-emerald-500 hover:shadow-md dark:border-emerald-500/40 dark:from-emerald-950/50 dark:via-stone-900/80 dark:to-stone-900"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                      <Tag className="h-3 w-3" />
                      {coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">
                      Min: ₹{coupon.minimumCartValue || 0}
                    </span>
                  </div>

                  {/* Store vs Sitewide distinction pill */}
                  <div className="mt-2.5">
                    {isStoreCoupon ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/70 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300">
                        <Store className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
                        <span className="truncate">Store Exclusive • {coupon.storeName || "Store"}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-sky-300/70 bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-800 dark:border-sky-500/30 dark:bg-sky-950/40 dark:text-sky-300">
                        <Globe className="h-3 w-3 shrink-0 text-sky-600 dark:text-sky-400" />
                        <span>Sitewide (All Stores)</span>
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2.5 text-sm font-semibold text-stone-900 line-clamp-1 dark:text-white">
                    {coupon.title}
                  </h3>
                  <p className="mt-1 text-xs text-stone-600 line-clamp-1 dark:text-stone-400">
                    {coupon.description || "Applicable on your next order."}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-stone-200/80 pt-3 dark:border-stone-800/80">
                  <span className="font-mono text-xs font-bold tracking-wider text-emerald-700 dark:text-emerald-400">
                    {coupon.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(coupon.code)}
                    className="flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-600 hover:text-white dark:bg-emerald-600/30 dark:text-emerald-200 dark:hover:bg-emerald-500 dark:hover:text-white"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Render Active Promotional Offers */}
      {visibleOffers.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2 dark:text-white">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Store Special Promotions
            </h3>
            {offers.length > visibleOffers.length && (
              <Button asChild variant="outline" size="sm" className="h-8">
                <Link href="/offers">
                  View All Offers ({offers.length})
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {visibleOffers.map((offer) => (
              <PromotionOfferCard key={offer.offerId} offer={offer} categoryLookup={categoryLookup} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
