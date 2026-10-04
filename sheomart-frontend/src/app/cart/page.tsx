"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Trash2,
  Heart,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  ShoppingBag,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { useCart, useClearCart, useRemoveCartItem, useUpdateCartItem } from "@/hooks/use-cart";
import { useAddWishlistItem } from "@/hooks/use-wishlist";
import { useCoupons } from "@/hooks/use-promotions";

const FREE_DELIVERY_THRESHOLD = 299;
const STANDARD_DELIVERY_FEE = 29;
const PLATFORM_FEE = 5;

export default function CartPage() {
  const router = useRouter();
  const cartQuery = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const addWishlistItem = useAddWishlistItem();
  const { mutate: clearCartMutate, isPending: isClearingCart } = useClearCart();
  const couponsQuery = useCoupons();

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const cartData = cartQuery.data ?? {
    cartItems: [],
    summary: {
      totalItems: 0,
      subtotal: 0,
      totalProducts: 0,
      estimatedSavings: 0,
      hasUnavailableItems: false,
    },
  };

  const cartItems = cartData.cartItems ?? [];
  const totals = cartData.summary ?? {
    totalItems: 0,
    subtotal: 0,
    totalProducts: 0,
    estimatedSavings: 0,
    hasUnavailableItems: false,
  };

  // Calculations
  const rawSubtotal = totals.subtotal;
  const isFreeDelivery = rawSubtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = rawSubtotal > 0 ? (isFreeDelivery ? 0 : STANDARD_DELIVERY_FEE) : 0;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const gstAmount = Math.round(rawSubtotal * 0.05); // 5% GST on grocery items
  const grandTotal = Math.max(0, rawSubtotal - couponDiscount + deliveryFee + PLATFORM_FEE + gstAmount);
  const totalSavings = totals.estimatedSavings + couponDiscount + (isFreeDelivery ? STANDARD_DELIVERY_FEE : 0);

  const canProceedToCheckout =
    cartItems.length > 0 && !totals.hasUnavailableItems;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    const matched = (couponsQuery.data ?? []).find(
      (c) => c.code.toUpperCase() === code && c.isActive
    );

    if (!matched) {
      setCouponError("Invalid or expired coupon code.");
      return;
    }

    if (matched.minimumCartValue && rawSubtotal < matched.minimumCartValue) {
      setCouponError(`Minimum order of ₹${matched.minimumCartValue} required for this coupon.`);
      return;
    }

    let calculatedDiscount = 0;
    if (matched.discountType === "percentage") {
      calculatedDiscount = Math.round((rawSubtotal * matched.discountValue) / 100);
      if (matched.maximumDiscount) {
        calculatedDiscount = Math.min(calculatedDiscount, matched.maximumDiscount);
      }
    } else {
      calculatedDiscount = matched.discountValue;
    }

    calculatedDiscount = Math.min(calculatedDiscount, rawSubtotal);
    setAppliedCoupon({ code: matched.code, discount: calculatedDiscount });
    setMessage(`Coupon "${matched.code}" applied! You saved ₹${calculatedDiscount}`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
    setMessage("Coupon removed.");
  };

  const handleQuantityChange = (cartItemId: string, quantity: number) => {
    setMessage(null);
    updateCartItem.mutate(
      { cartItemId, quantity },
      {
        onSuccess: () => setMessage("Cart updated."),
        onError: (error) =>
          setMessage(error instanceof Error ? error.message : "Unable to update cart item."),
      }
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setMessage(null);
    removeCartItem.mutate(cartItemId, {
      onSuccess: () => setMessage("Item removed."),
      onError: (error) =>
        setMessage(error instanceof Error ? error.message : "Unable to remove item."),
    });
  };

  const handleMoveToWishlist = (cartItemId: string, productId?: string) => {
    if (!productId) return;
    setMessage(null);
    addWishlistItem.mutate(
      { productId },
      {
        onSuccess: () => {
          removeCartItem.mutate(cartItemId, {
            onSuccess: () => setMessage("Moved to your wishlist."),
          });
        },
        onError: () => setMessage("Failed to move item to wishlist."),
      }
    );
  };

  const handleClearCart = () => {
    if (!window.confirm("Are you sure you want to empty your cart?")) return;
    setMessage(null);
    clearCartMutate(undefined, {
      onSuccess: () => {
        setAppliedCoupon(null);
        setMessage("Cart cleared.");
      },
      onError: (error) =>
        setMessage(error instanceof Error ? error.message : "Unable to clear cart."),
    });
  };

  return (
    <PageWrapper>
      <Section className="space-y-6 py-6 sm:py-8 lg:py-10">
        <Container className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-400">
                Your Shopping Cart
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-50">
                Review Items ({totals.totalItems})
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" className="rounded-xl border-stone-200 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:text-stone-300 dark:hover:bg-stone-800">
                <Link href="/explore">Continue Shopping</Link>
              </Button>
              {cartItems.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCart}
                  disabled={isClearingCart}
                  className="rounded-xl text-stone-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Clear Cart
                </Button>
              )}
            </div>
          </div>

          {/* Delivery progress bar */}
          {cartItems.length > 0 && (
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-4 dark:border-emerald-950 dark:bg-emerald-950/30">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  {isFreeDelivery
                    ? "Congratulations! You have unlocked FREE Doorstep Delivery"
                    : `Add ₹${FREE_DELIVERY_THRESHOLD - rawSubtotal} more for FREE Delivery!`}
                </span>
                <span>Threshold: ₹{FREE_DELIVERY_THRESHOLD}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-emerald-200/60 dark:bg-emerald-900/60">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300 dark:bg-emerald-500"
                  style={{
                    width: `${Math.min(100, (rawSubtotal / FREE_DELIVERY_THRESHOLD) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {cartQuery.isLoading ? (
            <div className="h-80 animate-pulse rounded-[2rem] bg-stone-100 dark:bg-stone-800" />
          ) : cartQuery.isError ? (
            <ErrorState
              message={
                cartQuery.error instanceof Error ? cartQuery.error.message : "Unable to load cart."
              }
            />
          ) : cartItems.length ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              {/* Items List */}
              <div className="space-y-4">
                <div className="rounded-[2rem] border border-stone-200/90 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-zinc-900">
                  <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    {cartItems.map((item) => {
                      const effPrice = item.product.discountPrice ?? item.product.price;
                      const itemTotal = effPrice * item.quantity;
                      return (
                        <div
                          key={item.cartItemId}
                          className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-stone-100 bg-stone-50 dark:border-stone-800">
                              <img
                                src={
                                  item.product.image?.url ||
                                  item.product.thumbnail ||
                                  item.product.images?.[0] ||
                                  "/placeholder.png"
                                }
                                alt={item.product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <div className="space-y-1">
                              <Link
                                href={`/products/${item.product.productId}`}
                                className="font-semibold text-stone-900 hover:text-emerald-700 transition-colors line-clamp-1 dark:text-stone-50 dark:hover:text-emerald-400"
                              >
                                {item.product.name}
                              </Link>
                              <p className="text-xs text-stone-500 dark:text-stone-400">
                                {item.product.brand || "SheoMart"} • ₹{effPrice} each
                              </p>
                              {!item.isAvailable && (
                                <span className="inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                                  {item.availabilityMessage || "Currently unavailable"}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Controls & Price */}
                          <div className="flex items-center justify-between sm:justify-end sm:gap-6">
                            {/* Quantity buttons */}
                            <div className="flex items-center rounded-full border border-stone-200 bg-stone-50 p-0.5 dark:border-stone-700 dark:bg-stone-950">
                              <button
                                type="button"
                                onClick={() => {
                                  if (item.quantity === 1) {
                                    if (window.confirm("Remove item from cart?")) {
                                      handleRemoveItem(item.cartItemId);
                                    }
                                    return;
                                  }
                                  handleQuantityChange(item.cartItemId, item.quantity - 1);
                                }}
                                disabled={updateCartItem.isPending}
                                className="rounded-full p-1.5 text-stone-600 hover:bg-stone-200/80 dark:text-stone-300 dark:hover:bg-stone-800 transition"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-7 text-center text-xs font-bold text-stone-900 dark:text-stone-50">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(item.cartItemId, item.quantity + 1)
                                }
                                disabled={
                                  updateCartItem.isPending ||
                                  item.quantity >= (item.maxAvailableQuantity ?? 99)
                                }
                                className="rounded-full p-1.5 text-stone-600 hover:bg-stone-200/80 dark:text-stone-300 dark:hover:bg-stone-800 transition"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Item total */}
                            <span className="w-20 text-right text-base font-bold text-stone-900 dark:text-stone-50">
                              ₹{itemTotal}
                            </span>

                            {/* Quick Actions: Wishlist & Remove */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleMoveToWishlist(item.cartItemId, item.product.productId)
                                }
                                title="Move to Wishlist"
                                className="rounded-full p-2 text-stone-400 hover:text-emerald-600 transition"
                              >
                                <Heart className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.cartItemId)}
                                title="Remove"
                                className="rounded-full p-2 text-stone-400 hover:text-red-600 transition"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {message && (
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {message}
                  </p>
                )}
              </div>

              {/* Order Summary & Coupon Card */}
              <aside className="space-y-4">
                {/* Apply Coupon Widget */}
                <div className="rounded-[1.75rem] border border-stone-200/90 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-zinc-900">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <Tag className="h-4 w-4" />
                    <span>Apply Coupon</span>
                  </div>

                  {appliedCoupon ? (
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs dark:border-emerald-950 dark:bg-emerald-950/40">
                      <div>
                        <p className="font-bold text-emerald-800 dark:text-emerald-200">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                          Saved ₹{appliedCoupon.discount} on this order
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="font-bold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold uppercase text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                      />
                      <Button type="submit" size="sm" className="bg-emerald-600 text-white hover:bg-emerald-500">
                        Apply
                      </Button>
                    </form>
                  )}

                  {couponError && (
                    <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{couponError}</p>
                  )}
                </div>

                {/* Bill Breakdown */}
                <div className="rounded-[1.75rem] border border-stone-200/90 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-zinc-900">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Bill Details
                  </h3>

                  <div className="mt-4 space-y-3 text-xs text-stone-600 dark:text-stone-300">
                    <div className="flex justify-between">
                      <span>Item Total (Subtotal)</span>
                      <span className="font-semibold text-stone-900 dark:text-stone-100">
                        ₹{rawSubtotal}
                      </span>
                    </div>

                    {totals.estimatedSavings > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium dark:text-emerald-400">
                        <span>Product Savings</span>
                        <span>-₹{totals.estimatedSavings}</span>
                      </div>
                    )}

                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-600 font-medium dark:text-emerald-400">
                        <span>Coupon Savings ({appliedCoupon.code})</span>
                        <span>-₹{appliedCoupon.discount}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>
                        {isFreeDelivery ? (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
                        ) : (
                          `₹${deliveryFee}`
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Platform Fee</span>
                      <span>₹{PLATFORM_FEE}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>GST & Taxes (5%)</span>
                      <span>₹{gstAmount}</span>
                    </div>

                    <div className="border-t border-stone-100 pt-3 dark:border-stone-800">
                      <div className="flex items-center justify-between text-base font-bold text-stone-900 dark:text-stone-50">
                        <span>To Pay</span>
                        <span>₹{grandTotal}</span>
                      </div>
                    </div>

                    {totalSavings > 0 && (
                      <div className="rounded-xl bg-emerald-50 p-2.5 text-center text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        🎉 You are saving ₹{totalSavings} on this order!
                      </div>
                    )}
                  </div>

                  {/* Checkout CTA */}
                  <Button
                    type="button"
                    onClick={() => router.push("/checkout")}
                    disabled={!canProceedToCheckout}
                    className="mt-5 w-full rounded-full bg-emerald-600 py-6 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500"
                  >
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </aside>
            </div>
          ) : (
            <div className="space-y-4">
              <EmptyState
                title="Your cart is empty"
                description="Browse our fresh local market and add everyday essentials to your cart."
              />
              <div className="flex justify-center">
                <Button asChild className="rounded-full bg-emerald-600 text-white">
                  <Link href="/explore">Start Shopping</Link>
                </Button>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </PageWrapper>
  );
}
