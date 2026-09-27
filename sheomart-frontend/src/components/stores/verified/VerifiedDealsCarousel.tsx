"use client";

import { BadgePercent } from "lucide-react";
import { ProductCard } from "@/components/marketplace/ProductCard";
import type { ProductItem } from "@/types/marketplace";
import { VerifiedSectionHeader } from "./VerifiedSectionHeader";

export function VerifiedDealsCarousel({ products }: { products: ProductItem[] }) {
  const deals = products.filter((product) => product.discountPrice || product.discount).slice(0, 8);
  if (!deals.length) return null;

  return (
    <section className="space-y-4" aria-labelledby="verified-deals-heading">
      <VerifiedSectionHeader
        icon={BadgePercent}
        title="Verified Daily Deals"
        subtitle="Save on fresh essentials with verified local store pricing."
      />
      <h2 id="verified-deals-heading" className="sr-only">
        Verified daily deals
      </h2>

      <div className="flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {deals.map((product) => (
          <div key={product.productId ?? product.name} className="w-[240px] shrink-0 snap-start sm:w-[260px]">
            <ProductCard product={product} storeBadge="verified" />
          </div>
        ))}
      </div>
    </section>
  );
}
