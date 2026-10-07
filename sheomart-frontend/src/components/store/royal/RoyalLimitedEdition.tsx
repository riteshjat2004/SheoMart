"use client";

import { useMemo } from "react";
import { Crown, Sparkles, Timer } from "lucide-react";
import { royalTheme } from "./royalTheme";
import { ProductCard } from "@/components/marketplace/ProductCard";
import type { ProductItem } from "@/types/marketplace";

export function RoyalLimitedEdition({ products }: { products: ProductItem[] }) {
  const items = useMemo(() => {
    if (!products.length) return [];
    // Prioritize rare/low stock items (< 15 stock) or high-ticket flagship items
    const sorted = [...products].sort((a, b) => {
      const aStock = a.variants?.[0]?.stock ?? a.quantity;
      const bStock = b.variants?.[0]?.stock ?? b.quantity;
      const aIsLowStock = typeof aStock === "number" && aStock > 0 && aStock < 15 ? 15 : 0;
      const bIsLowStock = typeof bStock === "number" && bStock > 0 && bStock < 15 ? 15 : 0;
      const aScore = aIsLowStock + (a.discountPrice ? 5 : 0) + (a.isFeatured ? 6 : 0) + (Number(a.price ?? 0) * 0.01);
      const bScore = bIsLowStock + (b.discountPrice ? 5 : 0) + (b.isFeatured ? 6 : 0) + (Number(b.price ?? 0) * 0.01);
      return bScore - aScore;
    });
    return sorted.slice(0, 4);
  }, [products]);

  if (!items.length) return null;

  return (
    <section className="space-y-4" aria-labelledby="royal-limited-heading">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${royalTheme.accent}`}>
            <Sparkles className="h-3.5 w-3.5" />
            Curated Rarity & Reserve
          </p>
          <h2 id="royal-limited-heading" className={`mt-1 text-2xl font-bold tracking-tight ${royalTheme.panelText}`}>
            Limited Edition & Prime Reserve
          </h2>
        </div>
        <p className="text-xs text-amber-900/70 dark:text-amber-200/70 font-medium">
          Seasonal rarities and exclusive harvests available while quantities last
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((product) => (
          <div key={product.productId ?? product.name} className="relative">
            <ProductCard product={product} storeBadge="royal" />
          </div>
        ))}
      </div>
    </section>
  );
}
