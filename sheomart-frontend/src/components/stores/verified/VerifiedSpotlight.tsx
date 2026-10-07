"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ShoppingBag } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";
import type { ProductItem } from "@/types/marketplace";

interface VerifiedSpotlightProps {
  product?: ProductItem;
  onSelect?: (product: ProductItem) => void;
}

export function VerifiedSpotlight({ product, onSelect }: VerifiedSpotlightProps) {
  if (!product) return null;

  const image = product.image?.url || product.thumbnail || product.images?.[0];
  const price = product.price ?? 0;
  const discountPrice = product.discountPrice;
  const hasDiscount = typeof discountPrice === "number" && discountPrice < price;
  const effectivePrice = hasDiscount ? discountPrice : price;

  return (
    <section
      className={`relative isolate overflow-hidden rounded-[2rem] border p-5 sm:p-7 ${verifiedTheme.panel}`}
      aria-labelledby="verified-spotlight-heading"
    >
      {image ? (
        <img
          src={image}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-15 dark:opacity-20"
        />
      ) : null}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-50/90 via-emerald-50/40 to-transparent dark:from-emerald-950/80 dark:via-emerald-950/40" />
      <div className="max-w-xl">
        <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${verifiedTheme.accent}`}>
          <CheckCircle2 className="h-4 w-4" /> Verified Store Spotlight
        </p>
        <h2 id="verified-spotlight-heading" className={`mt-2 text-2xl font-bold ${verifiedTheme.panelText}`}>
          {product.name}
        </h2>
        <p className={`mt-2 text-sm leading-6 ${verifiedTheme.panelMutedText}`}>
          {product.description ||
            "Carefully inspected directly from this verified store, chosen for dependable freshness and honest neighborhood value."}
        </p>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xl font-black text-emerald-800 dark:text-emerald-300">
            ₹{effectivePrice.toLocaleString("en-IN")}
          </span>
          {hasDiscount && (
            <span className="text-sm text-stone-400 line-through">
              ₹{price.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Link
            href={`/products/${product.productId}`}
            onClick={() => onSelect?.(product)}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 shadow-sm"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            View Product
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
