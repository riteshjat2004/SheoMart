"use client";

import { useState } from "react";
import { Bell, Check, Crown, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { royalTheme } from "./royalTheme";
import { RoyalSectionHeader } from "./RoyalSectionHeader";
import type { ProductItem } from "@/types/marketplace";

export function RoyalLaunches({ products }: { products: ProductItem[] }) {
  const [notified, setNotified] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const product = products[0];
  if (!product) return null;
  const image = product.image?.url || product.thumbnail || product.images?.[0];

  return (
    <section className="space-y-4" aria-labelledby="royal-launch-heading">
      <RoyalSectionHeader
        title="Exclusive Royal Launches"
        subtitle="First access to considered new arrivals and rare seasonal drops."
      />
      <div
        className={`relative isolate overflow-hidden rounded-[2rem] border border-amber-400/40 p-6 sm:p-9 shadow-xl shadow-black/60 ${royalTheme.panel}`}
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_20%,rgba(212,175,55,0.22),transparent_40%)]" />

        <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-black">
            {image ? (
              <img
                src={image}
                alt={product.name}
                className="h-64 w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="h-64 rounded-3xl bg-stone-900" />
            )}
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-amber-400/60 bg-black/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Limited Allocation
            </span>
          </div>

          <div>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold text-amber-200 ${royalTheme.badge}`}>
              <Crown className="h-3.5 w-3.5 fill-amber-400" />
              Next Flagship Drop
            </span>

            <h2 id="royal-launch-heading" className="mt-3 text-2xl font-extrabold text-stone-900 dark:text-white sm:text-3xl">
              {product.name}
            </h2>

            <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
              Hand-curated for peak season release. Only a limited number of units are reserved for SheoMart Royal patrons.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-900 dark:border-amber-400/30 dark:bg-stone-900/90 dark:text-amber-200">
                Dropping This Friday
              </span>

              <button
                type="button"
                aria-label="Add launch to wishlist"
                onClick={() => setWishlisted(!wishlisted)}
                className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all ${
                  wishlisted
                    ? "border-red-400 bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400"
                    : "border-amber-300 bg-white text-stone-600 hover:border-amber-400 hover:text-amber-700 dark:border-amber-400/40 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-amber-400 dark:hover:text-amber-300"
                }`}
              >
                <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
              </button>

              <Button
                type="button"
                onClick={() => setNotified(true)}
                className={`font-bold transition-all ${
                  notified
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-stone-950 shadow-md shadow-amber-500/20 hover:from-amber-300 hover:to-yellow-300"
                }`}
              >
                {notified ? (
                  <>
                    <Check className="mr-1.5 h-4 w-4" /> You're on the VIP List
                  </>
                ) : (
                  <>
                    <Bell className="mr-1.5 h-4 w-4" /> Notify Me on Release
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
