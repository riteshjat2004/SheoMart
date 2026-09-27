"use client";

import { useState } from "react";
import { Check, Copy, ShieldCheck, TicketPercent } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";
import { VerifiedSectionHeader } from "./VerifiedSectionHeader";

interface VerifiedCoupon {
  code: string;
  discount: string;
  description: string;
  eligibility: string;
}

const coupons: VerifiedCoupon[] = [
  {
    code: "VERIFIED10",
    discount: "10% OFF",
    description: "Welcome discount on fresh grocery orders",
    eligibility: "Valid for all registered customers",
  },
  {
    code: "SAVE150",
    discount: "₹150 OFF",
    description: "Instant store saving on pantry stocking",
    eligibility: "Orders above ₹799",
  },
  {
    code: "FREELOCAL",
    discount: "FREE DELIVERY",
    description: "Zero doorstep delivery fee on local orders",
    eligibility: "Orders above ₹499 in Sheopur",
  },
  {
    code: "DAILYFRESH",
    discount: "BUY 2 GET 1",
    description: "Special daily essentials bundle savings",
    eligibility: "Applicable on selected dairy & bakery",
  },
];

export function VerifiedCouponWallet() {
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
    <section className="space-y-4" aria-labelledby="verified-coupons-heading">
      <VerifiedSectionHeader
        icon={TicketPercent}
        title="Verified Coupon Wallet"
        subtitle="Exclusive verified store vouchers and savings for your basket."
      />
      <h2 id="verified-coupons-heading" className="sr-only">
        Verified coupon wallet
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {coupons.map((coupon) => {
          const isCopied = copiedCode === coupon.code;

          return (
            <article
              key={coupon.code}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/40 p-5 shadow-sm transition-all duration-300 hover:border-emerald-500 hover:bg-emerald-50/80 hover:shadow-md dark:border-emerald-800 dark:bg-emerald-950/30 dark:hover:border-emerald-600"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-white px-2 py-0.5 text-[10px] font-bold text-emerald-800 shadow-xs dark:border-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                    <ShieldCheck className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                    Verified Saving
                  </span>
                  <TicketPercent className="h-4 w-4 text-emerald-600/70 dark:text-emerald-400/70" />
                </div>

                <div className="mt-4">
                  <p className="text-2xl font-extrabold tracking-tight text-emerald-800 dark:text-emerald-100">
                    {coupon.discount}
                  </p>
                  <p className="mt-1 text-xs text-stone-600 dark:text-stone-300 line-clamp-1">{coupon.description}</p>
                </div>
              </div>

              <div className="mt-5 border-t border-emerald-200/80 pt-3 dark:border-emerald-900/50">
                <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400">{coupon.eligibility}</p>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="rounded-lg border border-emerald-300/80 bg-white px-2.5 py-1 font-mono text-xs font-bold tracking-wider text-emerald-900 shadow-xs dark:border-emerald-800 dark:bg-zinc-900 dark:text-emerald-200">
                    {coupon.code}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(coupon.code)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
                      isCopied
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500 dark:hover:text-stone-950"
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
