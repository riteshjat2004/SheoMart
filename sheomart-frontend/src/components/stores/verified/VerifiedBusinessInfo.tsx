import { Clock3, Mail, MapPin, Phone, Truck } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";
import type { StoreItem } from "@/types/marketplace";

export function VerifiedBusinessInfo({ store }: { store: StoreItem }) {
  const items = [
    { icon: Phone, label: "Phone", value: store.phone ?? "Not available" },
    { icon: Mail, label: "Email", value: store.email ?? "Not available" },
    { icon: MapPin, label: "Address", value: [store.address, store.city, store.state, store.pincode].filter(Boolean).join(", ") || "Not available" },
    { icon: Clock3, label: "Business Hours", value: `${store.pickupOpeningTime ?? "10:00"} - ${store.pickupClosingTime ?? "20:00"}` },
    { icon: MapPin, label: "Pickup Address", value: store.address ?? "Not available" },
    { icon: Truck, label: "Delivery Radius", value: "Not available" },
  ];
  return <section className={`rounded-[2rem] border p-5 sm:p-6 ${verifiedTheme.panel}`} aria-labelledby="verified-business-heading"><h2 id="verified-business-heading" className={`text-xl font-semibold ${verifiedTheme.panelText}`}>Contact &amp; Business Information</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map(({ icon: Icon, label, value }) => <div key={label} className="flex gap-3"><Icon className={`h-5 w-5 shrink-0 ${verifiedTheme.icon}`} /><div className="min-w-0"><p className={`text-xs uppercase tracking-wider ${verifiedTheme.panelMutedText}`}>{label}</p><p className={`mt-1 break-words text-sm font-medium ${verifiedTheme.panelText}`}>{value}</p></div></div>)}</div></section>;
}
