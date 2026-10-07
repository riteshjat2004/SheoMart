import Link from "next/link";
import { ArrowUpRight, BadgeCheck, CheckCircle2, Clock, MapPin, ShieldCheck, Star } from "lucide-react";
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

export function VerifiedStoreCard({ store }: { store: StoreItem }) {
  const displayName = store.storeName ?? store.name ?? "Store";
  const initials = displayName.charAt(0).toUpperCase();
  const ratingLabel = typeof store.rating === "number" ? store.rating.toFixed(1) : "New";
  const open = isStoreOpen(store);

  return (
    <Link
      href={getStoreHref(store)}
      className="group relative block overflow-hidden rounded-[1.6rem] border border-emerald-200/80 bg-white text-stone-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-[0_14px_40px_-15px_rgba(16,185,129,0.25)] dark:border-emerald-900/60 dark:bg-zinc-900 dark:text-stone-50"
    >
      {/* Soft Mint Gradient Accent in Top Right */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-emerald-400/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

      {/* Cover Banner */}
      <div className="relative h-34 w-full overflow-hidden bg-emerald-50/50 dark:bg-emerald-950/30">
        {store.banner ? (
          <img
            src={store.banner}
            alt={displayName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-emerald-100/70 via-teal-50 to-white dark:from-emerald-950/50 dark:via-zinc-900 dark:to-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <DeliveryRibbon deliveryEnabled={store.deliveryEnabled === true} variant="verified" />

        <div className="absolute left-4 top-3">
          <StoreBadge type="verified" />
        </div>

        {/* Circular Store Avatar with Emerald Trust Halo */}
        <div className="absolute -bottom-6 left-5 flex h-15 w-15 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-500 bg-emerald-50 text-xl font-bold text-emerald-800 shadow-md ring-4 ring-white dark:bg-emerald-950 dark:text-emerald-300 dark:ring-zinc-900">
          {store.logo ? (
            <img src={store.logo} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 pt-9 sm:p-6 sm:pt-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="line-clamp-1 text-base font-bold tracking-tight text-stone-900 transition-colors duration-200 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
                {displayName}
              </h3>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                {ratingLabel}
              </span>
              <span>•</span>
              <span>{store.totalReviews ?? 0} reviews</span>
              <DeliveryBadge deliveryEnabled={store.deliveryEnabled === true} variant="verified" compact />
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
              open
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-stone-100 text-stone-500 border border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700"
            }`}
          >
            {open ? "Open Now" : "Closed"}
          </span>
        </div>

        {/* Location & Hours */}
        <div className="mt-4 space-y-2 border-t border-emerald-100/80 pt-3 text-xs text-stone-600 dark:border-emerald-900/30 dark:text-stone-300">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="line-clamp-1">
              {store.address ?? "Local Sheopur Market"}
              {store.city ? `, ${store.city}` : ""}
            </span>
          </div>

          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-stone-400" />
              <span>
                {store.pickupOpeningTime ?? "10:00"} - {store.pickupClosingTime ?? "20:00"}
              </span>
            </div>
            {store.status ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <BadgeCheck className="h-3 w-3 text-emerald-600" />
                {store.status}
              </span>
            ) : null}
          </div>
        </div>

        {/* Trust Strip Footer */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-200/60 bg-emerald-50/50 px-3 py-2 text-[11px] font-medium text-emerald-900 transition-colors group-hover:border-emerald-300 group-hover:bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Quality Checked Store
          </span>
          <span className="flex items-center font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform dark:text-emerald-300">
            Visit Store <ArrowUpRight className="ml-0.5 h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
