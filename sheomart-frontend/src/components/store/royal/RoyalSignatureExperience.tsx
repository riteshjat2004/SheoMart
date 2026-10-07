"use client";

import { useState } from "react";
import { Crown, Gift, PackageCheck, ShieldCheck, Sparkles, Truck, Zap } from "lucide-react";
import { royalTheme } from "./royalTheme";

const PILLARS = [
  {
    id: "packaging",
    icon: Gift,
    title: "Signature Bespoke Packaging",
    tag: "Luxury Presentation",
    subtitle: "Every item arrives pristine with thermal liners & satin seal.",
    detail:
      "All fragile and organic goods are packaged in custom insulated boxes with tamper-proof security seals to guarantee peak freshness and boutique unboxing aesthetics.",
  },
  {
    id: "dispatch",
    icon: Zap,
    title: "Priority Flagship Dispatch",
    tag: "Sub-30 Min VIP Route",
    subtitle: "Direct dedicated riders assigned straight from this store.",
    detail:
      "Royal orders bypass standard dispatch queues. Dedicated drivers handle your basket directly from counter to doorstep with live temperature verification.",
  },
  {
    id: "quality",
    icon: ShieldCheck,
    title: "Certified Origin & Purity",
    tag: "Double Inspected",
    subtitle: "100% verified farm origin and luxury batch curation.",
    detail:
      "Every product bearing the Royal badge has undergone rigorous inspection for grade, certification, and exact weight before leaving the merchant counter.",
  },
  {
    id: "service",
    icon: Sparkles,
    title: "White-Glove Guarantee",
    tag: "No-Questions Return",
    subtitle: "Immediate replacement or refund on any unsatisfactory item.",
    detail:
      "If any selection does not meet your discerning standards, our concierge processes an immediate replacement or full credit with zero friction.",
  },
];

export function RoyalSignatureExperience() {
  const [activeTab, setActiveTab] = useState("packaging");
  const selectedPillar = PILLARS.find((p) => p.id === activeTab) || PILLARS[0];
  const Icon = selectedPillar.icon;

  return (
    <section className="space-y-5" aria-labelledby="royal-experience-heading">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${royalTheme.accent}`}>
            <Crown className="h-3.5 w-3.5" />
            The Royal Standard
          </p>
          <h2 id="royal-experience-heading" className={`mt-1 text-2xl font-bold tracking-tight ${royalTheme.panelText}`}>
            Flagship Shopping Experience
          </h2>
        </div>
        <p className="text-xs text-amber-900/70 dark:text-amber-200/70 font-medium">
          Premium service standards applied to every royal order
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        {/* 4 Interactive Feature Pillars */}
        <div className="grid gap-3 sm:grid-cols-2">
          {PILLARS.map(({ id, icon: PillarIcon, title, tag, subtitle }) => {
            const isSelected = activeTab === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`group flex flex-col justify-between rounded-3xl border p-5 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/80 shadow-md shadow-amber-500/15"
                    : "border-amber-300/80 bg-white/95 dark:border-amber-400/35 dark:bg-stone-950/80 hover:border-amber-400 hover:bg-amber-50/50"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ${
                      isSelected
                        ? "border-amber-400 bg-amber-500 text-stone-950"
                        : "border-amber-300/80 bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-stone-950"
                    }`}
                  >
                    <PillarIcon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-amber-100/80 px-2 py-0.5 text-[10px] font-bold text-amber-950 dark:bg-stone-900 dark:text-amber-300 border border-amber-300/50">
                    {tag}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white group-hover:text-amber-800 dark:group-hover:text-amber-200 transition-colors">
                    {title}
                  </h3>
                  <p className="mt-1 text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Pillar Detailed Showcase Card */}
        <div
          className={`relative overflow-hidden rounded-3xl border border-amber-300/80 p-7 sm:p-8 shadow-xl shadow-amber-500/10 dark:border-amber-400/50 dark:shadow-black/50 flex flex-col justify-between ${royalTheme.panel}`}
        >
          <div className="pointer-events-none absolute -right-10 -bottom-10 h-56 w-56 rounded-full bg-amber-400/15 blur-3xl" />

          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-amber-400">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>{selectedPillar.tag}</span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-stone-950 shadow-md">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white">
                {selectedPillar.title}
              </h3>
            </div>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-stone-700 dark:text-stone-200">
              {selectedPillar.detail}
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-amber-200/80 dark:border-amber-400/20 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900/80 dark:text-amber-200/80 font-medium">
            <span className="flex items-center gap-1.5">
              <PackageCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Included with every Royal cart
            </span>
            <span className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
              <Truck className="h-4 w-4" /> Live Tracking Active
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
