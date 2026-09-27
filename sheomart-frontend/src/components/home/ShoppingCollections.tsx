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
    gradient: "from-blue-900/60 via-stone-900 to-stone-950 border-blue-500/30",
    link: "/explore?query=breakfast",
  },
  {
    title: "Farm Fresh Veggies & Greens",
    subtitle: "Handpicked tomatoes, potatoes, ginger & leafy greens",
    badge: "100% Farm Sourced",
    icon: "🥬",
    gradient: "from-emerald-900/60 via-stone-900 to-stone-950 border-emerald-500/30",
    link: "/explore?category=vegetables",
  },
  {
    title: "Daily Kitchen Staples & Dal",
    subtitle: "Sharbati atta, fragrant basmati, pure pulses & mustard oil",
    badge: "Pantry Best Sellers",
    icon: "🌾",
    gradient: "from-amber-900/60 via-stone-900 to-stone-950 border-amber-500/30",
    link: "/explore?category=staples",
  },
  {
    title: "Evening Chai & Crispy Munchies",
    subtitle: "Aloo bhujia, cookies, rusk, peanuts & mixtures",
    badge: "Teatime Specials",
    icon: "☕️",
    gradient: "from-orange-900/60 via-stone-900 to-stone-950 border-orange-500/30",
    link: "/explore?query=snacks",
  },
  {
    title: "Chilled Drinks & Energy",
    subtitle: "Sodas, fruit juices, lassi, glucose & bottled water",
    badge: "Ice Cold",
    icon: "🧃",
    gradient: "from-cyan-900/60 via-stone-900 to-stone-950 border-cyan-500/30",
    link: "/explore?category=beverages",
  },
  {
    title: "Home Hygiene & Clean Living",
    subtitle: "Floor cleaners, detergents, soaps & sanitizers",
    badge: "Sparkling Home",
    icon: "🧴",
    gradient: "from-teal-900/60 via-stone-900 to-stone-950 border-teal-500/30",
    link: "/explore?query=cleaning",
  },
];

export function ShoppingCollections() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            Curated Collections
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Shop by your everyday routines
          </h2>
          <p className="text-sm text-stone-400">
            Smart bundles curated for speed, convenience, and wholesome living in Sheopur.
          </p>
        </div>

        <Link
          href="/explore"
          className="inline-flex items-center text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Explore All Items <ArrowRight className="ml-1.5 h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COLLECTIONS.map((item) => (
          <Link
            key={item.title}
            href={item.link}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-br ${item.gradient} p-6 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                  {item.badge}
                </span>
                <span className="text-3xl transition-transform duration-300 group-hover:scale-125">
                  {item.icon}
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                {item.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-stone-300">
                {item.subtitle}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-white">
              <span>Explore collection</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 text-emerald-400" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
