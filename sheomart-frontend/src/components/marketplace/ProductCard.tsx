"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Star } from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import { useAddCartItem } from "@/hooks/use-cart";

import type { ProductItem } from "@/types/marketplace";

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
  const isOutOfStock = (product.quantity ?? 0) <= 0;

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
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-stone-800 dark:bg-zinc-900">
      <div className="relative h-52 overflow-hidden border-b border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-950/40">
        <img
          src={imageSrc}
          alt={product.name}
          className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${isOutOfStock ? "scale-105 grayscale" : ""}`}
        />
        {discountPercent ? (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white shadow-sm">
            {discountPercent}% off
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-base font-semibold leading-6 text-stone-900 dark:text-stone-50">{product.name}</h3>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{product.brand ?? "SheoMart"}</p>
          </div>
          {typeof product.rating === "number" ? (
            <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <Star className="h-3 w-3 fill-current" />
              {product.rating.toFixed(1)}
            </div>
          ) : null}
        </div>

        <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">{product.unit ?? "Standard pack"}</p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xl font-bold text-stone-900 dark:text-stone-50">₹{displayPrice}</p>
            {displayPrice !== product.price ? <p className="text-sm text-stone-400 line-through">₹{product.price}</p> : null}
          </div>
          {discountPercent ? (
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              Save {discountPercent}%
            </span>
          ) : null}
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addCartMutation.isPending || isOutOfStock}
              className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                isOutOfStock
                  ? "cursor-not-allowed bg-stone-300 text-stone-500 dark:bg-stone-700 dark:text-stone-300"
                  : "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 active:translate-y-[1px]"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>

            <button
              type="button"
              aria-label="Add to wishlist"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-600 transition-all duration-200 hover:scale-105 hover:border-emerald-200 hover:text-emerald-600 active:translate-y-[1px] dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200 dark:hover:border-emerald-500/40 dark:hover:text-emerald-300"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>

          {message ? <p className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">{message}</p> : null}
        </div>
      </div>
    </article>
  );
}
