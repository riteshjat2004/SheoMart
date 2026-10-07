"use client";

import { useMemo } from "react";
import { ArrowRight, Crown, Sparkles } from "lucide-react";
import { royalTheme } from "./royalTheme";
import type { ProductItem } from "@/types/marketplace";

interface RoyalCollectionsProps {
  products: ProductItem[];
  onSelectCategory?: (category: string) => void;
  activeCategory?: string | null;
}

const LUXURY_TAGS = [
  "Handpicked Reserve",
  "Artisan Selection",
  "Fresh Harvest",
  "Flagship Pantry",
  "Connoisseur's Choice",
  "Gourmet Reserve",
];

const normalizeSlug = (value?: string) =>
  (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "all";

export function RoyalCollections({ products, onSelectCategory, activeCategory }: RoyalCollectionsProps) {
  // Dynamically derive collections from the store's actual products
  const collections = useMemo(() => {
    const map = new Map<string, { name: string; slug: string; count: number; image?: string }>();

    for (const product of products) {
      const rawCategory = product.category || (product as any).categoryName || (product as any).categoryId;
      const catName = typeof rawCategory === "string" && rawCategory.trim() ? rawCategory.trim() : "Flagship Pantry";
      const slug = normalizeSlug(catName);

      const existing = map.get(slug);
      const img = product.image?.url || product.thumbnail || product.images?.[0];

      if (existing) {
        existing.count += 1;
        if (!existing.image && img) existing.image = img;
      } else {
        map.set(slug, {
          name: catName,
          slug,
          count: 1,
          image: img,
        });
      }
    }

    const items = Array.from(map.values());

    // If only 1 category exists, create smart curated collections from product attributes
    if (items.length <= 1 && products.length >= 2) {
      const bestSellers = products.filter((p) => Number(p.rating ?? 0) >= 4);
      const deals = products.filter((p) => typeof p.discountPrice === "number" && p.discountPrice < (p.price ?? 0));

      const fallbackCollections = [
        {
          name: "All Flagship Provisions",
          slug: "all",
          count: products.length,
          image: products[0]?.image?.url || products[0]?.thumbnail,
        },
      ];

      if (bestSellers.length) {
        fallbackCollections.push({
          name: "Connoisseur's Bestsellers",
          slug: "featured",
          count: bestSellers.length,
          image: bestSellers[0]?.image?.url || bestSellers[0]?.thumbnail,
        });
      }

      if (deals.length) {
        fallbackCollections.push({
          name: "Curated Royal Deals",
          slug: "deals",
          count: deals.length,
          image: deals[0]?.image?.url || deals[0]?.thumbnail,
        });
      }

      return fallbackCollections;
    }

    return items;
  }, [products]);

  if (!collections.length) return null;

  return (
    <section className="space-y-4" aria-labelledby="royal-collections-heading">
      <div className="flex items-center justify-between">
        <div>
          <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${royalTheme.accent}`}>
            <Crown className="h-3.5 w-3.5" />
            Curated Themes & Aisles
          </p>
          <h2 id="royal-collections-heading" className={`mt-1 text-2xl font-bold tracking-tight ${royalTheme.panelText}`}>
            Royal Flagship Collections
          </h2>
        </div>
        <span className="text-xs text-amber-800 dark:text-amber-200/70 hidden sm:inline font-medium">
          Click any aisle to view products
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {collections.map(({ name, slug, count, image }, index) => {
          const isSelected = activeCategory === slug;
          const tag = LUXURY_TAGS[index % LUXURY_TAGS.length];

          return (
            <button
              key={slug}
              type="button"
              onClick={() => onSelectCategory?.(slug === "all" ? "" : slug)}
              className={`group relative flex min-h-[210px] min-w-[270px] flex-col justify-between overflow-hidden rounded-3xl border p-6 text-left shadow-md transition-all duration-300 ${
                isSelected
                  ? "border-amber-400 bg-amber-500/10 ring-2 ring-amber-400 shadow-amber-500/20"
                  : "border-amber-300/80 bg-white/95 dark:border-amber-400/35 dark:bg-stone-950/80 shadow-amber-500/10 hover:border-amber-400 hover:shadow-lg hover:-translate-y-0.5"
              }`}
            >
              {/* Product Background Image */}
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="absolute inset-0 h-full w-full object-cover opacity-20 dark:opacity-25 transition-transform duration-700 group-hover:scale-110"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-stone-950 dark:via-stone-950/85 dark:to-transparent" />

              <div className="relative flex items-center justify-between w-full">
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-950 shadow-xs dark:border-amber-400/40 dark:bg-black/70 dark:text-amber-300">
                  <Sparkles className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400" />
                  {tag}
                </span>
                <Crown
                  className={`h-5 w-5 transition-colors ${
                    isSelected
                      ? "text-amber-500"
                      : "text-amber-500/70 group-hover:text-amber-600 dark:text-amber-400/70 dark:group-hover:text-amber-300"
                  }`}
                />
              </div>

              <div className="relative mt-auto pt-6">
                <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-800 dark:text-white dark:group-hover:text-amber-200 transition-colors">
                  {name}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-amber-900/80 dark:text-amber-300/80">
                    {count} {count === 1 ? "Selection" : "Selections"}
                  </p>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                    Explore <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
