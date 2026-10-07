"use client";

import { useMemo } from "react";
import { ArrowRight, Layers3, PackageOpen } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";
import type { ProductItem } from "@/types/marketplace";
import { VerifiedSectionHeader } from "./VerifiedSectionHeader";

interface VerifiedCollectionsProps {
  products: ProductItem[];
  onSelectCategory?: (category: string) => void;
  activeCategory?: string | null;
}

const normalizeSlug = (value?: string) =>
  (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "all";

export function VerifiedCollections({ products, onSelectCategory, activeCategory }: VerifiedCollectionsProps) {
  // Dynamically extract categories from the store's actual products
  const collections = useMemo(() => {
    const map = new Map<string, { title: string; slug: string; count: number; image?: string }>();

    for (const product of products) {
      const rawCategory = product.category || (product as any).categoryName || (product as any).categoryId;
      const title = typeof rawCategory === "string" && rawCategory.trim() ? rawCategory.trim() : "Fresh Essentials";
      const slug = normalizeSlug(title);

      const existing = map.get(slug);
      const img = product.image?.url || product.thumbnail || product.images?.[0];

      if (existing) {
        existing.count += 1;
        if (!existing.image && img) existing.image = img;
      } else {
        map.set(slug, {
          title,
          slug,
          count: 1,
          image: img,
        });
      }
    }

    const items = Array.from(map.values());

    // Fallback if store has only 1 category or generic items
    if (items.length <= 1 && products.length >= 2) {
      const bestSellers = products.filter((p) => Number(p.rating ?? 0) >= 4);
      const deals = products.filter((p) => typeof p.discountPrice === "number" && p.discountPrice < (p.price ?? 0));

      const fallbacks = [
        {
          title: "All Verified Products",
          slug: "all",
          count: products.length,
          image: products[0]?.image?.url || products[0]?.thumbnail,
        },
      ];

      if (bestSellers.length) {
        fallbacks.push({
          title: "Top Rated Essentials",
          slug: "featured",
          count: bestSellers.length,
          image: bestSellers[0]?.image?.url || bestSellers[0]?.thumbnail,
        });
      }

      if (deals.length) {
        fallbacks.push({
          title: "Daily Value Deals",
          slug: "deals",
          count: deals.length,
          image: deals[0]?.image?.url || deals[0]?.thumbnail,
        });
      }

      return fallbacks;
    }

    return items;
  }, [products]);

  if (!collections.length) return null;

  return (
    <section className="space-y-4" aria-labelledby="verified-collections-heading">
      <div className="flex items-center justify-between">
        <VerifiedSectionHeader
          icon={Layers3}
          title="Featured Aisles & Categories"
          subtitle="Explore organized grocery aisles from this verified store."
        />
        <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium hidden sm:inline">
          Click any aisle to filter products
        </span>
      </div>

      <div className="flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {collections.map(({ title, slug, count, image }) => {
          const isSelected = activeCategory === slug;

          return (
            <button
              key={slug}
              type="button"
              onClick={() => onSelectCategory?.(slug === "all" ? "" : slug)}
              className={`group relative flex min-h-[180px] min-w-[250px] snap-start flex-col justify-between overflow-hidden rounded-3xl border p-5 text-left transition-all duration-300 ${
                isSelected
                  ? "border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500 shadow-md shadow-emerald-500/20"
                  : "border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white shadow-sm hover:border-emerald-400 hover:shadow-md dark:border-emerald-300/40 dark:bg-gradient-to-br dark:from-emerald-950 dark:via-teal-950 dark:to-slate-950"
              }`}
            >
              {image ? (
                <img
                  src={image}
                  alt={title}
                  className="absolute inset-0 h-full w-full object-cover opacity-20 dark:opacity-25 transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.3),transparent_50%)]" />
              )}
              <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/50" />

              <div className="relative flex items-center justify-between w-full">
                <PackageOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
                <span className="rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-300/80 px-2.5 py-0.5 text-[10px] font-bold shadow-xs dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-400/30">
                  {count} {count === 1 ? "Item" : "Items"}
                </span>
              </div>

              <div className="relative mt-auto pt-4">
                <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-200 transition-colors">
                  {title}
                </h3>
                <div className="mt-1.5 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <span>View Aisle</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
