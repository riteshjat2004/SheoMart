import Link from "next/link";
import { BadgeCheck, Clock, Crown, MapPin, Sparkles, Star, ArrowUpRight } from "lucide-react";
import type { StoreItem } from "@/types/marketplace";
import { StoreBadge } from "@/components/store/StoreBadge";
import { DeliveryBadge } from "@/components/store/DeliveryBadge";
import { DeliveryRibbon } from "@/components/store/DeliveryRibbon";
import { getStoreHref } from "@/components/store/storeCard.utils";

function isStoreOpen(store: StoreItem) {
  const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const [openingHour, openingMinute] = (store.pickupOpeningTime ?? "10:00").split(":").map(Number);
  const [closingHour, closingMinute] = (store.pickupClosingTime ?? "20:00").split(":").map(Number);
  return currentMinutes >= openingHour * 60 + openingMinute && currentMinutes < closingHour * 60 + closingMinute;
}

export function RoyalStoreCard({ store }: { store: StoreItem }) {
  const displayName = store.storeName ?? store.name ?? "Store";
  const initials = displayName.charAt(0).toUpperCase();
  const ratingLabel = typeof store.rating === "number" ? store.rating.toFixed(1) : "New";
  const open = isStoreOpen(store);

  return (
    <Link
      href={getStoreHref(store)}
      className="group relative block overflow-hidden rounded-[1.75rem] border border-amber-300/80 bg-gradient-to-b from-[#FFFDF7] via-[#FFFBF0] to-[#FFF8E7] text-stone-900 shadow-[0_12px_40px_-20px_rgba(217,119,6,0.15)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-[0_20px_60px_-15px_rgba(217,119,6,0.25)] dark:border-amber-400/40 dark:from-stone-950 dark:via-zinc-950 dark:to-stone-900 dark:text-stone-100 dark:shadow-[0_12px_40px_-20px_rgba(212,175,55,0.22)] dark:hover:border-amber-400/80 dark:hover:shadow-[0_20px_60px_-15px_rgba(212,175,55,0.45)]"
    >
      {/* Decorative Gold Ambient Background Glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-amber-400/15 blur-3xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-amber-400/10" />

      {/* Banner / Cover */}
      <div className="relative h-36 w-full overflow-hidden bg-amber-100/40 dark:bg-stone-900">
        {store.banner ? (
          <img
            src={store.banner}
            alt={displayName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200/50 via-amber-100/30 to-amber-50 dark:from-amber-950/60 dark:via-stone-900 dark:to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFFDF7] via-[#FFFDF7]/40 to-transparent dark:from-stone-950 dark:via-stone-950/50 dark:to-transparent" />

        <DeliveryRibbon deliveryEnabled={store.deliveryEnabled === true} variant="royal" />

        <div className="absolute left-4 top-3">
          <StoreBadge type="royal" />
        </div>

        {/* Double-Ring Royal Logo Avatar */}
        <div className="absolute -bottom-6 left-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-amber-400 bg-amber-50 text-xl font-bold text-amber-900 shadow-md ring-4 ring-[#FFFDF7] dark:border-amber-400/90 dark:bg-stone-950 dark:text-amber-300 dark:ring-stone-950 dark:shadow-[0_0_24px_rgba(212,175,55,0.4)]">
          {store.logo ? (
            <img src={store.logo} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 pt-9 sm:p-6 sm:pt-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-stone-950 transition-colors duration-200 group-hover:text-amber-800 dark:text-white dark:group-hover:text-amber-300">
                {displayName}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-900 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-300">
                <Crown className="h-2.5 w-2.5" />
                Flagship
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
                {ratingLabel}
              </span>
              <span>•</span>
              <span>{store.totalReviews ?? 0} reviews</span>
              <DeliveryBadge deliveryEnabled={store.deliveryEnabled === true} variant="royal" compact />
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
              open
                ? "border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/60 dark:text-emerald-400 dark:shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                : "border border-stone-200 bg-stone-100 text-stone-500 dark:border-stone-700/60 dark:bg-stone-900/80 dark:text-stone-400"
            }`}
          >
            {open ? "Open Now" : "Closed"}
          </span>
        </div>

        {/* Location & Details */}
        <div className="mt-4 space-y-2 border-t border-amber-300/40 pt-3.5 text-xs text-stone-600 dark:border-amber-400/15 dark:text-stone-300">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="line-clamp-1">
              {store.address ?? "Sheopur Marketplace"}
              {store.city ? `, ${store.city}` : ""}
            </span>
          </div>

          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
              <span>
                {store.pickupOpeningTime ?? "10:00"} - {store.pickupClosingTime ?? "20:00"}
              </span>
            </div>
            {store.status ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300/80">
                <BadgeCheck className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                {store.status}
              </span>
            ) : null}
          </div>
        </div>

        {/* Luxury Footer Bar */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-[11px] font-medium text-amber-950 transition-colors group-hover:border-amber-300 group-hover:bg-amber-100/60 dark:border-amber-400/20 dark:bg-stone-900/60 dark:text-amber-200/90 dark:group-hover:border-amber-400/40 dark:group-hover:bg-amber-500/10">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            Complimentary VIP Packaging
          </span>
          <span className="flex items-center font-semibold text-amber-800 transition-transform group-hover:translate-x-0.5 dark:text-amber-300">
            Visit <ArrowUpRight className="ml-0.5 h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
