"use client";

import {
  Apple,
  Cookie,
  Flame,
  Milk,
  Package,
  ShoppingBasket,
  Sparkles,
  Utensils,
  Wheat,
} from "lucide-react";
import type { ProductItem } from "@/types/marketplace";

interface CollectionItem {
  id: string;
  name: string;
  icon: typeof ShoppingBasket;
  bgGradient: string;
  tagColor: string;
}

const GROCERY_COLLECTIONS: CollectionItem[] = [
  {
    id: "vegetables",
    name: "Fresh Vegetables",
    icon: Apple,
    bgGradient: "from-emerald-500/15 via-teal-500/10 to-emerald-50/50 dark:from-emerald-950/60 dark:to-stone-900",
    tagColor: "text-emerald-700 bg-emerald-100/80 dark:text-emerald-300 dark:bg-emerald-950",
  },
  {
    id: "dairy",
    name: "Dairy & Milk",
    icon: Milk,
    bgGradient: "from-sky-500/15 via-blue-500/10 to-sky-50/50 dark:from-sky-950/60 dark:to-stone-900",
    tagColor: "text-sky-700 bg-sky-100/80 dark:text-sky-300 dark:bg-sky-950",
  },
  {
    id: "snacks",
    name: "Snacks & Munchies",
    icon: Cookie,
    bgGradient: "from-orange-500/15 via-amber-500/10 to-orange-50/50 dark:from-orange-950/60 dark:to-stone-900",
    tagColor: "text-orange-700 bg-orange-100/80 dark:text-orange-300 dark:bg-orange-950",
  },
  {
    id: "kitchen-items",
    name: "Kitchen Staples & Atta",
    icon: Wheat,
    bgGradient: "from-amber-500/15 via-yellow-500/10 to-amber-50/50 dark:from-amber-950/60 dark:to-stone-900",
    tagColor: "text-amber-700 bg-amber-100/80 dark:text-amber-300 dark:bg-amber-950",
  },
  {
    id: "household",
    name: "Household Needs",
    icon: Utensils,
    bgGradient: "from-purple-500/15 via-pink-500/10 to-purple-50/50 dark:from-purple-950/60 dark:to-stone-900",
    tagColor: "text-purple-700 bg-purple-100/80 dark:text-purple-300 dark:bg-purple-950",
  },
  {
    id: "featured",
    name: "Store Best Deals",
    icon: Flame,
    bgGradient: "from-rose-500/15 via-red-500/10 to-rose-50/50 dark:from-rose-950/60 dark:to-stone-900",
    tagColor: "text-rose-700 bg-rose-100/80 dark:text-rose-300 dark:bg-rose-950",
  },
];

export function NormalCollections({
  products,
  onSelectCategory,
}: {
  products: ProductItem[];
  onSelectCategory?: (category: string) => void;
}) {
  return (
    <section aria-label="Store Grocery Aisles" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            Everyday Aisles
          </p>
          <h2 className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-50">
            Shop by Store Category
          </h2>
        </div>
        <span className="text-xs text-stone-500 dark:text-stone-400">
          Fresh stock daily
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {GROCERY_COLLECTIONS.map(({ id, name, icon: Icon, bgGradient, tagColor }) => {
          // Count matching products
          const count = products.filter((p) => {
            const cat = (p.category ?? "").toLowerCase();
            return cat.includes(id) || (id === "featured" && Boolean(p.discount || p.discountPrice));
          }).length;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectCategory?.(id)}
              className={`group flex flex-col items-center justify-center rounded-2xl border border-stone-200/90 bg-gradient-to-br ${bgGradient} p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md dark:border-stone-800`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform duration-200 group-hover:scale-110 dark:bg-stone-800">
                <Icon className="h-6 w-6 text-stone-700 dark:text-stone-200" />
              </div>
              <p className="mt-3 line-clamp-1 text-xs font-bold text-stone-900 dark:text-stone-100">
                {name}
              </p>
              <span className={`mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tagColor}`}>
                {count > 0 ? `${count} items` : "Explore"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
