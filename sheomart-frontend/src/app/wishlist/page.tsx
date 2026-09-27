"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingBag, Trash2, ArrowRight, Star, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { useAddCartItem } from "@/hooks/use-cart";
import { useRemoveWishlistItem, useWishlist } from "@/hooks/use-wishlist";

export default function WishlistPage() {
  const wishlistQuery = useWishlist();
  const removeWishlistItem = useRemoveWishlistItem();
  const addCartItem = useAddCartItem();
  const [feedback, setFeedback] = useState<string | null>(null);

  const wishlistItems = Array.isArray(wishlistQuery.data) ? wishlistQuery.data : [];

  const handleMoveToCart = (wishlistItemId: string, productId?: string) => {
    if (!productId) return;
    setFeedback(null);
    addCartItem.mutate(
      { productId, quantity: 1 },
      {
        onSuccess: () => {
          removeWishlistItem.mutate(wishlistItemId, {
            onSuccess: () => setFeedback("Item moved to your cart!"),
          });
        },
        onError: (error) =>
          setFeedback(error instanceof Error ? error.message : "Unable to move item to cart."),
      }
    );
  };

  const handleRemove = (wishlistItemId: string) => {
    setFeedback(null);
    removeWishlistItem.mutate(wishlistItemId, {
      onSuccess: () => setFeedback("Item removed from your wishlist."),
      onError: (error) =>
        setFeedback(error instanceof Error ? error.message : "Unable to remove item."),
    });
  };

  return (
    <PageWrapper>
      <Section className="space-y-6 py-6 sm:py-8 lg:py-10">
        <Container className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
                Your Saved Favorites
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-50">
                Wishlist ({wishlistItems.length})
              </h1>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/explore">
                Explore More Items <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {feedback && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-300">
              {feedback}
            </div>
          )}

          {wishlistQuery.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800" />
              ))}
            </div>
          ) : wishlistQuery.isError ? (
            <ErrorState
              message={
                wishlistQuery.error instanceof Error
                  ? wishlistQuery.error.message
                  : "Unable to load your wishlist."
              }
            />
          ) : wishlistItems.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {wishlistItems.map((item) => {
                const product = item.product;
                const isOutOfStock = (product.quantity ?? 10) <= 0;
                const discount =
                  product.discount ??
                  (product.discountPrice && product.price
                    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                    : 0);
                const displayPrice = product.discountPrice ?? product.price;

                return (
                  <div
                    key={item.wishlistItemId}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-stone-800 dark:bg-zinc-900"
                  >
                    <div>
                      {/* Image container */}
                      <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-50 dark:bg-stone-950">
                        <img
                          src={
                            product.image?.url ||
                            product.thumbnail ||
                            product.images?.[0] ||
                            "/placeholder.png"
                          }
                          alt={product.name}
                          className={`h-full w-full object-cover transition group-hover:scale-105 ${
                            isOutOfStock ? "grayscale" : ""
                          }`}
                        />
                        {discount ? (
                          <span className="absolute left-2.5 top-2.5 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                            {discount}% OFF
                          </span>
                        ) : null}

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => handleRemove(item.wishlistItemId)}
                          title="Remove from wishlist"
                          className="absolute right-2.5 top-2.5 rounded-full bg-white/80 p-2 text-stone-500 shadow-sm backdrop-blur hover:bg-white hover:text-red-600 dark:bg-stone-900/80 dark:text-stone-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-stone-500 uppercase tracking-wider">
                            {product.brand || "SheoMart"}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isOutOfStock
                                ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                            }`}
                          >
                            {isOutOfStock ? "Out of Stock" : "In Stock"}
                          </span>
                        </div>

                        <Link
                          href={`/products/${product.productId}`}
                          className="font-bold text-stone-900 hover:underline line-clamp-1 dark:text-stone-50"
                        >
                          {product.name}
                        </Link>

                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-lg font-bold text-stone-900 dark:text-stone-50">
                            ₹{displayPrice}
                          </span>
                          {displayPrice !== product.price && (
                            <span className="text-xs text-stone-400 line-through">
                              ₹{product.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800">
                      <Button
                        type="button"
                        onClick={() => handleMoveToCart(item.wishlistItemId, product.productId)}
                        disabled={isOutOfStock || addCartItem.isPending}
                        className="w-full rounded-full bg-emerald-600 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                      >
                        <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                        {isOutOfStock ? "Out of Stock" : "Move to Cart"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <EmptyState
                title="Your wishlist is empty"
                description="Save fresh fruits, dairy, and grocery items to keep track of what you want to buy next."
              />
              <div className="flex justify-center">
                <Button asChild className="rounded-full bg-emerald-600 text-white">
                  <Link href="/explore">Browse Groceries</Link>
                </Button>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </PageWrapper>
  );
}
