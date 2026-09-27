"use client";

import { Store, ShoppingBag, Zap, CheckCircle2 } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: Store,
      title: "Select your neighborhood store",
      description:
        "Choose from verified Kirana shops, dairies, and supermarkets in your sector of Sheopur.",
      badge: "Real Local Shops",
    },
    {
      number: "02",
      icon: ShoppingBag,
      title: "Handpicked with quality care",
      description:
        "Local merchants carefully pick and pack fresh vegetables, unblemished fruits, and pantry staples.",
      badge: "Freshness Guaranteed",
    },
    {
      number: "03",
      icon: Zap,
      title: "Fast 15–30 min delivery",
      description:
        "A dedicated delivery rider brings your order straight to your doorstep with live SMS & status tracking.",
      badge: "Hygienic & Contactless",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-stone-800 bg-gradient-to-b from-stone-900/90 via-stone-950 to-stone-950 p-6 sm:p-10 lg:p-12 shadow-md">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Simple & Transparent
        </span>
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          How SheoMart works in 3 easy steps
        </h2>
        <p className="text-sm text-stone-400">
          Bridging the warmth of local neighborhood shopping with modern quick-commerce speed.
        </p>
      </div>

      <div className="relative mt-10 grid gap-6 md:grid-cols-3">
        {/* Timeline connector line behind cards (desktop) */}
        <div className="pointer-events-none absolute left-12 right-12 top-1/2 -translate-y-12 hidden h-0.5 bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-emerald-500/40 md:block" />

        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="relative flex flex-col justify-between rounded-3xl border border-stone-800 bg-stone-900/90 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/40 hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 font-bold shadow-inner">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-2xl font-black text-stone-700">
                    {step.number}
                  </span>
                </div>

                <div className="mt-5">
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                    {step.badge}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-stone-300">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
