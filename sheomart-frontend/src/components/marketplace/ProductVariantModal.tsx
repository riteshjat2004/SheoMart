"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Plus, Minus, Check, ShoppingBag, Store, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, useUpdateCartItem, useRemoveCartItem } from "@/hooks/use-cart";
import { useCartAction } from "@/hooks/use-cart-action";
import type { ProductItem, ProductVariant } from "@/types/marketplace";

interface ProductVariantModalProps {
  product: ProductItem | null;
  open: boolean;
  onClose: () => void;
}

export function ProductVariantModal({ product, open, onClose }: ProductVariantModalProps) {
  const cartQuery = useCart();
  const updateCartItemMutation = useUpdateCartItem();
  const removeCartItemMutation = useRemoveCartItem();
  const { addItem, isPending: isAdding } = useCartAction();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!open || !product) return null;

  const cartItems = cartQuery.data?.cartItems || [];
  const variants = product.variants || [];

  // Calculate items in cart for this product
  const productCartItems = cartItems.filter(
    (item) => item.product.productId === product.productId
  );
  const totalQuantityInCart = productCartItems.reduce((sum, item) => sum + item.quantity, 0);

  const imgSrc = product.image?.url || product.thumbnail || product.images?.[0] || "";

  const handleAddVariant = (variant: ProductVariant) => {
    setErrorMessage(null);
    addItem({
      product,
      variant,
      quantity: 1,
      onError: (err) => {
        setErrorMessage(err.message || "Failed to add pack to cart");
      },
    });
  };

  const handleIncrease = (cartItemId: string, currentQty: number) => {
    setErrorMessage(null);
    updateCartItemMutation.mutate(
      {
        cartItemId,
        quantity: currentQty + 1,
      },
      {
        onError: (err) =>
          setErrorMessage(err instanceof Error ? err.message : "Failed to update quantity"),
      }
    );
  };

  const handleDecrease = (cartItemId: string, currentQty: number) => {
    setErrorMessage(null);
    if (currentQty <= 1) {
      removeCartItemMutation.mutate(cartItemId, {
        onError: (err) =>
          setErrorMessage(err instanceof Error ? err.message : "Failed to remove item"),
      });
    } else {
      updateCartItemMutation.mutate(
        {
          cartItemId,
          quantity: currentQty - 1,
        },
        {
          onError: (err) =>
            setErrorMessage(err instanceof Error ? err.message : "Failed to update quantity"),
        }
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 p-5 dark:border-stone-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-stone-100 bg-stone-50 dark:border-stone-800 dark:bg-stone-950">
              <img src={imgSrc} alt={product.name} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <h3 className="line-clamp-1 text-base font-bold text-stone-900 dark:text-stone-100">
                {product.name}
              </h3>
              <p className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                <Store className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span className="truncate">{product.storeName || "Available from store"}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-emerald-50/60 px-5 py-2.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-b border-emerald-100/60 dark:border-emerald-900/40 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Select any combination of pack sizes you desire
          </span>
          {totalQuantityInCart > 0 && (
            <span className="font-bold">
              {totalQuantityInCart} {totalQuantityInCart === 1 ? "pack" : "packs"} in cart
            </span>
          )}
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 bg-red-50 px-5 py-2.5 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-300 border-b border-red-200 dark:border-red-900/60">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Variants List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {variants.map((variant) => {
            const inCart = productCartItems.find((ci) => ci.variantId === variant.variantId);
            const inCartQty = inCart?.quantity ?? 0;
            const originalPrice = variant.price;
            const discountedPrice =
              variant.discountPrice && variant.discountPrice > 0 && variant.discountPrice < variant.price
                ? variant.discountPrice
                : variant.price;
            const savings =
              originalPrice > discountedPrice ? originalPrice - discountedPrice : 0;
            const discountPct =
              savings > 0 ? Math.round((savings / originalPrice) * 100) : 0;

            return (
              <div
                key={variant.variantId}
                className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all duration-200 ${
                  inCartQty > 0
                    ? "border-emerald-500/80 bg-emerald-50/30 shadow-xs dark:border-emerald-700/60 dark:bg-emerald-950/20"
                    : "border-stone-200 bg-white hover:border-emerald-300 dark:border-stone-800 dark:bg-zinc-900"
                }`}
              >
                {/* Pack details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {variant.label}
                    </span>
                    {discountPct > 0 && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {discountPct}% OFF
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-stone-900 dark:text-stone-50">
                      ₹{discountedPrice}
                    </span>
                    {savings > 0 && (
                      <span className="text-xs text-stone-400 line-through">
                        ₹{originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add / Quantity Counter */}
                <div>
                  {inCartQty > 0 ? (
                    <div className="flex items-center rounded-full border border-emerald-500 bg-white p-0.5 shadow-sm dark:bg-stone-800">
                      <button
                        type="button"
                        onClick={() => inCart && handleDecrease(inCart.cartItemId, inCartQty)}
                        disabled={updateCartItemMutation.isPending || removeCartItemMutation.isPending}
                        className="rounded-full p-1.5 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/50 transition"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-7 text-center text-xs font-bold text-emerald-800 dark:text-emerald-200">
                        {inCartQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => inCart && handleIncrease(inCart.cartItemId, inCartQty)}
                        disabled={updateCartItemMutation.isPending}
                        className="rounded-full p-1.5 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/50 transition"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleAddVariant(variant)}
                      disabled={isAdding}
                      className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 text-xs shadow-xs"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" /> Add
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-900/70">
          <div className="text-xs">
            {totalQuantityInCart > 0 ? (
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {totalQuantityInCart} pack(s) selected in cart
              </span>
            ) : (
              <span className="text-stone-500">No packs selected yet</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-xl">
              Done
            </Button>
            {totalQuantityInCart > 0 && (
              <Button asChild size="sm" className="rounded-xl bg-emerald-600 text-white font-semibold">
                <Link href="/cart">
                  <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                  View Cart
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
