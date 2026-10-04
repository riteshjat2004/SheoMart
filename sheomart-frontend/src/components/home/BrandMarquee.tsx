"use client";

import { Sparkles } from "lucide-react";

interface BrandItem {
  name: string;
  category: string;
  color: string;
}

const BRANDS: BrandItem[] = [
  { name: "Amul", category: "Dairy & Butter", color: "from-blue-500/20 to-indigo-500/10" },
  { name: "Aashirvaad", category: "Atta & Staples", color: "from-amber-500/20 to-orange-500/10" },
  { name: "Fortune", category: "Oils & Grains", color: "from-yellow-500/20 to-amber-500/10" },
  { name: "Tata Sampann", category: "Pulses & Spices", color: "from-emerald-500/20 to-teal-500/10" },
  { name: "Mother Dairy", category: "Milk & Ice Cream", color: "from-blue-600/20 to-cyan-500/10" },
  { name: "Nestlé", category: "Coffee & Dairy", color: "from-red-500/20 to-pink-500/10" },
  { name: "Britannia", category: "Biscuits & Breads", color: "from-rose-500/20 to-orange-500/10" },
  { name: "Dabur", category: "Health & Honey", color: "from-green-500/20 to-emerald-500/10" },
  { name: "Haldiram's", category: "Namkeen & Sweets", color: "from-orange-500/20 to-amber-500/10" },
  { name: "Cadbury", category: "Chocolates", color: "from-purple-500/20 to-indigo-500/10" },
  { name: "Parle", category: "Biscuits & Confectionery", color: "from-yellow-600/20 to-orange-500/10" },
  { name: "Dettol", category: "Home & Hygiene", color: "from-teal-500/20 to-green-500/10" },
];

export function BrandMarquee() {
  // Duplicate for seamless infinite loop
  const marqueeList = [...BRANDS, ...BRANDS];

  return (
    <section className="relative overflow-hidden py-4 border-y border-stone-200/80 bg-stone-100/50 backdrop-blur-sm dark:border-stone-800/80 dark:bg-stone-950/60">
      <div className="flex items-center gap-3 px-4 sm:px-6 mb-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <Sparkles className="h-3.5 w-3.5" />
          Featured Neighborhood Brands
        </span>
        <span className="text-xs text-stone-500 dark:text-stone-400">• 100% Genuine Direct from Authorized Distributors</span>
      </div>

      <div className="relative flex overflow-hidden">
        {/* Left and right fade gradient masks */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-[#FBFBF9] dark:from-stone-950 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-[#FBFBF9] dark:from-stone-950 to-transparent" />

        <div className="animate-marquee flex items-center gap-4 py-1">
          {marqueeList.map((brand, idx) => (
            <div
              key={`${brand.name}-${idx}`}
              className={`flex items-center gap-3 rounded-2xl border border-stone-200/90 bg-white/95 px-5 py-3 text-stone-800 shadow-sm transition-all hover:scale-105 hover:border-emerald-500/50 hover:shadow-md cursor-pointer shrink-0 dark:border-stone-800 dark:bg-gradient-to-r ${brand.color} dark:text-stone-200 dark:hover:border-emerald-500/40 dark:hover:text-white`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 text-sm font-bold text-stone-900 border border-stone-200/80 shadow-xs dark:bg-stone-900/90 dark:text-white dark:border-transparent dark:shadow-inner">
                {brand.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold tracking-wide text-stone-900 dark:text-white">{brand.name}</p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">{brand.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
