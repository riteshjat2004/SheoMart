"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Bell, Check, Crown, Heart, ShoppingBag, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddCartItem } from "@/hooks/use-cart";
import { useAuthStore } from "@/store/auth-store";
import { royalTheme } from "./royalTheme";
import { RoyalSectionHeader } from "./RoyalSectionHeader";
import type { ProductItem } from "@/types/marketplace";

export function RoyalLaunches({ products }: { products: ProductItem[] }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const addCartItemMutation = useAddCartItem();

  const [wishlisted, setWishlisted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Intelligently select flagship spotlight product: newest or with highest discount / top rating
  const product = useMemo(() => {
    if (!products.length) return null;

    const flagship = [...products].sort((a, b) => {
      const aStock = a.variants?.[0]?.stock ?? a.quantity ?? 10;
      const bStock = b.variants?.[0]?.stock ?? b.quantity ?? 10;
      const aScore = (Number(a.rating ?? 0) * 2) + (a.discountPrice ? 5 : 0) + (a.isFeatured ? 4 : 0) + (aStock > 0 ? 3 : 0);
      const bScore = (Number(b.rating ?? 0) * 2) + (b.discountPrice ? 5 : 0) + (b.isFeatured ? 4 : 0) + (bStock > 0 ? 3 : 0);
      return bScore - aScore;
    })[0];

    return flagship || products[0];
  }, [products]);

  if (!product) return null;

  const image = product.image?.url || product.thumbnail || product.images?.[0];
  const price = product.price ?? 0;
  const discountPrice = product.discountPrice;
  const hasDiscount = typeof discountPrice === "number" && discountPrice < price;
  const effectivePrice = hasDiscount ? discountPrice : price;
  const savings = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;

  const handleAddToCart = () => {
    if (!product.productId) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    addCartItemMutation.mutate(
      {
        productId: product.productId,
        quantity: 1,
        variantId: product.variants?.[0]?.variantId,
      },
      {
        onSuccess: () => {
          setJustAdded(true);
          window.setTimeout(() => setJustAdded(false), 2500);
        },
      }
    );
  };

  return (
    <section className="space-y-4" aria-labelledby="royal-launch-heading">
      <RoyalSectionHeader
        title="Royal Flagship Spotlight"
        subtitle="First access to curated arrivals and signature culinary selections."
      />
      <div
        className={`relative isolate overflow-hidden rounded-[2rem] border border-amber-400/40 p-6 sm:p-9 shadow-xl shadow-black/40 ${royalTheme.panel}`}
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_20%,rgba(212,175,55,0.22),transparent_40%)]" />

        <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-black/60 shadow-lg">
            {image ? (
              <img
                src={image}
                alt={product.name}
                className="h-64 sm:h-72 w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="h-64 sm:h-72 rounded-3xl bg-stone-900 flex items-center justify-center text-amber-500/50">
                <Crown className="h-16 w-16" />
              </div>
            )}
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-amber-400/60 bg-black/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-amber-400" />
              {product.category || "Flagship Reserve"}
            </span>

            {savings > 0 && (
              <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-black uppercase text-stone-950 shadow-md">
                {savings}% Privilege
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400">
                <Crown className="h-4 w-4" />
                Selected by Head Curator
              </span>
              {typeof product.rating === "number" && product.rating > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  {product.rating}
                </span>
              )}
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-950 dark:text-white leading-tight">
              {product.name}
            </h3>

            <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
              {product.description ||
                "Handpicked directly for the SheoMart Royal collection. Meticulously inspected for supreme freshness, grade, and authentic origin."}
            </p>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl font-black text-amber-900 dark:text-amber-400">
                ₹{effectivePrice.toLocaleString("en-IN")}
              </span>
              {hasDiscount && (
                <span className="text-base text-stone-400 line-through">
                  ₹{price.toLocaleString("en-IN")}
                </span>
              )}
              {product.unit && (
                <span className="text-xs text-stone-500 font-medium">/ {product.unit}</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Button
                type="button"
                onClick={handleAddToCart}
                disabled={addCartItemMutation.isPending}
                className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-6 py-5 font-bold text-stone-950 shadow-lg shadow-amber-500/25 transition-transform hover:scale-[1.02] hover:from-amber-300 hover:to-yellow-300"
              >
                {justAdded ? (
                  <>
                    <Check className="mr-1.5 h-4 w-4 text-stone-950" /> Added to Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag className="mr-1.5 h-4 w-4" /> Add to Royal Bag
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                asChild
                className="border-amber-300/80 bg-white/80 dark:border-amber-400/40 dark:bg-stone-900/60 font-semibold text-stone-800 dark:text-amber-200 hover:border-amber-400"
              >
                <Link href={`/products/${product.productId}`}>
                  View Details <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>

              <button
                type="button"
                onClick={() => setWishlisted(!wishlisted)}
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                  wishlisted
                    ? "border-rose-400 bg-rose-500/10 text-rose-500"
                    : "border-amber-300/80 bg-white/80 dark:border-amber-400/30 dark:bg-stone-900 text-stone-500 hover:text-rose-500"
                }`}
                aria-label="Save to Royal Wishlist"
              >
                <Heart className={`h-4 w-4 ${wishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
