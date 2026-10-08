"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  Store as StoreIcon,
  Loader2,
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
import { useStore } from "@/hooks/use-store";
import { useQuery } from "@tanstack/react-query";
import { fetchPlatformFeeConfig } from "@/services/platform-fee";
import { fetchActiveOffers, validateCoupon } from "@/services/promotions";
import { ClearCartConfirmModal } from "@/components/cart/ClearCartConfirmModal";

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
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

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

  const storeIds = [
    ...new Set(
      cartItems
        .map((item) => item.product.storeId)
        .filter((value): value is string => Boolean(value))
    ),
  ];
  const storeId = storeIds[0];
  const storeQuery = useStore(storeId);
  const store = storeQuery.data;

  const activeOffersQuery = useQuery({
    queryKey: ["active-offers"],
    queryFn: fetchActiveOffers,
    staleTime: 60000,
  });

  const platformFeeQuery = useQuery({
    queryKey: ["platform-fee"],
    queryFn: fetchPlatformFeeConfig,
    staleTime: 60000,
  });

  // Calculations
  const discountedSubtotal = totals.subtotal;
  const originalSubtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const regPrice = item.unitPrice ?? item.product?.price ?? 0;
      return sum + regPrice * item.quantity;
    }, 0) || (discountedSubtotal + totals.estimatedSavings);
  }, [cartItems, discountedSubtotal, totals.estimatedSavings]);

  const supportsPickup = store?.supportsPickup === true || store?.pickupEnabled === true || (Boolean(store) && store?.supportsPickup !== false && store?.pickupEnabled !== false);
  const supportsDelivery = store?.supportsDelivery === true || store?.deliveryEnabled === true;
  const freeDeliveryAbove = store?.freeDeliveryThreshold ?? store?.freeDeliveryAbove ?? 0;
  const configuredDeliveryFee = store?.deliveryFee ?? 0;

  const festivalSavings = useMemo(() => {
    const rawTotal = cartItems.reduce((total, item) => {
      const categoryId = item.product.categoryId ?? "";
      const offer = activeOffersQuery.data?.find((candidate) => candidate.categoryIds.length === 0 || candidate.categoryIds.includes(categoryId));
      if (!offer) return total;
      const price = item.product.discountPrice ?? item.product.price ?? 0;
      const raw = offer.discountType === "percentage" ? (price * item.quantity * offer.discountValue) / 100 : offer.discountValue * item.quantity;
      return total + Math.min(price * item.quantity, raw);
    }, 0);
    return Math.round(rawTotal * 100) / 100;
  }, [activeOffersQuery.data, cartItems]);

  const isFreeDelivery = supportsDelivery && freeDeliveryAbove > 0 && discountedSubtotal >= freeDeliveryAbove;
  const deliveryFee = discountedSubtotal > 0 && supportsDelivery
    ? (isFreeDelivery ? 0 : configuredDeliveryFee)
    : 0;

  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;

  const platformConfig = platformFeeQuery.data;
  const platformFee = platformConfig?.enabled && discountedSubtotal >= (platformConfig.minimumOrderAmount ?? 0)
    ? Math.min(
        platformConfig.feeType === "PERCENTAGE"
          ? (discountedSubtotal * platformConfig.amount) / 100
          : platformConfig.amount,
        platformConfig.maximumPlatformFee ?? Number.POSITIVE_INFINITY
      )
    : 0;

  const grandTotal = Math.round(Math.max(0, originalSubtotal - totals.estimatedSavings - festivalSavings - couponDiscount + deliveryFee + platformFee) * 100) / 100;
  const totalSavings = Math.round((totals.estimatedSavings + festivalSavings + couponDiscount + (isFreeDelivery ? configuredDeliveryFee : 0)) * 100) / 100;

  const canProceedToCheckout =
    cartItems.length > 0 && !totals.hasUnavailableItems;

  // Revalidate coupon whenever subtotal changes
  useEffect(() => {
    if (appliedCoupon && discountedSubtotal > 0 && storeId) {
      validateCoupon(appliedCoupon.code, discountedSubtotal, {
        storeId,
        categoryIds: [...new Set(cartItems.map((item) => item.product.categoryId).filter(Boolean) as string[])],
        productIds: cartItems.map((item) => item.product.productId).filter(Boolean) as string[],
      })
        .then((validation) => {
          setAppliedCoupon({ code: validation.code, discount: validation.discount });
        })
        .catch((error) => {
          setAppliedCoupon(null);
          setCouponError(error instanceof Error ? error.message : "Coupon is no longer valid for this cart total.");
        });
    } else if (appliedCoupon && discountedSubtotal === 0) {
      setAppliedCoupon(null);
    }
  }, [discountedSubtotal, storeId]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    try {
      setValidatingCoupon(true);
      const validation = await validateCoupon(code, discountedSubtotal, {
        storeId,
        categoryIds: [...new Set(cartItems.map((item) => item.product.categoryId).filter(Boolean) as string[])],
        productIds: cartItems.map((item) => item.product.productId).filter(Boolean) as string[],
      });
      setAppliedCoupon({ code: validation.code, discount: validation.discount });
      setMessage(`Coupon "${validation.code}" applied! You saved ₹${validation.discount}`);
    } catch (error) {
      setAppliedCoupon(null);
      setCouponError(error instanceof Error ? error.message : "Invalid or inapplicable coupon code.");
    } finally {
      setValidatingCoupon(false);
    }
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
    setIsClearModalOpen(true);
  };

  const confirmClearCart = () => {
    setMessage(null);
    clearCartMutate(undefined, {
      onSuccess: () => {
        setAppliedCoupon(null);
        setIsClearModalOpen(false);
        setMessage("Cart cleared.");
      },
      onError: (error) => {
        setIsClearModalOpen(false);
        setMessage(error instanceof Error ? error.message : "Unable to clear cart.");
      },
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

          {/* Delivery progress bar / pickup notice */}
          {cartItems.length > 0 && (
            storeQuery.isLoading ? (
              <div className="h-16 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800" />
            ) : store && !supportsDelivery ? (
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 dark:border-amber-950 dark:bg-amber-950/30">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
                  <StoreIcon className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>
                    Pickup Only Store • {store.storeName || "This store"} does not support doorstep delivery. Order will be prepared for in-store pickup.
                  </span>
                </div>
              </div>
            ) : freeDeliveryAbove > 0 ? (
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-4 dark:border-emerald-950 dark:bg-emerald-950/30">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    {isFreeDelivery
                      ? "Congratulations! You have unlocked FREE Doorstep Delivery"
                      : `Add ₹${freeDeliveryAbove - discountedSubtotal} more for FREE Delivery!`}
                  </span>
                  <span>Threshold: ₹{freeDeliveryAbove}</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-emerald-200/60 dark:bg-emerald-900/60">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300 dark:bg-emerald-500"
                    style={{
                      width: `${Math.min(100, (discountedSubtotal / freeDeliveryAbove) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ) : supportsDelivery ? (
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-950 dark:bg-emerald-950/20">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Doorstep Delivery Available • Delivery fee ₹{configuredDeliveryFee}
                  </span>
                  {store?.storeName && <span className="text-stone-500 dark:text-stone-400">{store.storeName}</span>}
                </div>
              </div>
            ) : null
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
                      const effPrice =
                        item.unitDiscountPrice ??
                        item.unitPrice ??
                        item.product.discountPrice ??
                        item.product.price;
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
                              <div className="flex flex-wrap items-center gap-2">
                                <Link
                                  href={`/products/${item.product.productId}`}
                                  className="font-semibold text-stone-900 hover:text-emerald-700 transition-colors line-clamp-1 dark:text-stone-50 dark:hover:text-emerald-400"
                                >
                                  {item.product.name}
                                </Link>
                                {item.variantLabel && (
                                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                    {item.variantLabel}
                                  </span>
                                )}
                              </div>
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
                                    handleRemoveItem(item.cartItemId);
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
                        disabled={validatingCoupon}
                        className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold uppercase text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                      />
                      <Button type="submit" size="sm" disabled={validatingCoupon || !couponInput.trim()} className="bg-emerald-600 text-white hover:bg-emerald-500">
                        {validatingCoupon ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
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
                        ₹{originalSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {totals.estimatedSavings > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium dark:text-emerald-400">
                        <span>Product Savings</span>
                        <span>-₹{totals.estimatedSavings.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    {festivalSavings > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium dark:text-emerald-400">
                        <span>Festival Savings</span>
                        <span>-₹{festivalSavings.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-600 font-medium dark:text-emerald-400">
                        <span>Coupon Savings ({appliedCoupon.code})</span>
                        <span>-₹{appliedCoupon.discount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>
                        {!supportsDelivery ? (
                          <span className="font-semibold text-stone-600 dark:text-stone-400">Store Pickup (FREE)</span>
                        ) : isFreeDelivery ? (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
                        ) : (
                          `₹${deliveryFee}`
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Platform Fee</span>
                      <span>{platformFee > 0 ? `₹${platformFee}` : "FREE"}</span>
                    </div>

                    <div className="border-t border-stone-100 pt-3 dark:border-stone-800">
                      <div className="flex items-center justify-between text-base font-bold text-stone-900 dark:text-stone-50">
                        <span>To Pay</span>
                        <span>₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {festivalSavings > 0 && (
                      <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-2.5 text-center text-xs font-semibold text-amber-800 dark:border-amber-950 dark:bg-amber-950/40 dark:text-amber-200">
                        ✨ Festival offer savings of ₹{festivalSavings.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} included!
                      </div>
                    )}

                    {totalSavings > 0 && (
                      <div className="rounded-xl bg-emerald-50 p-2.5 text-center text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        🎉 You are saving ₹{totalSavings.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} on this order!
                      </div>
                    )}
                  </div>

                  {/* Checkout CTA */}
                  <Button
                    type="button"
                    onClick={() => {
                      if (appliedCoupon?.code) {
                        router.push(`/checkout?coupon=${encodeURIComponent(appliedCoupon.code)}`);
                      } else {
                        router.push("/checkout");
                      }
                    }}
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

      <ClearCartConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={confirmClearCart}
        isClearing={isClearingCart}
        itemCount={totals.totalItems}
        storeName={store?.storeName}
      />
    </PageWrapper>
  );
}
