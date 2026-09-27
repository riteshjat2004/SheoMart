import { Award, Clock3, Package, RotateCcw, ShoppingBag, Zap } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";
import type { StoreItem } from "@/types/marketplace";

export function VerifiedInfoGrid({ store, productCount }: { store: StoreItem; productCount: number }) {
  const items = [
    {
      icon: Clock3,
      label: "Average Response Time",
      value: "Under 2 hours",
      helper: "Fast merchant replies",
    },
    {
      icon: ShoppingBag,
      label: "Merchant Status",
      value: "Verified Partner",
      helper: "Vetted by SheoMart",
    },
    {
      icon: Package,
      label: "Products Listed",
      value: `${productCount} Items`,
      helper: "Fresh in-stock catalog",
    },
    {
      icon: Award,
      label: "Order Fulfillment",
      value: "99% Success Rate",
      helper: "Inspected & on-time delivery",
    },
    {
      icon: RotateCcw,
      label: "Quality Guarantee",
      value: "Hassle-Free",
      helper: "Instant replacement or refund",
    },
    {
      icon: Zap,
      label: "Store Pickup",
      value: store.pickupOpeningTime ? "Available Today" : "Delivery Service",
      helper: store.pickupOpeningTime
        ? `${store.pickupOpeningTime} - ${store.pickupClosingTime ?? "20:00"}`
        : "Direct delivery to your doorstep",
    },
  ];

  return (
    <section className={`${verifiedTheme.motion} grid gap-3 sm:grid-cols-2 lg:grid-cols-3`} aria-label="Verified store information">
      {items.map(({ icon: Icon, label, value, helper }) => (
        <article
          key={label}
          className={`rounded-2xl border p-4 transition-all duration-200 ${verifiedTheme.panel} ${verifiedTheme.hover}`}
        >
          <Icon className={`h-5 w-5 ${verifiedTheme.icon}`} />
          <p className={`mt-4 text-xs font-semibold uppercase tracking-[0.12em] ${verifiedTheme.panelMutedText}`}>{label}</p>
          <p className={`mt-1 text-sm font-semibold ${verifiedTheme.panelText}`}>{value}</p>
          <p className={`mt-1 text-xs ${verifiedTheme.panelMutedText}`}>{helper}</p>
        </article>
      ))}
    </section>
  );
}