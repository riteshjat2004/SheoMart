"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { useAddCartItem, useCart } from "@/hooks/use-cart";
import { useRemoveWishlistItem, useWishlist } from "@/hooks/use-wishlist";

export default function WishlistPage() {
  const wishlistQuery = useWishlist();
  const removeWishlistItem = useRemoveWishlistItem();
  const addCartItem = useAddCartItem();
  const [message, setMessage] = useState<string | null>(null);

  const wishlistItems = Array.isArray(wishlistQuery.data) ? wishlistQuery.data : [];

  const handleMoveToCart = (productId: string) => {
    setMessage(null);
    addCartItem.mutate(
      { productId, quantity: 1 },
      {
        onSuccess: () => setMessage("Moved to cart."),
        onError: (error) => setMessage(error instanceof Error ? error.message : "Unable to move item to cart."),
      }
    );
  };

  const handleRemove = (wishlistItemId: string) => {
    setMessage(null);
    removeWishlistItem.mutate(
      wishlistItemId,
      {
        onSuccess: () => setMessage("Removed from wishlist."),
        onError: (error) => setMessage(error instanceof Error ? error.message : "Unable to remove item."),
      }
    );
  };

  return (
    <PageWrapper>
      <Section className="space-y-6 py-8 sm:py-10 lg:py-12">
        <Container className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionHeading eyebrow="Wishlist" title="Saved products" description="Keep track of the items you want to buy next." />
            </div>
            <Button asChild variant="outline" className="h-fit">
              <Link href="/explore">Continue shopping</Link>
            </Button>
          </div>

          {wishlistQuery.isLoading ? (
            <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <p className="text-sm text-stone-500">Loading wishlist …</p>
            </div>
          ) : wishlistQuery.isError ? (
            <ErrorState message={wishlistQuery.error instanceof Error ? wishlistQuery.error.message : "Unable to load your wishlist."} />
          ) : wishlistItems.length ? (
            <div className="space-y-4">
              {wishlistItems.map((item) => (
                <div key={item.wishlistItemId} className="grid gap-4 rounded-[1.5rem] border border-stone-200 bg-white p-4 sm:grid-cols-[120px_minmax(0,1fr)_auto] dark:border-stone-800 dark:bg-stone-950/60">
                  <div className="overflow-hidden rounded-[1.25rem] bg-stone-100">
                    <img src={item.product.thumbnail || item.product.images?.[0] || "/placeholder.png"} alt={item.product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">{item.product.name}</h3>
                        <p className="text-sm text-stone-600 dark:text-stone-300">{item.product.brand || "Brand unavailable"}</p>
                      </div>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">₹{item.product.discountPrice ?? item.product.price}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-stone-600 dark:text-stone-300">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/products/${item.product.productId ?? ""}`}>View product</Link>
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => item.product.productId && handleMoveToCart(item.product.productId)}
                        disabled={!item.product.productId}
                      >
                        Move to cart
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemove(item.wishlistItemId)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {message ? (
                <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-950/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {message}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4">
              <EmptyState title="Your wishlist is empty" description="Add items from product pages to save them for later." />
            </div>
          )}
        </Container>
      </Section>
    </PageWrapper>
  );
}
