import Link from "next/link";
import { BadgeCheck, Crown, MapPin, Star } from "lucide-react";
import type { StoreItem } from "@/types/marketplace";
import { StoreBadge } from "@/components/store/StoreBadge";

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
    <Link href={getStoreHref(store)} className="group block overflow-hidden rounded-[1.5rem] border border-amber-200 bg-gradient-to-b from-amber-50/90 to-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-amber-900/70 dark:from-amber-950/20 dark:to-zinc-900">
      <div className="relative h-32 bg-stone-100 dark:bg-stone-800">
        {store.banner ? <img src={store.banner} alt="" className="h-full w-full object-cover" /> : null}
        <div className="absolute left-5 top-3">
          <StoreBadge type="royal" />
        </div>
        <div className="absolute -bottom-6 left-5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-amber-100 text-lg font-semibold text-amber-700 dark:border-zinc-900 dark:bg-amber-950/60 dark:text-amber-300">
          {store.logo ? <img src={store.logo} alt="" className="h-full w-full object-cover" /> : initials}
        </div>
      </div>

      <div className="p-5 pt-9">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50">{displayName}</h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300">
                <Crown className="h-3 w-3" />
                Featured
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
              <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
              {ratingLabel}
              <span>({store.totalReviews ?? 0} reviews)</span>
            </div>
          </div>
          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${open ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
            {open ? "Open Now" : "Closed"}
          </span>
        </div>

        <div className="mt-4 space-y-2 text-sm text-stone-600 dark:text-stone-300">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              {store.address ?? "Area unavailable"}
              {store.city ? `, ${store.city}` : ""}
            </span>
          </div>
          {store.status ? (
            <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              <BadgeCheck className="h-3.5 w-3.5" />
              {store.status}
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
