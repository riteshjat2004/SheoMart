import { Check, Crown, PackageCheck, Rocket, Sparkles, Truck } from "lucide-react";
import { royalTheme } from "./royalTheme";

const steps = [
  { icon: Check, step: "01", label: "Instant Order Lock", desc: "Reserved immediately" },
  { icon: PackageCheck, step: "02", label: "Luxury Hand-Packing", desc: "Matte box & seal" },
  { icon: Rocket, step: "03", label: "Priority Dispatch", desc: "Fast-tracked dispatch" },
  { icon: Truck, step: "04", label: "Concierge In-Transit", desc: "Live GPS monitoring" },
  { icon: Crown, step: "05", label: "White-Glove Delivery", desc: "Direct to your doorstep" },
  { icon: Sparkles, step: "06", label: "Royal Delight", desc: "Flawless experience" },
];

export function RoyalShoppingTimeline() {
  return (
    <section
      className={`rounded-[2rem] border border-amber-400/40 p-6 sm:p-8 shadow-lg shadow-black/50 ${royalTheme.panel}`}
      aria-labelledby="royal-timeline-heading"
    >
      <div>
        <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${royalTheme.accent}`}>
          <Crown className="h-3.5 w-3.5" />
          The Fulfilment Journey
        </p>
        <h2 id="royal-timeline-heading" className={`mt-1 text-2xl font-bold tracking-tight ${royalTheme.panelText}`}>
          Royal Shopping Timeline
        </h2>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
        {steps.map(({ icon: Icon, step, label, desc }, index) => (
          <div key={label} className="relative flex flex-col items-center text-center">
            {/* Step Avatar */}
            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-amber-400/80 bg-stone-950 text-amber-300 shadow-[0_0_16px_rgba(212,175,55,0.3)]">
              <Icon className="h-5 w-5" />
            </div>

            {/* Connecting Line for Desktop */}
            {index < steps.length - 1 ? (
              <span
                className="hidden h-0.5 bg-gradient-to-r from-amber-400/60 to-amber-400/20 lg:absolute lg:left-1/2 lg:top-6 lg:block lg:w-full"
                aria-hidden="true"
              />
            ) : null}

            <span className="mt-3 text-[10px] font-mono font-bold text-amber-400/80">STEP {step}</span>
            <p className="mt-0.5 text-xs font-bold text-white">{label}</p>
            <p className="mt-1 text-[11px] text-stone-400">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
