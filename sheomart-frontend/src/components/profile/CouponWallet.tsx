"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Clock3, Copy, Gift, TicketPercent } from "lucide-react";
import { fetchCategories } from "@/services/category";
import { fetchCouponWallet, type OfferItem, type WalletCoupon } from "@/services/promotions";

const money = (value: unknown) => {
  const numericValue = typeof value === "number" ? value : typeof value === "string" ? Number(value) : 0;
  return `₹${(Number.isFinite(numericValue) ? numericValue : 0).toLocaleString("en-IN")}`;
};

function remainingValidity(expiresAt?: string) {
  const expiryTime = expiresAt ? new Date(expiresAt).getTime() : NaN;
  if (!Number.isFinite(expiryTime)) return "Validity unavailable";
  const remaining = expiryTime - Date.now();
  if (remaining <= 0) return "Expired";
  const days = Math.ceil(remaining / 86400000);
  if (days === 1) return "Expires tomorrow";
  if (days < 30) return `${days} days left`;
  return `Valid until ${new Date(expiryTime).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
}

function CouponCard({ coupon, copiedCode, onCopy }: { coupon: WalletCoupon; copiedCode: string | null; onCopy: (code: string) => void }) {
  const discount = coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `${money(coupon.discountValue)} OFF`;
  return <article className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950/60"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"><TicketPercent className="h-5 w-5" /></div><div className="min-w-0"><h3 className="truncate font-semibold text-stone-900 dark:text-stone-50">{coupon.title}</h3><p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">{discount}</p></div></div>{coupon.used ? <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">Used</span> : null}</div><div className="mt-4 flex items-center justify-between gap-2 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/60 px-3 py-2 dark:border-emerald-900/70 dark:bg-emerald-950/20"><code className="font-semibold tracking-wider text-emerald-800 dark:text-emerald-200">{coupon.code || "Unavailable"}</code><button type="button" onClick={() => onCopy(coupon.code)} disabled={!coupon.code} className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-300" aria-label={`Copy coupon code ${coupon.code || "unavailable"}`}>{copiedCode === coupon.code ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copiedCode === coupon.code ? "Copied" : "Copy"}</button></div><div className="mt-3 space-y-1 text-xs text-stone-500 dark:text-stone-400">{coupon.minimumPurchase > 0 ? <p>Minimum purchase: {money(coupon.minimumPurchase)}</p> : null}{coupon.maxDiscount != null && coupon.maxDiscount > 0 ? <p>Maximum discount: {money(coupon.maxDiscount)}</p> : null}<p className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{coupon.usedAt ? `Used on ${new Date(coupon.usedAt).toLocaleDateString("en-IN")}` : remainingValidity(coupon.expiresAt)}</p></div></article>;
}

function OfferCard({ offer }: { offer: OfferItem }) {
  const discount = offer.discountType === "percentage" ? `${offer.discountValue}% OFF` : `${money(offer.discountValue)} OFF`;
  const categoryIds = offer.categoryIds ?? [];
  return <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950/60"><div className="h-32 bg-stone-100 dark:bg-stone-800">{offer.bannerImage ? <img src={offer.bannerImage} alt="" className="h-full w-full object-cover" /> : null}</div><div className="p-4"><div className="flex items-start justify-between gap-2"><div><h3 className="font-semibold text-stone-900 dark:text-stone-50">{offer.title}</h3><p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">{offer.festivalName} · {discount}</p></div><Gift className="h-5 w-5 shrink-0 text-emerald-500" /></div><p className="mt-3 text-xs text-stone-500 dark:text-stone-400">{categoryIds.length ? `Eligible categories: ${categoryIds.join(", ")}` : "Eligible across the store"}</p><p className="mt-2 flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400"><Clock3 className="h-3.5 w-3.5" />{remainingValidity(offer.endsAt)}</p></div></article>;
}

function CouponSection({ title, description, coupons, copiedCode, onCopy }: { title: string; description: string; coupons: WalletCoupon[]; copiedCode: string | null; onCopy: (code: string) => void }) {
  return <section><div className="flex items-end justify-between gap-3"><div><h3 className="font-semibold text-stone-900 dark:text-stone-50">{title}</h3><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{description}</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{coupons.length}</span></div>{coupons.length ? <div className="mt-3 grid gap-3 md:grid-cols-2">{coupons.map((coupon) => <CouponCard key={`${coupon.couponId}-${coupon.usedAt ?? "available"}`} coupon={coupon} copiedCode={copiedCode} onCopy={onCopy} />)}</div> : <p className="mt-3 rounded-xl border border-dashed border-stone-200 p-4 text-sm text-stone-500 dark:border-stone-800 dark:text-stone-400">No coupons in this section.</p>}</section>;
}

export function CouponWallet() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const walletQuery = useQuery({ queryKey: ["coupon-wallet"], queryFn: fetchCouponWallet, staleTime: 60000 });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategories, staleTime: 300000 });
  const wallet = walletQuery.data;
  const categoryNames = new Map((categoriesQuery.data ?? []).map((category) => [category.categoryId ?? "", category.name]));
  const copyCode = async (code: string) => { await navigator.clipboard?.writeText(code); setCopiedCode(code); window.setTimeout(() => setCopiedCode(null), 1800); };

  if (walletQuery.isLoading) return <p className="text-sm text-stone-500 dark:text-stone-400">Loading your coupon wallet...</p>;
  if (walletQuery.isError) return <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300">Unable to load your coupon wallet.</p>;

  const resolveOfferCategories = (offer: OfferItem) => (offer.categoryIds ?? []).map((id) => categoryNames.get(id) ?? id).join(", ");
  return <div className="space-y-8"><CouponSection title="Available coupons" description="Ready to use on your next eligible order." coupons={wallet?.available ?? []} copiedCode={copiedCode} onCopy={copyCode} /><CouponSection title="Used coupons" description="Your redeemed coupon history." coupons={wallet?.used ?? []} copiedCode={copiedCode} onCopy={copyCode} /><CouponSection title="Expired coupons" description="Coupons whose validity window has ended." coupons={wallet?.expired ?? []} copiedCode={copiedCode} onCopy={copyCode} /><section><div className="flex items-center gap-2"><Gift className="h-5 w-5 text-emerald-500" /><div><h3 className="font-semibold text-stone-900 dark:text-stone-50">Festival offers</h3><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Offers currently available for your shopping.</p></div></div>{wallet?.offers.length ? <div className="mt-3 grid gap-3 md:grid-cols-2">{wallet.offers.map((offer) => <div key={offer.offerId}><OfferCard offer={{ ...offer, categoryIds: (offer.categoryIds ?? []).map((id) => categoryNames.has(id) ? categoryNames.get(id)! : id) }} /><p className="sr-only">Eligible categories: {resolveOfferCategories(offer)}</p></div>)}</div> : <p className="mt-3 rounded-xl border border-dashed border-stone-200 p-4 text-sm text-stone-500 dark:border-stone-800 dark:text-stone-400">No festival offers are available right now.</p>}</section></div>;
}
