"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { PromotionOfferCard } from "@/components/marketplace/PromotionOfferCard";
import { PromotionCouponCard } from "@/components/marketplace/PromotionCouponCard";
import type { CouponItem, OfferItem } from "@/services/promotions";

export function HomepagePromotions({ offers, coupons, categoryLookup }: { offers: OfferItem[]; coupons: CouponItem[]; categoryLookup: Map<string, { categoryId: string; name?: string; slug?: string }> }) {
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const copyCoupon = async (code: string) => { await navigator.clipboard?.writeText(code); setCopiedCoupon(code); window.setTimeout(() => setCopiedCoupon(null), 1800); };
  const visibleOffers = offers.slice(0, 4);
  const visibleCoupons = coupons.slice(0, 3);

  return <>
    {offers.length ? <section className="space-y-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><SectionHeading eyebrow="Festival offers" title="Fresh savings from our stores" description="Live offers curated by the SheoMart team." />{offers.length > visibleOffers.length ? <Button asChild variant="outline" className="h-fit self-start sm:self-end"><Link href="/offers">View All ({offers.length})</Link></Button> : null}</div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{visibleOffers.map((offer) => <PromotionOfferCard key={offer.offerId} offer={offer} categoryLookup={categoryLookup} />)}</div></section> : null}
    {coupons.length ? <section className="space-y-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><SectionHeading eyebrow="Coupons" title="Extra savings for your basket" description="Copy a live code and apply it during checkout." />{coupons.length > visibleCoupons.length ? <Button asChild variant="outline" className="h-fit self-start sm:self-end"><Link href="/coupons">View All ({coupons.length})</Link></Button> : null}</div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visibleCoupons.map((coupon) => <PromotionCouponCard key={coupon.couponId} coupon={coupon} copied={copiedCoupon === coupon.code} onCopy={copyCoupon} />)}</div></section> : null}
  </>;
}
