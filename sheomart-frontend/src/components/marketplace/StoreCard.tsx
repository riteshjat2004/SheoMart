import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import type { StoreItem } from "@/types/marketplace";

interface StoreCardProps {
  store: StoreItem;
}

function getStoreHref(store: StoreItem) {
  return `/stores/${encodeURIComponent(store.storeId ?? store._id ?? store.storeName ?? store.name ?? "store")}`;
}

export function StoreCard({ store }: StoreCardProps) {
  const displayName = store.storeName ?? store.name ?? "Store";
  const initials = displayName.charAt(0).toUpperCase();
  const ratingLabel = typeof store.rating === "number" ? store.rating.toFixed(1) : "New";
  const cityLabel = store.city ?? store.address ?? "City not available";

  return (
    <Link
      href={getStoreHref(store)}
      className="group block overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-stone-800 dark:bg-stone-900"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
          {initials}
        </div>
        <div>
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50">{displayName}</h3>
          <div className="mt-1 flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
            <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
            {ratingLabel}
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm text-stone-600 dark:text-stone-300">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <span>{cityLabel}</span>
        </div>
        {store.status ? (
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            {store.status}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
