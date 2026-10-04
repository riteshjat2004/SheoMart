"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface CollectionTile {
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  gradient: string;
  link: string;
}

const COLLECTIONS: CollectionTile[] = [
  {
    title: "Morning Breakfast Essentials",
    subtitle: "Milk, fresh bread, butter, eggs, poha & tea",
    badge: "Daily Fresh",
    icon: "🥛",
    gradient: "from-blue-50/80 via-white to-indigo-50/40 border-blue-200/80 text-stone-900 shadow-sm dark:from-blue-900/60 dark:via-stone-900 dark:to-stone-950 dark:border-blue-500/30 dark:text-white dark:shadow-md",
    link: "/explore?query=breakfast",
  },
  {
    title: "Farm Fresh Veggies & Greens",
    subtitle: "Handpicked tomatoes, potatoes, ginger & leafy greens",
    badge: "100% Farm Sourced",
    icon: "🥬",
    gradient: "from-emerald-50/80 via-white to-teal-50/40 border-emerald-200/80 text-stone-900 shadow-sm dark:from-emerald-900/60 dark:via-stone-900 dark:to-stone-950 dark:border-emerald-500/30 dark:text-white dark:shadow-md",
    link: "/explore?category=vegetables",
  },
  {
    title: "Daily Kitchen Staples & Dal",
    subtitle: "Sharbati atta, fragrant basmati, pure pulses & mustard oil",
    badge: "Pantry Best Sellers",
    icon: "🌾",
    gradient: "from-amber-50/80 via-white to-yellow-50/40 border-amber-200/80 text-stone-900 shadow-sm dark:from-amber-900/60 dark:via-stone-900 dark:to-stone-950 dark:border-amber-500/30 dark:text-white dark:shadow-md",
    link: "/explore?category=staples",
  },
  {
    title: "Evening Chai & Crispy Munchies",
    subtitle: "Aloo bhujia, cookies, rusk, peanuts & mixtures",
    badge: "Teatime Specials",
    icon: "☕️",
    gradient: "from-orange-50/80 via-white to-amber-50/40 border-orange-200/80 text-stone-900 shadow-sm dark:from-orange-900/60 dark:via-stone-900 dark:to-stone-950 dark:border-orange-500/30 dark:text-white dark:shadow-md",
    link: "/explore?query=snacks",
  },
  {
    title: "Chilled Drinks & Energy",
    subtitle: "Sodas, fruit juices, lassi, glucose & bottled water",
    badge: "Ice Cold",
    icon: "🧃",
    gradient: "from-cyan-50/80 via-white to-blue-50/40 border-cyan-200/80 text-stone-900 shadow-sm dark:from-cyan-900/60 dark:via-stone-900 dark:to-stone-950 dark:border-cyan-500/30 dark:text-white dark:shadow-md",
    link: "/explore?category=beverages",
  },
  {
    title: "Home Hygiene & Clean Living",
    subtitle: "Floor cleaners, detergents, soaps & sanitizers",
    badge: "Sparkling Home",
    icon: "🧴",
    gradient: "from-teal-50/80 via-white to-emerald-50/40 border-teal-200/80 text-stone-900 shadow-sm dark:from-teal-900/60 dark:via-stone-900 dark:to-stone-950 dark:border-teal-500/30 dark:text-white dark:shadow-md",
    link: "/explore?query=cleaning",
  },
];

export function ShoppingCollections() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Curated Collections
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl dark:text-white">
            Shop by your everyday routines
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Smart bundles curated for speed, convenience, and wholesome living in Sheopur.
          </p>
        </div>

        <Link
          href="/explore"
          className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          Explore All Items <ArrowRight className="ml-1.5 h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COLLECTIONS.map((item) => (
          <Link
            key={item.title}
            href={item.link}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-br ${item.gradient} p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-stone-200/70 bg-white/90 px-3 py-1 text-xs font-semibold text-stone-800 shadow-xs backdrop-blur-md dark:border-transparent dark:bg-white/10 dark:text-white">
                  {item.badge}
                </span>
                <span className="text-3xl transition-transform duration-300 group-hover:scale-125">
                  {item.icon}
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold text-stone-900 group-hover:text-emerald-600 transition-colors dark:text-white dark:group-hover:text-emerald-300">
                {item.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                {item.subtitle}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-stone-900 dark:text-white">
              <span>Explore collection</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 text-emerald-600 dark:text-emerald-400" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
