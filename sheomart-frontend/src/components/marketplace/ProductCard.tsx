import { Star } from "lucide-react";
import type { ProductItem } from "@/types/marketplace";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: ProductItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const discountPercent = product.discount ?? (product.discountPrice && product.price ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0);
  const displayPrice = product.discountPrice ?? product.price;
  const imageSrc = product.thumbnail || product.images?.[0] || "";

  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-stone-800 dark:bg-stone-900">
      <div className="relative h-44 overflow-hidden">
        <img src={imageSrc} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {discountPercent ? (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">
            {discountPercent}% OFF
          </span>
        ) : null}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50">{product.name}</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400">{product.unit}</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            <Star className="h-3.5 w-3.5 fill-current" />
            {product.rating?.toFixed(1)}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-stone-900 dark:text-stone-50">₹{displayPrice}</p>
            {displayPrice !== product.price ? <p className="text-sm text-stone-400 line-through">₹{product.price}</p> : null}
          </div>
          <Button size="sm" variant="outline" className="rounded-full">
            Add
          </Button>
        </div>
      </div>
    </article>
  );
}
