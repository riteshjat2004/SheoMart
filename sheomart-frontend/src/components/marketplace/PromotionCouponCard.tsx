import { Store, Globe } from "lucide-react";
import type { CouponItem } from "@/services/promotions";

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export function PromotionCouponCard({
  coupon,
  copied,
  onCopy,
}: {
  coupon: CouponItem;
  copied: boolean;
  onCopy: (code: string) => void;
}) {
  const isStoreCoupon = Boolean(coupon.storeId || coupon.applicableScope === "store");

  return (
    <article className="flex flex-col justify-between rounded-[1.75rem] border border-dashed border-emerald-300 bg-emerald-50/70 p-5 shadow-sm transition hover:border-emerald-500 hover:shadow-md dark:border-emerald-900/70 dark:bg-emerald-950/20">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-50 line-clamp-1">
              {coupon.title}
            </h3>
            <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {coupon.discountType === "percentage"
                ? `${coupon.discountValue}% off`
                : `${money(coupon.discountValue)} off`}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-xs dark:bg-stone-900/80 dark:text-emerald-300">
            Min {money(coupon.minimumCartValue)}
          </span>
        </div>

        {/* Store Exclusive vs Sitewide Indicator */}
        <div className="mt-2.5">
          {isStoreCoupon ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/70 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-300">
              <Store className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="truncate">Store Exclusive • {coupon.storeName || "Store"}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-300/70 bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold text-sky-900 dark:border-sky-500/40 dark:bg-sky-950/40 dark:text-sky-300">
              <Globe className="h-3 w-3 shrink-0 text-sky-600 dark:text-sky-400" />
              <span>Sitewide (All Stores)</span>
            </span>
          )}
        </div>

        {coupon.description && (
          <p className="mt-2 text-xs text-stone-600 dark:text-stone-400 line-clamp-2">
            {coupon.description}
          </p>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-white/90 px-3 py-2 dark:border-emerald-900/70 dark:bg-stone-950/60">
          <code className="font-mono font-bold tracking-wider text-emerald-800 dark:text-emerald-200">
            {coupon.code}
          </code>
          <button
            type="button"
            onClick={() => onCopy(coupon.code)}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
            aria-label={`Copy coupon ${coupon.code}`}
          >
            {copied ? "Copied!" : "Copy code"}
          </button>
        </div>
        <p className="mt-2.5 text-xs text-stone-500 dark:text-stone-400">
          Expires {new Date(coupon.endsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </p>
      </div>
    </article>
  );
}
