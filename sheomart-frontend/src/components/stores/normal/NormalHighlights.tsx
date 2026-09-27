import { CheckCircle2, HeartHandshake, Shield, Sparkles, Store, Truck, UtensilsCrossed } from "lucide-react";
import { normalTheme } from "@/themes/normalTheme";

const highlights = [
  { label: "Fresh Daily Produce", desc: "Sourced fresh every morning", icon: UtensilsCrossed },
  { label: "Fair Neighborhood Pricing", desc: "No marked-up rates", icon: Store },
  { label: "Fast Doorstep Dispatch", desc: "Direct from local shopkeeper", icon: Truck },
  { label: "Cash & UPI Accepted", desc: "Flexible payment methods", icon: CheckCircle2 },
  { label: "Friendly Community Service", desc: "Shop with familiar local merchants", icon: HeartHandshake },
];

export function NormalHighlights() {
  return (
    <section
      aria-labelledby="normal-highlights-heading"
      className="rounded-[2rem] border border-stone-200/90 bg-stone-50/70 p-5 sm:p-6 dark:border-stone-800 dark:bg-stone-900/60"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="normal-highlights-heading"
          className="text-base font-bold text-stone-900 dark:text-stone-50 sm:text-lg"
        >
          Why Neighbors Shop at This Store
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Dependable everyday grocery fulfillment directly in your locality
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {highlights.map(({ label, desc, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-2xl border border-stone-200/80 bg-white px-3.5 py-2 text-xs shadow-xs transition hover:border-emerald-300 dark:border-stone-800 dark:bg-stone-850"
          >
            <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-stone-800 dark:text-stone-100">{label}</p>
              <p className="text-[10px] text-stone-400">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
