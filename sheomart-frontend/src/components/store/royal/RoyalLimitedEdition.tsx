import { Crown, Sparkles } from "lucide-react";
import { royalTheme } from "./royalTheme";
import { ProductCard } from "@/components/marketplace/ProductCard";
import type { ProductItem } from "@/types/marketplace";

export function RoyalLimitedEdition({ products }: { products: ProductItem[] }) {
  const items = products.slice(0, 4);
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
            Limited Edition Showcase
          </h2>
        </div>
        <p className="text-xs text-stone-400">Seasonal rarities and exclusive harvests available while quantities last.</p>
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
