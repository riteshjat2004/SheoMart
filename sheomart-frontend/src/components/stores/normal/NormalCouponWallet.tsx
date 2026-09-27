"use client";

import { useState } from "react";
import { Check, Copy, Tag, TicketPercent } from "lucide-react";

interface NormalCoupon {
  code: string;
  discount: string;
  description: string;
  eligibility: string;
  badge: string;
}

const normalCoupons: NormalCoupon[] = [
  {
    code: "LOCAL10",
    discount: "10% OFF",
    description: "Everyday neighborhood saving on fresh groceries",
    eligibility: "Valid on orders above ₹249",
    badge: "Local Savings",
  },
  {
    code: "FREEDEL",
    discount: "FREE DELIVERY",
    description: "Zero delivery fee directly from your neighborhood mart",
    eligibility: "Valid on orders above ₹199",
    badge: "Neighborhood Offer",
  },
  {
    code: "NEIGHBOR50",
    discount: "₹50 OFF",
    description: "Instant discount on daily essentials & pantry staples",
    eligibility: "Valid on orders above ₹499",
    badge: "Special Deal",
  },
  {
    code: "DAILYPACK",
    discount: "EXTRA 5%",
    description: "Extra combo discount on packaged snacks & dairy",
    eligibility: "Add any 3 household items",
    badge: "Pantry Saver",
  },
];

export function NormalCouponWallet() {
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
    <section aria-labelledby="normal-coupons-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400">
            <TicketPercent className="h-4 w-4" />
          </div>
          <div>
            <h2 id="normal-coupons-heading" className="text-lg font-bold text-stone-900 dark:text-stone-50">
              Store Coupons &amp; Daily Savings
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Apply these codes at checkout to save on your local grocery order
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {normalCoupons.map((coupon) => {
          const isCopied = copiedCode === coupon.code;

          return (
            <article
              key={coupon.code}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-orange-200 bg-orange-50/30 p-4 transition-all duration-200 hover:border-orange-400 hover:bg-orange-50/70 hover:shadow-sm dark:border-orange-900/60 dark:bg-stone-900/70 dark:hover:border-orange-700"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-white px-2 py-0.5 text-[10px] font-bold text-orange-800 shadow-xs dark:border-stone-700 dark:bg-stone-800 dark:text-orange-300">
                    <Tag className="h-2.5 w-2.5 text-orange-500" />
                    {coupon.badge}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
                    {coupon.discount}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-stone-600 dark:text-stone-300">
                    {coupon.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-orange-200/60 pt-3 dark:border-stone-800">
                <p className="text-[11px] text-stone-500 dark:text-stone-400">{coupon.eligibility}</p>

                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <div className="rounded-lg border border-orange-300/80 bg-white px-2 py-1 font-mono text-xs font-bold tracking-wider text-stone-800 shadow-xs dark:border-stone-700 dark:bg-stone-850 dark:text-stone-100">
                    {coupon.code}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(coupon.code)}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-all duration-200 ${
                      isCopied
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-orange-500/10 text-orange-700 hover:bg-orange-500 hover:text-white dark:bg-orange-500/20 dark:text-orange-300 dark:hover:bg-orange-500 dark:hover:text-stone-950"
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
                        Copy
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
