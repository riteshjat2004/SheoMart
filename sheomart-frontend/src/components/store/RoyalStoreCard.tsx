import Link from "next/link";
import { BadgeCheck, Clock, Crown, MapPin, Sparkles, Star, ArrowUpRight } from "lucide-react";
import type { StoreItem } from "@/types/marketplace";
import { StoreBadge } from "@/components/store/StoreBadge";
import { DeliveryBadge } from "@/components/store/DeliveryBadge";
import { DeliveryRibbon } from "@/components/store/DeliveryRibbon";

function getStoreHref(store: StoreItem) {
  return `/stores/${encodeURIComponent(store.storeId ?? store._id ?? store.storeName ?? store.name ?? "store")}`;
}

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
      className="group relative block overflow-hidden rounded-[1.75rem] border border-amber-400/40 bg-gradient-to-b from-stone-950 via-zinc-950 to-stone-900 text-stone-100 shadow-[0_12px_40px_-20px_rgba(212,175,55,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/80 hover:shadow-[0_20px_60px_-15px_rgba(212,175,55,0.45)]"
    >
      {/* Decorative Gold Ambient Background Glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />

      {/* Banner / Cover */}
      <div className="relative h-36 w-full overflow-hidden bg-stone-900">
        {store.banner ? (
          <img
            src={store.banner}
            alt={displayName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/60 via-stone-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />

        <DeliveryRibbon deliveryEnabled={store.deliveryEnabled === true} variant="royal" />

        <div className="absolute left-4 top-3">
          <StoreBadge type="royal" />
        </div>

        {/* Double-Ring Royal Logo Avatar */}
        <div className="absolute -bottom-6 left-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-amber-400/90 bg-stone-950 text-xl font-bold text-amber-300 shadow-[0_0_24px_rgba(212,175,55,0.4)] ring-4 ring-stone-950">
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
              <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-white transition-colors duration-200 group-hover:text-amber-300">
                {displayName}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-300">
                <Crown className="h-2.5 w-2.5" />
                Flagship
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-stone-400">
              <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
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
                ? "border border-emerald-500/30 bg-emerald-950/60 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                : "border border-stone-700/60 bg-stone-900/80 text-stone-400"
            }`}
          >
            {open ? "Open Now" : "Closed"}
          </span>
        </div>

        {/* Location & Details */}
        <div className="mt-4 space-y-2 border-t border-amber-400/15 pt-3.5 text-xs text-stone-300">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-400" />
            <span className="line-clamp-1">
              {store.address ?? "Sheopur Marketplace"}
              {store.city ? `, ${store.city}` : ""}
            </span>
          </div>

          <div className="flex items-center justify-between text-stone-400">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-stone-500" />
              <span>
                {store.pickupOpeningTime ?? "10:00"} - {store.pickupClosingTime ?? "20:00"}
              </span>
            </div>
            {store.status ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300/80">
                <BadgeCheck className="h-3 w-3 text-amber-400" />
                {store.status}
              </span>
            ) : null}
          </div>
        </div>

        {/* Luxury Footer Bar */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-400/20 bg-stone-900/60 px-3 py-2 text-[11px] font-medium text-amber-200/90 transition-colors group-hover:border-amber-400/40 group-hover:bg-amber-500/10">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" />
            Complimentary VIP Packaging
          </span>
          <span className="flex items-center font-semibold text-amber-300 group-hover:translate-x-0.5 transition-transform">
            Visit <ArrowUpRight className="ml-0.5 h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
