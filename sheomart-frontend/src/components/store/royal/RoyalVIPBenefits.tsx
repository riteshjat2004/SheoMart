import { Crown, Gift, Headset, PackageCheck, Rocket, Sparkles } from "lucide-react";
import { royalTheme } from "./royalTheme";

const benefits = [
  { icon: Rocket, label: "Free Premium Delivery", desc: "No minimum spend required on flagship orders" },
  { icon: PackageCheck, label: "Priority Dispatch", desc: "Packed and sealed within 15 minutes of ordering" },
  { icon: Gift, label: "Complimentary Gift Wrap", desc: "Signature matte box & gold satin presentation" },
  { icon: Sparkles, label: "Hassle-Free Returns", desc: "Instant doorstep replacement guarantee" },
  { icon: Headset, label: "Concierge Support", desc: "Personal shopping assistant available anytime" },
  { icon: Crown, label: "Exclusive Launch Access", desc: "48-hour headstart on rare seasonal allocations" },
];

export function RoyalVIPBenefits() {
  return (
    <section className="space-y-4" aria-labelledby="royal-vip-benefits-heading">
      <div>
        <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${royalTheme.accent}`}>
          <Crown className="h-3.5 w-3.5" />
          Member Advantages
        </p>
        <h2 id="royal-vip-benefits-heading" className={`mt-1 text-2xl font-bold tracking-tight ${royalTheme.panelText}`}>
          Royal VIP Benefits
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map(({ icon: Icon, label, desc }) => (
          <article
            key={label}
            className={`group rounded-2xl border border-amber-300/80 p-5 backdrop-blur-sm transition-all duration-300 dark:border-amber-400/30 ${royalTheme.panel} ${royalTheme.hover}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-colors group-hover:bg-amber-400 group-hover:text-stone-950">
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-3.5 text-base font-bold text-stone-900 group-hover:text-amber-700 dark:text-white dark:group-hover:text-amber-200 transition-colors">{label}</p>
            <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">{desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
