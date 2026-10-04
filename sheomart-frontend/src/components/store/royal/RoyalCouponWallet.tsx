"use client";

import { useState } from "react";
import { Check, Copy, Crown, Sparkles, Tag, TicketPercent } from "lucide-react";
import { royalTheme } from "./royalTheme";

interface RoyalCoupon {
  code: string;
  discount: string;
  description: string;
  eligibility: string;
}

const royalCoupons: RoyalCoupon[] = [
  {
    code: "ROYALVIP",
    discount: "₹300 OFF",
    description: "Exclusive luxury discount on curated orders",
    eligibility: "Orders above ₹1,499",
  },
  {
    code: "ROYALFIRST",
    discount: "15% OFF",
    description: "Welcome to SheoMart Royal Experience",
    eligibility: "First order on flagship store",
  },
  {
    code: "FREEDISPATCH",
    discount: "FREE EXPRESS",
    description: "Complimentary same-day VIP dispatch",
    eligibility: "All Royal store selections",
  },
  {
    code: "LUXEWRAP",
    discount: "FREE GIFT WRAP",
    description: "Signature black box & satin gold ribbon",
    eligibility: "Applicable on all items",
  },
];

export function RoyalCouponWallet() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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
            Royal Vouchers
          </p>
          <h2 id="royal-coupons-heading" className={`mt-1 text-2xl font-bold tracking-tight ${royalTheme.panelText}`}>
            Exclusive Flagship Privileges
          </h2>
        </div>
        <p className="text-xs text-stone-400">Apply voucher codes during checkout for instant privileges.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {royalCoupons.map((coupon) => {
          const isCopied = copiedCode === coupon.code;

          return (
            <article
              key={coupon.code}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-amber-300/90 bg-gradient-to-br from-[#FFFDF7] via-[#FFFBF0] to-[#FFF8E7] p-5 shadow-[0_8px_30px_-15px_rgba(217,119,6,0.15)] transition-all duration-300 hover:border-amber-400 hover:shadow-[0_14px_40px_-15px_rgba(217,119,6,0.25)] dark:border-amber-400/40 dark:bg-gradient-to-br dark:from-stone-950 dark:via-zinc-950 dark:to-stone-900 dark:shadow-[0_8px_30px_-15px_rgba(212,175,55,0.25)] dark:hover:border-amber-400/80 dark:hover:shadow-[0_14px_40px_-15px_rgba(212,175,55,0.4)]"
            >
              {/* Radial glow */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-400/10 blur-xl group-hover:bg-amber-400/20 transition-all" />

              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100/90 px-2 py-0.5 text-[10px] font-bold text-amber-900 shadow-xs dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300">
                    <Sparkles className="h-2.5 w-2.5" />
                    Royal Benefit
                  </span>
                  <TicketPercent className="h-4 w-4 text-amber-600 dark:text-amber-400/70" />
                </div>

                <div className="mt-4">
                  <p className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                    {coupon.discount}
                  </p>
                  <p className="mt-1 text-xs text-stone-600 dark:text-stone-300 line-clamp-1">{coupon.description}</p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-amber-200/80 dark:border-amber-400/15">
                <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400">{coupon.eligibility}</p>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 font-mono text-xs font-bold tracking-wider text-amber-950 dark:border-amber-400/30 dark:bg-black/60 dark:text-amber-200">
                    {coupon.code}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(coupon.code)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                      isCopied
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                        : "bg-amber-100 text-amber-900 hover:bg-amber-500 hover:text-white dark:bg-amber-400/20 dark:text-amber-300 dark:hover:bg-amber-400 dark:hover:text-stone-950"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
