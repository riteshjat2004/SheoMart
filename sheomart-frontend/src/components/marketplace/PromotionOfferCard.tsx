import Link from "next/link";
import { Flame, Store, Tag } from "lucide-react";
import type { OfferItem } from "@/services/promotions";

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const expiry = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export function PromotionOfferCard({
  offer,
  categoryLookup,
}: {
  offer: OfferItem;
  categoryLookup?: Map<string, { categoryId: string; name?: string; slug?: string }>;
}) {
  const categoryIds = offer.categoryIds ?? [];

  const discountBadge =
    offer.offerType === "bogo"
      ? "Buy 1 Get 1 Free"
      : offer.offerType === "buy_x_get_y"
        ? `Buy ${offer.buyQuantity || 1} Get ${offer.getQuantity || 1} Free`
        : offer.offerType === "free_delivery"
          ? "Free Delivery"
          : offer.discountType === "percentage"
            ? `${offer.discountValue}% off`
            : `${money(offer.discountValue)} off`;

  // Prefer pre-enriched targets if available
  const displayCategories =
    offer.targetCategories && offer.targetCategories.length > 0
      ? offer.targetCategories
      : categoryIds.map((id) => {
          const found = categoryLookup?.get(id);
          return { id, name: found?.name ?? "Category" };
        });

  return (
    <article className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-stone-800 dark:bg-zinc-900">
      <div className="relative h-48 w-full bg-stone-100 overflow-hidden dark:bg-stone-800">
        {offer.bannerImage ? (
          <img
            src={offer.bannerImage}
            alt={offer.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-400">
            <Tag className="h-8 w-8 text-stone-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {offer.isFlashSale && (
          <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur">
            <Flame className="h-3 w-3" /> Flash Deal
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              {offer.festivalName}
            </p>
            <h3 className="mt-1.5 text-lg font-bold text-stone-900 dark:text-stone-50 line-clamp-2">
              {offer.title}
            </h3>
            {offer.subtitle && (
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                {offer.subtitle}
              </p>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 shadow-sm dark:bg-emerald-500/10 dark:text-emerald-300">
            {discountBadge}
          </span>
        </div>

        {/* Target scopes / tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {displayCategories.length > 0 ? (
            displayCategories.slice(0, 3).map((cat) => (
              <Link
                key={cat.id}
                href={`/categories`}
                className="cursor-pointer rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-600 transition hover:bg-emerald-100 hover:text-emerald-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300"
              >
                {cat.name}
              </Link>
            ))
          ) : offer.targetStores && offer.targetStores.length > 0 ? (
            offer.targetStores.slice(0, 2).map((st) => (
              <span
                key={st.id}
                className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300"
              >
                <Store className="h-3 w-3" />
                {st.name}
              </span>
            ))
          ) : (
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
              All categories
            </span>
          )}

          {displayCategories.length > 3 && (
            <span className="rounded-full bg-stone-100 px-2 py-1 text-[10px] text-stone-500 dark:bg-stone-800">
              +{displayCategories.length - 3} more
            </span>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-stone-100 dark:border-stone-800/80">
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Valid until {expiry(offer.endsAt)}
          </p>
        </div>
      </div>
    </article>
  );
}
