import { ArrowRight, BadgePercent, Sparkles, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NormalOfferBanner({
  onBrowseDeals,
}: {
  onBrowseDeals?: () => void;
}) {
  return (
    <section
      aria-labelledby="normal-offer-banner-heading"
      className="relative isolate overflow-hidden rounded-[2rem] border border-orange-200/90 bg-gradient-to-r from-amber-50 via-orange-50 to-emerald-50/50 p-6 sm:p-8 dark:border-stone-800 dark:from-stone-900 dark:via-stone-850 dark:to-emerald-950/40"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800 dark:bg-orange-950/80 dark:text-orange-300">
            <BadgePercent className="h-3.5 w-3.5 text-orange-600" />
            <span>Neighborhood Everyday Savings</span>
          </div>

          <h3
            id="normal-offer-banner-heading"
            className="text-xl font-bold text-stone-900 sm:text-2xl dark:text-stone-50"
          >
            Direct Grocery Prices from Your Local Shop
          </h3>

          <p className="max-w-xl text-xs sm:text-sm text-stone-600 dark:text-stone-300">
            Enjoy fair neighborhood rates, daily grocery staples, and direct storefront service with reliable home delivery.
          </p>
        </div>

        {onBrowseDeals ? (
          <Button
            type="button"
            onClick={onBrowseDeals}
            className="h-10 shrink-0 rounded-full bg-emerald-600 px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
          >
            Shop Savings
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ) : null}
      </div>
    </section>
  );
}
