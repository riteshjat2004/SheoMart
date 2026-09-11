import { Clock3, Package, RotateCcw, ShoppingBag, Truck, Zap } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";
import type { StoreItem } from "@/types/marketplace";

export function VerifiedInfoGrid({ store, productCount }: { store: StoreItem; productCount: number }) {
  const items = [
    { icon: Clock3, label: "Average Response Time", value: "Within 24 hours", helper: "Seller response estimate" },
    { icon: ShoppingBag, label: "Years Selling", value: "Established seller", helper: "Exact tenure unavailable" },
    { icon: Package, label: "Products Listed", value: String(productCount), helper: "Currently available" },
    { icon: Truck, label: "Successful Orders", value: "Not available", helper: "Backend metric unavailable" },
    { icon: RotateCcw, label: "Return Policy", value: "Store policy", helper: "Confirm before purchase" },
    { icon: Zap, label: "Pickup Available", value: store.pickupOpeningTime ? "Available" : "Not available", helper: store.pickupOpeningTime ? `${store.pickupOpeningTime} - ${store.pickupClosingTime ?? "20:00"}` : "No hours listed" },
  ];
  return <section className={`${verifiedTheme.motion} grid gap-3 sm:grid-cols-2 lg:grid-cols-3`} aria-label="Verified store information">{items.map(({ icon: Icon, label, value, helper }) => <article key={label} className={`rounded-2xl border p-4 ${verifiedTheme.panel} ${verifiedTheme.hover}`}><Icon className={`h-5 w-5 ${verifiedTheme.icon}`} /><p className={`mt-4 text-xs font-semibold uppercase tracking-[0.12em] ${verifiedTheme.panelMutedText}`}>{label}</p><p className={`mt-1 text-sm font-semibold ${verifiedTheme.panelText}`}>{value}</p><p className={`mt-1 text-xs ${verifiedTheme.panelMutedText}`}>{helper}</p></article>)}</section>;
}