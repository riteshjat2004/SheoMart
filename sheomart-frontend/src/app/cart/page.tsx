"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { useCart, useClearCart, useRemoveCartItem, useUpdateCartItem } from "@/hooks/use-cart";

export default function CartPage() {
  const router = useRouter();
  const cartQuery = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const { mutate: clearCartMutate, isPending: isClearingCart } = useClearCart();
  const [message, setMessage] = useState<string | null>(null);

  const cartData = cartQuery.data ?? { cartItems: [], summary: { totalItems: 0, subtotal: 0, totalProducts: 0, estimatedSavings: 0, hasUnavailableItems: false } };
  const cartItems = cartData.cartItems ?? [];
  const totals = cartData.summary ?? { totalItems: 0, subtotal: 0, totalProducts: 0, estimatedSavings: 0, hasUnavailableItems: false };
  const canProceedToCheckout = cartItems.length > 0 && !totals.hasUnavailableItems;

  const handleQuantityChange = (cartItemId: string, quantity: number) => {
    setMessage(null);
    updateCartItem.mutate(
      { cartItemId, quantity },
      {
        onSuccess: () => setMessage("Cart updated."),
        onError: (error) => setMessage(error instanceof Error ? error.message : "Unable to update cart item."),
      }
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setMessage(null);
    removeCartItem.mutate(
      cartItemId,
      {
        onSuccess: () => setMessage("Item removed."),
        onError: (error) => setMessage(error instanceof Error ? error.message : "Unable to remove item."),
      }
    );
  };

  const handleClearCart = () => {
    setMessage(null);
    clearCartMutate(undefined, {
      onSuccess: () => setMessage("Cart cleared."),
      onError: (error) => setMessage(error instanceof Error ? error.message : "Unable to clear cart."),
    });
  };

  return (
    <PageWrapper>
      <Section className="space-y-6 py-8 sm:py-10 lg:py-12">
        <Container className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionHeading eyebrow="Shopping cart" title="Review your cart" description="Manage items you intend to purchase from the marketplace." />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="h-fit">
                <Link href="/explore">Continue shopping</Link>
              </Button>
              <Button variant="secondary" className="h-fit" onClick={handleClearCart} disabled={!cartItems.length || isClearingCart}>
                Clear cart
              </Button>
            </div>
          </div>

          {cartQuery.isLoading ? (
            <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <p className="text-sm text-stone-500">Loading cart …</p>
            </div>
          ) : cartQuery.isError ? (
            <ErrorState message={cartQuery.error instanceof Error ? cartQuery.error.message : "Unable to load your cart."} />
          ) : cartItems.length ? (
            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-4">
                <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.cartItemId} className="grid gap-4 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 sm:grid-cols-[120px_minmax(0,1fr)_auto] dark:border-stone-800 dark:bg-stone-950/60">
                        <div className="overflow-hidden rounded-[1.25rem] bg-white">
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
                            <p>Quantity:</p>
                            <div className="flex items-center gap-2">
                              <Button type="button" variant="outline" size="sm" onClick={() => handleQuantityChange(item.cartItemId, Math.max(1, item.quantity - 1))} disabled={!item.isAvailable || item.quantity <= 1}>
                                −
                              </Button>
                              <span className="min-w-[1.5rem] text-center">{item.quantity}</span>
                              <Button type="button" variant="outline" size="sm" onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)} disabled={!item.isAvailable || item.quantity >= (item.maxAvailableQuantity ?? item.quantity)}>
                                +
                              </Button>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItem(item.cartItemId)}>
                              Remove
                            </Button>
                          </div>
                          {!item.isAvailable ? (
                            <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                              {item.availabilityMessage}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Cart summary</h3>
                  <div className="mt-6 space-y-4 text-sm text-stone-600 dark:text-stone-300">
                    <div className="flex items-center justify-between">
                      <span>Total quantity</span>
                      <span>{totals.totalItems}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total products</span>
                      <span>{totals.totalProducts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-stone-900 dark:text-stone-50">₹{totals.subtotal}</span>
                    </div>
                    {totals.estimatedSavings > 0 ? (
                      <div className="flex items-center justify-between">
                        <span>Savings</span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">₹{totals.estimatedSavings}</span>
                      </div>
                    ) : null}
                    <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4 text-xs text-stone-500 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-400">
                      Review your cart and continue to checkout when you are ready.
                    </div>
                    <Button type="button" className="w-full" onClick={() => router.push("/checkout")} disabled={!canProceedToCheckout}>
                      Proceed to Checkout
                    </Button>
                  </div>
                </div>
                {message ? (
                  <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-950/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {message}
                  </div>
                ) : null}
              </aside>
            </div>
          ) : (
            <div className="space-y-4">
              <EmptyState title="Your cart is empty" description="Add products from the marketplace to see them here." />
              <div className="flex justify-end">
                <Button asChild variant="default">
                  <Link href="/explore">Browse products</Link>
                </Button>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </PageWrapper>
  );
}
