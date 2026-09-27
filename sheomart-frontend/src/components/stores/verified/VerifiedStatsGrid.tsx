import { CheckCircle2, MessageCircle, PackageCheck, ShoppingBag, Star } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";

const stats = [
  { icon: PackageCheck, value: "98%", label: "Customer Satisfaction" },
  { icon: ShoppingBag, value: "1,000+", label: "Orders Fulfilled" },
  { icon: Star, value: "4.9★", label: "Average Rating" },
  { icon: MessageCircle, value: "Prompt", label: "Support Response" },
];

export function VerifiedStatsGrid() {
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
