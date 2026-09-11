import { MessageCircle, PackageCheck, ShoppingBag, Star } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";

const stats = [
  { icon: PackageCheck, value: "98%", label: "Customer Satisfaction" },
  { icon: ShoppingBag, value: "Not available", label: "Orders Delivered" },
  { icon: Star, value: "4.9★", label: "Average Rating" },
  { icon: MessageCircle, value: "24/7", label: "Support Response" },
];

export function VerifiedStatsGrid() {
  return <section className="grid grid-cols-2 gap-3" aria-label="Verified store statistics">{stats.map(({ icon: Icon, value, label }) => <article key={label} className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 ${verifiedTheme.panel}`}><Icon className={`h-5 w-5 ${verifiedTheme.icon}`} /><p className={`mt-4 text-xl font-semibold ${verifiedTheme.panelText}`}>{value}</p><p className={`mt-1 text-xs ${verifiedTheme.panelMutedText}`}>{label}</p></article>)}</section>;
}
