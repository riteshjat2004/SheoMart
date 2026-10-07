import Link from "next/link";
import { ArrowRight, Clock3, MapPin, ShoppingBag, Star } from "lucide-react";
import type { StoreItem } from "@/types/marketplace";
import { DeliveryBadge } from "@/components/store/DeliveryBadge";
import { StoreBadge } from "@/components/store/StoreBadge";
import { getStoreHref } from "@/components/store/storeCard.utils";

function isStoreOpen(store: StoreItem) {
  const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const [openingHour, openingMinute] = (store.pickupOpeningTime ?? "10:00").split(":").map(Number);
  const [closingHour, closingMinute] = (store.pickupClosingTime ?? "20:00").split(":").map(Number);
  return currentMinutes >= openingHour * 60 + openingMinute && currentMinutes < closingHour * 60 + closingMinute;
}

export function ApprovedStoreCard({ store }: { store: StoreItem }) {
  const displayName = store.storeName ?? store.name ?? "Local Store";
  const initials = displayName.charAt(0).toUpperCase();
  const ratingLabel = typeof store.rating === "number" ? store.rating.toFixed(1) : "New";
  const open = isStoreOpen(store);
  const locationText = [store.address, store.city].filter(Boolean).join(", ") || "Local Area, Sheopur";

  return (
    <Link
      href={getStoreHref(store)}
      className="group flex flex-col justify-between overflow-hidden rounded-[1.6rem] border border-stone-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/80 hover:shadow-md dark:border-stone-800 dark:bg-stone-900 dark:hover:border-emerald-800/60"
    >
      <div>
        {/* Cover image banner */}
        <div className="relative h-32 w-full overflow-hidden bg-gradient-to-r from-emerald-50 via-stone-100 to-amber-50/40 dark:from-stone-800 dark:via-stone-850 dark:to-emerald-950/30">
          {store.banner ? (
            <img
              src={store.banner}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center opacity-15">
              <ShoppingBag className="h-12 w-12 text-emerald-800 dark:text-emerald-300" />
            </div>
          )}

          {/* Delivery tag ribbon top right */}
          <div className="absolute right-3 top-3">
            <DeliveryBadge deliveryEnabled={store.deliveryEnabled === true} variant="normal" compact />
          </div>

          {/* Circular avatar logo */}
          <div className="absolute -bottom-6 left-5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-emerald-50 text-lg font-bold text-emerald-700 shadow-md ring-1 ring-emerald-200/60 dark:border-stone-900 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800/40">
            {store.logo ? (
              <img src={store.logo} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
        </div>

        {/* Content body */}
        <div className="p-5 pt-8">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <StoreBadge type="normal" size="sm" />
                <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                  Kirana &amp; Groceries
                </span>
              </div>
              <h3 className="mt-1 text-base font-semibold text-stone-900 transition-colors group-hover:text-emerald-700 dark:text-stone-50 dark:group-hover:text-emerald-400">
                {displayName}
              </h3>
            </div>

            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold ${
                open
                  ? "border border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "border border-stone-200 bg-stone-100 text-stone-500 dark:border-stone-800 dark:bg-stone-800 dark:text-stone-400"
              }`}
            >
              {open ? "Open Now" : "Closed"}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-1 font-medium text-stone-700 dark:text-stone-200">
              <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
              <span>{ratingLabel}</span>
              <span className="text-stone-400">({store.totalReviews ?? 0})</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5 text-stone-400" />
              <span>
                {store.pickupOpeningTime ?? "10:00"} - {store.pickupClosingTime ?? "20:00"}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-1.5 text-xs text-stone-600 dark:text-stone-400">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="line-clamp-1">{locationText}</span>
          </div>
        </div>
      </div>

      {/* Clean friendly footer strip */}
      <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50/60 px-5 py-2.5 text-xs font-medium text-stone-600 transition-colors group-hover:bg-emerald-50/40 group-hover:text-emerald-800 dark:border-stone-800 dark:bg-stone-950/50 dark:text-stone-400 dark:group-hover:bg-emerald-950/30 dark:group-hover:text-emerald-300">
        <span>Fresh Neighborhood Mart</span>
        <span className="flex items-center gap-1 font-semibold text-emerald-600 transition-transform group-hover:translate-x-0.5 dark:text-emerald-400">
          Visit Store <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

export const NormalStoreCard = ApprovedStoreCard;
