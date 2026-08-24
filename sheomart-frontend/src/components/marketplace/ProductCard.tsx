"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, ShoppingCart } from "lucide-react";
import Link from "next/link";

import { useAuthStore } from "@/store/auth-store";
import { useAddCartItem } from "@/hooks/use-cart";

import type { ProductItem } from "@/types/marketplace";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: ProductItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const { isAuthenticated } = useAuthStore();

  const addCartMutation = useAddCartItem();

  const [message, setMessage] = useState<string | null>(null);
  const discountPercent = product.discount ?? (product.discountPrice && product.price ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0);
  const displayPrice = product.discountPrice ?? product.price;
  const imageSrc = product.image?.url || product.thumbnail || product.images?.[0] || "";

  const handleAddToCart = () => {
    if (!product.productId) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setMessage(null);

    addCartMutation.mutate(
      {
        productId: product.productId,
        quantity: 1,
      },
      {
        onSuccess: () => {
          setMessage("Added to cart");
        },
        onError: (error) => {
          setMessage(error instanceof Error ? error.message : "Unable to add item.");
        },
      }
    );
  };

  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-stone-800 dark:bg-zinc-900">
      <div className="relative h-44 overflow-hidden">
        <img src={imageSrc} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {discountPercent ? (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            {discountPercent}% OFF
          </span>
        ) : null}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50">{product.name}</h3>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{product.unit}</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            <Star className="h-3.5 w-3.5 fill-current" />
            {product.rating?.toFixed(1)}
          </div>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-stone-900 dark:text-stone-50">₹{displayPrice}</p>
            {displayPrice !== product.price ? <p className="text-sm text-stone-400 line-through">₹{product.price}</p> : null}
          </div>
          {product.productId ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button size="icon" variant="default" className="rounded-full" onClick={handleAddToCart} disabled={addCartMutation.isPending || (product.quantity ?? 0) <= 0}>
                <ShoppingCart className="h-4 w-4" />
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={`/products/${product.productId}`}>View</Link>
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="rounded-full" disabled>
              View
            </Button>
          )}
        </div>
        {message ? <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{message}</p> : null}
      </div>
    </article>
  );
}
