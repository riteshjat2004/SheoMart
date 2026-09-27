import {
  Boxes,
  Clock3,
  MapPin,
  Phone,
  Shield,
  Star,
  Store,
  Truck,
} from "lucide-react";
import { normalTheme } from "@/themes/normalTheme";
import type { StoreItem } from "@/types/marketplace";

export function NormalInfoGrid({
  store,
  productCount,
}: {
  store: StoreItem;
  productCount: number;
}) {
  const ratingText =
    typeof store.rating === "number"
      ? `${store.rating.toFixed(1)} ★ (${store.totalReviews ?? 0} reviews)`
      : "Newly Joined Store";

  const addressText =
    [store.address, store.city, store.pincode].filter(Boolean).join(", ") ||
    "Sheopur, Madhya Pradesh";

  const cards = [
    {
      icon: Boxes,
      label: "Products Listed",
      value: `${productCount} In Stock`,
      helper: "Fresh everyday items",
    },
    {
      icon: Clock3,
      label: "Store Hours",
      value: `${store.pickupOpeningTime ?? "10:00"} - ${store.pickupClosingTime ?? "20:00"}`,
      helper: "Daily regular service",
    },
    {
      icon: Truck,
      label: "Delivery & Pickup",
      value: store.deliveryEnabled ? "Delivery & Pickup" : "Storefront Pickup",
      helper: store.deliveryRadiusKm
        ? `${store.deliveryRadiusKm} km local radius`
        : "Local neighborhood coverage",
    },
    {
      icon: Star,
      label: "Customer Rating",
      value: ratingText,
      helper: "Community feedback",
    },
    {
      icon: Store,
      label: "Store Category",
      value: "Kirana & Groceries",
      helper: "Everyday staples",
    },
    {
      icon: MapPin,
      label: "Neighborhood Location",
      value: addressText,
      helper: "Local Sheopur merchant",
    },
  ];

  return (
    <section aria-label="Store Information Grid" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Store Details &amp; Hours
        </h2>
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
          Neighborhood Kirana
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ icon: Icon, label, value, helper }) => (
          <article
            key={label}
            className={`rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${normalTheme.panel}`}
          >
            <div className="flex items-center justify-between">
              <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                Local
              </span>
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {label}
            </p>
            <p className="mt-1 line-clamp-1 text-sm font-bold text-stone-900 dark:text-stone-100">
              {value}
            </p>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{helper}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
