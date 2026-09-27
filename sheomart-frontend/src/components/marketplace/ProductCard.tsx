"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Heart, ShieldCheck, Star, Store } from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import { useAddCartItem } from "@/hooks/use-cart";
import { useWishlist, useAddWishlistItem, useRemoveWishlistItem } from "@/hooks/use-wishlist";

import type { ProductItem, StoreBadge } from "@/types/marketplace";

interface ProductCardProps {
  product: ProductItem & { storeBadge?: StoreBadge };
  storeBadge?: StoreBadge;
}

export function ProductCard({ product, storeBadge }: ProductCardProps) {
  const router = useRouter();

  const { isAuthenticated } = useAuthStore();
  const wishlistQuery = useWishlist();
  const addWishlistMutation = useAddWishlistItem();
  const removeWishlistMutation = useRemoveWishlistItem();

  const addCartMutation = useAddCartItem();

  const [message, setMessage] = useState<string | null>(null);
  const discountPercent = product.discount ?? (product.discountPrice && product.price ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0);
  const displayPrice = product.discountPrice ?? product.price;
  const imageSrc = product.image?.url || product.thumbnail || product.images?.[0] || "";
  const isOutOfStock = (product.quantity ?? 0) <= 0;
  const isRoyal = (storeBadge ?? product.storeBadge) === "royal";
  const isVerified = (storeBadge ?? product.storeBadge) === "verified";

  const wishlistItem = (wishlistQuery.data ?? []).find(
    (item) => item.product?.productId === product.productId
  );
  const isInWishlist = Boolean(wishlistItem);

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
        onError: () => setMessage("Failed to update wishlist"),
      });
    } else {
      addWishlistMutation.mutate(
        { productId: product.productId },
        {
          onSuccess: () => setMessage("Saved to wishlist"),
          onError: () => setMessage("Failed to save to wishlist"),
        }
      );
    }
  };

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

  const openProduct = () => {
    if (product.productId) router.push(`/products/${product.productId}`);
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProduct();
    }
  };

  return (
    <article
      role="link"
      tabIndex={product.productId ? 0 : -1}
      onClick={openProduct}
      onKeyDown={handleCardKeyDown}
      className={`group flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.6rem] border transition-all duration-300 hover:-translate-y-1 ${
        isRoyal
          ? "border-amber-400/40 bg-gradient-to-b from-stone-950 via-zinc-950 to-stone-900 text-stone-100 shadow-[0_8px_30px_-15px_rgba(212,175,55,0.22)] hover:border-amber-400/80 hover:shadow-[0_16px_45px_-15px_rgba(212,175,55,0.4)]"
          : isVerified
          ? "border-emerald-200/80 bg-white shadow-sm hover:border-emerald-400 hover:shadow-[0_12px_35px_-15px_rgba(16,185,129,0.3)] dark:border-emerald-900/60 dark:bg-zinc-900"
          : "border-stone-200/90 bg-white shadow-xs hover:border-emerald-300/85 hover:shadow-md dark:border-stone-800 dark:bg-stone-900 dark:hover:border-emerald-800/60"
      }`}
    >
      <div
        className={`relative h-52 overflow-hidden border-b ${
          isRoyal
            ? "border-amber-400/20 bg-stone-950"
            : isVerified
            ? "border-emerald-100 bg-stone-100 dark:border-emerald-950/60 dark:bg-stone-950/40"
            : "border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-950/40"
        }`}
      >
        <img
          src={imageSrc}
          alt={product.name}
          className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${isOutOfStock ? "scale-105 grayscale" : ""}`}
        />
        {discountPercent ? (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] shadow-sm ${
              isRoyal ? "bg-gradient-to-r from-amber-400 to-yellow-400 font-bold text-stone-950 shadow-amber-500/20" : "bg-emerald-600 text-white"
            }`}
          >
            {discountPercent}% off
          </span>
        ) : null}

        {isRoyal ? (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full border border-amber-400/50 bg-black/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300 shadow-sm backdrop-blur-sm">
            <Crown className="h-2.5 w-2.5 fill-amber-400" />
            Royal
          </span>
        ) : isVerified ? (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full border border-emerald-400/50 bg-white/95 px-2 py-0.5 text-[9px] font-bold text-emerald-800 shadow-sm backdrop-blur-sm dark:bg-stone-900/90 dark:text-emerald-300">
            <ShieldCheck className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
            Verified Store
          </span>
        ) : (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full border border-stone-200/80 bg-white/95 px-2 py-0.5 text-[9px] font-semibold text-stone-700 shadow-xs backdrop-blur-sm dark:border-stone-700 dark:bg-stone-900/90 dark:text-stone-300">
            <Store className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
            Local Store
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3
              className={`line-clamp-2 text-base font-semibold leading-6 transition-colors duration-200 ${
                isRoyal ? "text-white group-hover:text-amber-300" : "text-stone-900 group-hover:text-emerald-700 dark:text-stone-50 dark:group-hover:text-emerald-400"
              }`}
            >
              {product.name}
            </h3>
            <p className={`mt-1 text-xs ${isRoyal ? "text-amber-200/70" : isVerified ? "text-emerald-700 dark:text-emerald-400 font-medium" : "text-stone-500 dark:text-stone-400"}`}>
              {product.brand ?? (isRoyal ? "Royal Selection" : isVerified ? "Verified Merchant" : "Local Merchant")}
            </p>
          </div>

          {typeof product.rating === "number" ? (
            <div
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${
                isRoyal
                  ? "border border-amber-400/30 bg-amber-500/15 text-amber-300"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
              }`}
            >
              <Star className="h-3 w-3 fill-current" />
              {product.rating.toFixed(1)}
            </div>
          ) : null}
        </div>

        <p className={`mt-3 text-sm ${isRoyal ? "text-stone-400" : "text-stone-500 dark:text-stone-400"}`}>
          {product.unit ?? "Standard pack"}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className={`text-xl font-bold ${isRoyal ? "text-white" : "text-stone-900 dark:text-stone-50"}`}>
              ₹{displayPrice}
            </p>
            {displayPrice !== product.price ? (
              <p className="text-sm text-stone-400 line-through">₹{product.price}</p>
            ) : null}
          </div>
          {discountPercent ? (
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                isRoyal
                  ? "border border-amber-400/30 bg-amber-500/15 text-amber-300"
                  : isVerified
                  ? "border border-emerald-300/70 bg-emerald-50 font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "border border-emerald-200/90 bg-emerald-50 text-[10px] font-bold text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
              }`}
            >
              Save {discountPercent}%
            </span>
          ) : null}
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleAddToCart();
              }}
              disabled={addCartMutation.isPending || isOutOfStock}
              className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                isOutOfStock
                  ? "cursor-not-allowed bg-stone-300 text-stone-500 dark:bg-stone-700 dark:text-stone-300"
                  : isRoyal
                  ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/25 hover:from-amber-300 hover:to-yellow-300 active:translate-y-[1px]"
                  : isVerified
                  ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/25 hover:bg-emerald-500 active:translate-y-[1px]"
                  : "bg-emerald-600 text-white font-semibold shadow-xs hover:bg-emerald-700 active:scale-[0.98]"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>

            <button
              type="button"
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              onClick={handleToggleWishlist}
              disabled={addWishlistMutation.isPending || removeWishlistMutation.isPending}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 active:translate-y-[1px] ${
                isInWishlist
                  ? "border-red-200 bg-red-50 text-red-500 shadow-sm dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400"
                  : isRoyal
                  ? "border-amber-400/40 bg-stone-900/90 text-amber-200 hover:border-amber-400 hover:text-amber-300"
                  : isVerified
                  ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100/60 dark:border-emerald-900/60 dark:bg-zinc-900 dark:text-emerald-300"
                  : "border-stone-200 bg-stone-50 text-stone-600 hover:border-emerald-200 hover:text-emerald-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200 dark:hover:border-emerald-500/40 dark:hover:text-emerald-300"
              }`}
            >
              <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
            </button>
          </div>


          {message ? (
            <p className={`mt-3 text-xs font-medium ${isRoyal ? "text-amber-300" : "text-emerald-600 dark:text-emerald-400"}`}>
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
