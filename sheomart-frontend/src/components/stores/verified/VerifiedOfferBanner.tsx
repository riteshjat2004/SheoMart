import { ArrowRight, BadgePercent, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifiedTheme } from "@/themes/verifiedTheme";

export function VerifiedOfferBanner() {
  return (
    <section
      className={`relative isolate overflow-hidden rounded-[2rem] border p-6 sm:p-8 ${verifiedTheme.hero}`}
      aria-labelledby="verified-savings-heading"
    >
      <div className="absolute -right-8 -top-14 -z-10 h-48 w-48 rounded-full border border-emerald-400/20 bg-emerald-400/10 blur-2xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-300">
            <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Verified Store Savings
          </p>
          <h2 id="verified-savings-heading" className="mt-2 text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
            Fresh Value Deals &amp; Steals
          </h2>
          <p className="mt-2 text-sm text-stone-600 dark:text-emerald-100 max-w-xl">
            Save up to 40% on fresh everyday grocery essentials, daily vegetables, and household staples from this verified seller.
          </p>
        </div>
        <Button
          type="button"
          className="h-11 shrink-0 rounded-full bg-emerald-600 text-white font-semibold shadow-md transition hover:bg-emerald-500 dark:bg-white dark:text-emerald-900 dark:hover:bg-emerald-50 px-6"
        >
          <BadgePercent className="mr-2 h-4 w-4" />
          Shop Offers
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
