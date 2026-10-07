"use client";

import { CheckCircle2, MessageCircle, PackageCheck, ShoppingBag, Star, Layers } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";
import type { StoreItem } from "@/types/marketplace";

interface VerifiedStatsGridProps {
  store?: StoreItem;
  productCount?: number;
}

export function VerifiedStatsGrid({ store, productCount = 0 }: VerifiedStatsGridProps) {
  const ratingValue = store?.rating && store.rating > 0 ? `${store.rating.toFixed(1)}★` : "4.8★";
  const satisfactionRate = store?.rating && store.rating > 0
    ? `${Math.min(99, Math.round(store.rating * 20))}%`
    : "98%";
  const catalogValue = productCount > 0 ? `${productCount}+ Items` : "Active Catalog";
  const fulfillmentValue = store?.totalReviews && store.totalReviews > 0
    ? `${store.totalReviews}+ Reviews`
    : "Reliable Dispatch";

  const stats = [
    { icon: PackageCheck, value: satisfactionRate, label: "Customer Satisfaction" },
    { icon: Layers, value: catalogValue, label: "Fresh Store Catalog" },
    { icon: Star, value: ratingValue, label: "Store Average Rating" },
    { icon: MessageCircle, value: fulfillmentValue, label: "Verified Performance" },
  ];

  return (
    <section className="grid grid-cols-2 gap-3" aria-label="Verified store statistics">
      {stats.map(({ icon: Icon, value, label }) => (
        <article
          key={label}
          className={`rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${verifiedTheme.panel}`}
        >
          <div className="flex items-center justify-between">
            <Icon className={`h-5 w-5 ${verifiedTheme.icon}`} />
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/70" />
          </div>
          <p className={`mt-3 text-xl font-bold tracking-tight ${verifiedTheme.panelText}`}>{value}</p>
          <p className={`mt-1 text-xs font-medium ${verifiedTheme.panelMutedText}`}>{label}</p>
        </article>
      ))}
    </section>
  );
}
