"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Star, Sparkles, Check, Layers, Plus, Minus } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useCart, useUpdateCartItem, useRemoveCartItem } from "@/hooks/use-cart";
import { useCartAction } from "@/hooks/use-cart-action";
import { useWishlist, useAddWishlistItem, useRemoveWishlistItem } from "@/hooks/use-wishlist";
import { ProductVariantModal } from "@/components/marketplace/ProductVariantModal";
import type { ProductItem } from "@/types/marketplace";

interface ProductListItemProps {
  product: ProductItem;
}

export function ProductListItem({ product }: ProductListItemProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const wishlistQuery = useWishlist();
  const addWishlistMutation = useAddWishlistItem();
  const removeWishlistMutation = useRemoveWishlistItem();

  const cartQuery = useCart();
  const updateCartItemMutation = useUpdateCartItem();
  const removeCartItemMutation = useRemoveCartItem();
  const { addItem, isPending: isAdding } = useCartAction();

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const discountPercent =
    product.discount ??
    (product.discountPrice && product.price
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0);
  const displayPrice = product.discountPrice ?? product.price;
  const imageSrc = product.image?.url || product.thumbnail || product.images?.[0] || "";
  const isOutOfStock = (product.quantity ?? 0) <= 0;

  const wishlistItem = (wishlistQuery.data ?? []).find(
    (item) => item.product?.productId === product.productId
  );
  const isInWishlist = Boolean(wishlistItem);

  const hasMultipleVariants = Boolean(product.variants && product.variants.length > 1);
  const cartItems = cartQuery.data?.cartItems || [];
  const productCartItems = cartItems.filter(
    (item) => item.product.productId === product.productId
  );
  const totalInCart = productCartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.productId) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setMessage(null);
    if (isInWishlist && wishlistItem?.wishlistItemId) {
      removeWishlistMutation.mutate(wishlistItem.wishlistItemId, {
        onSuccess: () => setMessage("Removed from wishlist"),
      });
    } else {
      addWishlistMutation.mutate(
        { productId: product.productId },
        {
          onSuccess: () => setMessage("Saved to wishlist"),
        }
      );
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.productId) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (hasMultipleVariants) {
      setIsVariantModalOpen(true);
      return;
    }

    setMessage(null);
    const firstVariant = product.variants?.[0];
    addItem({
      product,
      variant: firstVariant,
      quantity: 1,
      onSuccess: () => setMessage("Added to cart"),
      onError: (err) => setMessage(err.message || "Failed to add"),
    });
  };

  const openProduct = () => {
    if (product.productId) router.push(`/products/${product.productId}`);
  };

  return (
    <>
      <article
        onClick={openProduct}
        className="group flex cursor-pointer flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between dark:border-stone-800 dark:bg-zinc-900"
      >
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-stone-100 bg-stone-50 dark:border-stone-800 dark:bg-stone-950">
            <img
              src={imageSrc}
              alt={product.name}
              className={`h-full w-full object-cover transition group-hover:scale-105 ${
                isOutOfStock ? "grayscale" : ""
              }`}
            />
            {discountPercent ? (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                {discountPercent}%
              </span>
            ) : null}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-stone-900 line-clamp-1 dark:text-stone-50">
                {product.name}
              </h3>
              {typeof product.rating === "number" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                  <Star className="h-3 w-3 fill-current" />
                  {product.rating.toFixed(1)}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
              {product.brand || "SheoMart"} • {product.unit || "Standard pack"}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-lg font-bold text-stone-900 dark:text-stone-50">
                ₹{displayPrice}
              </span>
              {displayPrice !== product.price && (
                <span className="text-xs text-stone-400 line-through">₹{product.price}</span>
              )}
              {discountPercent ? (
                <span className="text-xs font-semibold text-emerald-600">Save {discountPercent}%</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:shrink-0">
          {hasMultipleVariants ? (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition ${
                isOutOfStock
                  ? "cursor-not-allowed bg-stone-200 text-stone-500 dark:bg-stone-800"
                  : totalInCart > 0
                  ? "border-2 border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
                  : "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
              }`}
            >
              {isOutOfStock ? (
                "Out of Stock"
              ) : totalInCart > 0 ? (
                <>
                  <span className="font-bold">{totalInCart} in Cart</span>
                  <span className="text-xs opacity-75">• Packs</span>
                </>
              ) : (
                <>
                  <Layers className="h-3.5 w-3.5" />
                  <span>Select Pack</span>
                </>
              )}
            </button>
          ) : totalInCart > 0 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center rounded-full border-2 border-emerald-600 bg-emerald-50 px-2 py-1 shadow-sm dark:bg-emerald-950/60"
            >
              <button
                type="button"
                onClick={() => {
                  const singleItem = productCartItems[0];
                  if (singleItem) {
                    if (singleItem.quantity <= 1) {
                      removeCartItemMutation.mutate(singleItem.cartItemId);
                    } else {
                      updateCartItemMutation.mutate({
                        cartItemId: singleItem.cartItemId,
                        quantity: singleItem.quantity - 1,
                      });
                    }
                  }
                }}
                disabled={updateCartItemMutation.isPending || removeCartItemMutation.isPending}
                className="rounded-full p-1 text-emerald-800 hover:bg-emerald-100 dark:text-emerald-200 dark:hover:bg-emerald-900/60 transition"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-6 text-center text-xs font-bold text-emerald-900 dark:text-emerald-100 px-1">
                {totalInCart}
              </span>
              <button
                type="button"
                onClick={() => {
                  const singleItem = productCartItems[0];
                  if (singleItem) {
                    updateCartItemMutation.mutate({
                      cartItemId: singleItem.cartItemId,
                      quantity: singleItem.quantity + 1,
                    });
                  }
                }}
                disabled={updateCartItemMutation.isPending}
                className="rounded-full p-1 text-emerald-800 hover:bg-emerald-100 dark:text-emerald-200 dark:hover:bg-emerald-900/60 transition"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding || isOutOfStock}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                isOutOfStock
                  ? "cursor-not-allowed bg-stone-200 text-stone-500 dark:bg-stone-800"
                  : "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleWishlist}
            disabled={addWishlistMutation.isPending || removeWishlistMutation.isPending}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
              isInWishlist
                ? "border-red-200 bg-red-50 text-red-500 dark:border-red-900/60 dark:bg-red-950/40"
                : "border-stone-200 bg-stone-50 text-stone-600 hover:text-emerald-600 dark:border-stone-700 dark:bg-stone-950"
            }`}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
          </button>
        </div>
      </article>

      {/* Multi-variant selector modal */}
      <ProductVariantModal
        product={product}
        open={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
      />
    </>
  );
}
