"use client";

import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Heart,
  Star,
  ShieldCheck,
  Crown,
  Clock,
  Truck,
  CheckCircle2,
  Share2,
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ProductReviewsSection } from "@/components/marketplace/ProductReviewsSection";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { useAuthStore } from "@/store/auth-store";
import { useProduct } from "@/hooks/use-product";
import { useProducts } from "@/hooks/use-products";
import { useStore } from "@/hooks/use-store";
import { useCategories } from "@/hooks/use-categories";
import { useCart, useAddCartItem, useUpdateCartItem, useRemoveCartItem } from "@/hooks/use-cart";
import { useCartAction } from "@/hooks/use-cart-action";
import { useAddWishlistItem, useRemoveWishlistItem, useWishlist } from "@/hooks/use-wishlist";
import { addRecentlyViewedProduct } from "@/lib/recently-viewed";
import type { ProductVariant } from "@/types/marketplace";

export function ProductDetailContent({ productId, storeId }: { productId?: string; storeId?: string }) {
  const router = useRouter();
  const productQuery = useProduct(productId, storeId);
  const productsQuery = useProducts();
  const categoriesQuery = useCategories();
  const wishlistQuery = useWishlist();
  const cartQuery = useCart();
  const updateCartItemMutation = useUpdateCartItem();
  const removeCartItemMutation = useRemoveCartItem();
  const { addItem, isPending: isAdding } = useCartAction();
  const addCartItemMutation = useAddCartItem();
  const addWishlistItemMutation = useAddWishlistItem();
  const removeWishlistItemMutation = useRemoveWishlistItem();
  const { isAuthenticated } = useAuthStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const product = productQuery.data;
  const selectedStoreId = storeId ?? product?.storeId;
  const storeQuery = useStore(selectedStoreId ?? undefined);
  const products = Array.isArray(productsQuery.data) ? productsQuery.data : [];
  const wishlist = Array.isArray(wishlistQuery.data) ? wishlistQuery.data : [];

  const wishlistItem = wishlist.find((item) => item.product?.productId === product?.productId);
  const isInWishlist = Boolean(wishlistItem);

  useEffect(() => {
    if (product?.productId) {
      addRecentlyViewedProduct(product.productId);
    }
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].variantId);
    } else {
      setSelectedVariantId(null);
    }
  }, [product?.productId, product?.variants]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length || !selectedVariantId) return null;
    return product.variants.find((v) => v.variantId === selectedVariantId) ?? null;
  }, [product?.variants, selectedVariantId]);

  // Gallery images
  const allImages = useMemo(() => {
    if (!product) return [];
    const list: string[] = [];
    if (product.image?.url) list.push(product.image.url);
    if (product.thumbnail && !list.includes(product.thumbnail)) list.push(product.thumbnail);
    if (Array.isArray(product.images)) {
      for (const img of product.images) {
        if (img && !list.includes(img)) list.push(img);
      }
    }
    return list.length ? list : ["/placeholder.png"];
  }, [product]);

  const activeImage = allImages[selectedImageIndex] ?? allImages[0];

  const activePrice = selectedVariant
    ? selectedVariant.price
    : product?.price ?? 0;

  const activeDiscountPrice = selectedVariant
    ? (selectedVariant.discountPrice && selectedVariant.discountPrice > 0 ? selectedVariant.discountPrice : selectedVariant.price)
    : product?.discountPrice ?? product?.price ?? 0;

  const displayPrice = activeDiscountPrice;

  const discountPercent =
    activePrice > 0 && activePrice > activeDiscountPrice
      ? Math.round(((activePrice - activeDiscountPrice) / activePrice) * 100)
      : product?.discount ?? 0;

  const isOutOfStock = (product?.quantity ?? 0) <= 0;

  // Related products
  const relatedProducts = useMemo(
    () =>
      product
        ? products
            .filter((item) => item.productId !== product.productId && item.isPublished && item.isActive)
            .sort(
              (first, second) =>
                Number(second.categoryId === product.categoryId) -
                  Number(first.categoryId === product.categoryId) ||
                Number(second.storeId === selectedStoreId) - Number(first.storeId === selectedStoreId)
            )
            .slice(0, 4)
        : [],
    [product, products, selectedStoreId]
  );

  // Frequently bought together
  const frequentlyBoughtTogether = useMemo(
    () =>
      product
        ? products
            .filter(
              (item) =>
                item.productId !== product.productId &&
                item.isPublished &&
                item.isActive &&
                item.categoryId === product.categoryId
            )
            .slice(0, 2)
        : [],
    [product, products]
  );

  const categoryName =
    categoriesQuery.data?.find((category) => category.categoryId === product?.categoryId)?.name ??
    product?.category ??
    "Category unavailable";

  // Cart items for this product
  const cartItems = cartQuery.data?.cartItems || [];
  const productCartItems = useMemo(() => {
    if (!product?.productId) return [];
    return cartItems.filter((item) => item.product.productId === product.productId);
  }, [cartItems, product?.productId]);

  const totalInCartForProduct = useMemo(
    () => productCartItems.reduce((sum, item) => sum + item.quantity, 0),
    [productCartItems]
  );

  const totalCartPriceForProduct = useMemo(
    () =>
      productCartItems.reduce(
        (sum, item) =>
          sum +
          (item.unitDiscountPrice ??
            item.unitPrice ??
            item.product?.discountPrice ??
            item.product?.price ??
            0) *
            item.quantity,
        0
      ),
    [productCartItems]
  );

  const handleAddToCart = () => {
    if (!product?.productId) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setMessage(null);
    addItem({
      product: { ...product, storeId: selectedStoreId ?? product.storeId },
      variant: selectedVariant ?? undefined,
      quantity,
      onSuccess: () => {
        setMessage(
          `Added ${quantity} item(s) ${selectedVariant ? `(${selectedVariant.label}) ` : ""}to your cart.`
        );
      },
      onError: (error) => {
        setMessage(error.message || "Unable to add item to cart.");
      },
    });
  };

  const handleAddVariant = (variant: ProductVariant, qtyToAdd = 1) => {
    if (!product?.productId) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setMessage(null);
    addItem({
      product: { ...product, storeId: selectedStoreId ?? product.storeId },
      variant,
      quantity: qtyToAdd,
      onSuccess: () => {
        setMessage(`Added ${variant.label} to your cart.`);
      },
      onError: (error) => {
        setMessage(error.message || "Unable to add variant to cart.");
      },
    });
  };

  const handleUpdateCartItemQty = (cartItemId: string, newQty: number) => {
    setMessage(null);
    if (newQty <= 0) {
      removeCartItemMutation.mutate(cartItemId, {
        onSuccess: () => setMessage("Item removed from cart."),
      });
    } else {
      updateCartItemMutation.mutate({ cartItemId, quantity: newQty });
    }
  };

  const handleToggleWishlist = () => {
    if (!product?.productId) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setMessage(null);
    if (isInWishlist && wishlistItem?.wishlistItemId) {
      removeWishlistItemMutation.mutate(wishlistItem.wishlistItemId, {
        onSuccess: () => setMessage("Removed from wishlist."),
      });
    } else {
      addWishlistItemMutation.mutate(
        { productId: product.productId },
        {
          onSuccess: () => setMessage("Saved to your wishlist."),
        }
      );
    }
  };

  return (
    <PageWrapper>
      <Section className="space-y-6 py-6 sm:py-8 lg:py-10">
        <Container className="space-y-6">
          {/* Breadcrumb / Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <Link href="/explore" className="hover:text-emerald-600">
                Explore
              </Link>
              <span>/</span>
              <span className="text-stone-700 dark:text-stone-300">{categoryName}</span>
              <span>/</span>
              <span className="font-semibold text-stone-900 line-clamp-1 dark:text-stone-50">
                {product?.name ?? "Product"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/explore">
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href="/recently-viewed">Recently viewed</Link>
              </Button>
            </div>
          </div>

          {productQuery.isLoading ? (
            <div className="h-96 animate-pulse rounded-[2rem] bg-stone-100 dark:bg-stone-800" />
          ) : productQuery.isError ? (
            <ErrorState
              message={
                productQuery.error instanceof Error ? productQuery.error.message : "Unable to load product."
              }
            />
          ) : product ? (
            <div className="space-y-8">
              {/* Product Hero Grid */}
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Left: Gallery */}
                <div className="space-y-4">
                  <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-50 shadow-sm dark:border-stone-800 dark:bg-stone-950">
                    <img
                      src={activeImage}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-300"
                    />
                    {discountPercent ? (
                      <span className="absolute left-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                        {discountPercent}% OFF
                      </span>
                    ) : null}
                  </div>

                  {allImages.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                            selectedImageIndex === idx
                              ? "border-emerald-500 shadow-md"
                              : "border-stone-200 opacity-70 hover:opacity-100 dark:border-stone-700"
                          }`}
                        >
                          <img src={img} alt="thumbnail" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Info & Actions */}
                <div className="flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    {/* Brand & Store Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                        {product.brand || "SheoMart Quality"}
                      </span>
                      {storeQuery.data && (
                        <Link
                          href={`/stores/${storeQuery.data.storeId}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-700 hover:border-emerald-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{storeQuery.data.storeName || "Approved Store"}</span>
                        </Link>
                      )}
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-50">
                      {product.name}
                    </h1>

                    {/* Rating & Pack size */}
                    <div className="flex items-center gap-3 text-xs">
                      {typeof product.rating === "number" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {product.rating.toFixed(1)} Rating
                        </span>
                      )}
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                        {selectedVariant
                          ? selectedVariant.label
                          : product.unitLabel
                          ? product.unitLabel
                          : product.sellingType === "WEIGHT"
                          ? `Base: per ${product.baseUnit || "kg"}`
                          : product.sellingType === "VOLUME"
                          ? `Base: per ${product.baseUnit || "L"}`
                          : product.unit || "1 pack"}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 font-medium ${
                          isOutOfStock
                            ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                        }`}
                      >
                        {isOutOfStock ? "Out of Stock" : `${product.quantity ?? 10} in stock`}
                      </span>
                    </div>

                    {/* Portion / Variant Selector */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="space-y-3 rounded-2xl border border-stone-200/80 bg-stone-50/60 p-4 dark:border-stone-800 dark:bg-stone-900/40">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                              <Layers className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              Available Packs &amp; Portions
                            </label>
                            <p className="text-[11px] text-stone-500">
                              Add any mix of pack sizes simultaneously to your cart
                            </p>
                          </div>
                          {totalInCartForProduct > 0 && (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                              {totalInCartForProduct} in Cart
                            </span>
                          )}
                        </div>

                        <div className="grid gap-2.5 pt-1">
                          {product.variants.map((variant) => {
                            const isSelected = selectedVariantId === variant.variantId;
                            const vPrice =
                              variant.discountPrice &&
                              variant.discountPrice > 0 &&
                              variant.discountPrice < variant.price
                                ? variant.discountPrice
                                : variant.price;
                            const hasVariantDiscount =
                              variant.discountPrice &&
                              variant.discountPrice > 0 &&
                              variant.discountPrice < variant.price;
                            const vDiscountPercent = hasVariantDiscount
                              ? Math.round(((variant.price - variant.discountPrice!) / variant.price) * 100)
                              : 0;

                            const cartItem = productCartItems.find(
                              (item) => item.variantId === variant.variantId
                            );
                            const inCartQty = cartItem ? cartItem.quantity : 0;

                            return (
                              <div
                                key={variant.variantId}
                                onClick={() => setSelectedVariantId(variant.variantId)}
                                className={`flex items-center justify-between rounded-xl border p-3 transition cursor-pointer ${
                                  isSelected
                                    ? "border-emerald-600 bg-white shadow-xs ring-1 ring-emerald-600/30 dark:border-emerald-500 dark:bg-stone-900"
                                    : "border-stone-200 bg-white hover:border-emerald-300 dark:border-stone-800 dark:bg-stone-900/60"
                                }`}
                              >
                                <div className="flex-1 min-w-0 pr-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                      {variant.label}
                                    </span>
                                    {hasVariantDiscount && (
                                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                        {vDiscountPercent}% OFF
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-baseline gap-2 mt-0.5">
                                    <span className="text-sm font-extrabold text-stone-900 dark:text-stone-50">
                                      ₹{vPrice}
                                    </span>
                                    {hasVariantDiscount && (
                                      <span className="text-xs text-stone-400 line-through">
                                        ₹{variant.price}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Direct Cart Controller for this Variant */}
                                <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                                  {inCartQty > 0 ? (
                                    <div className="flex items-center rounded-full border-2 border-emerald-600 bg-emerald-50 px-1.5 py-0.5 shadow-sm dark:bg-emerald-950/60">
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateCartItemQty(cartItem!.cartItemId, inCartQty - 1)}
                                        disabled={updateCartItemMutation.isPending || removeCartItemMutation.isPending}
                                        className="rounded-full p-1 text-emerald-800 hover:bg-emerald-100 dark:text-emerald-200 dark:hover:bg-emerald-900/60 transition"
                                        aria-label="Decrease quantity"
                                      >
                                        <Minus className="h-3.5 w-3.5" />
                                      </button>
                                      <span className="min-w-6 text-center text-xs font-bold text-emerald-900 dark:text-emerald-100 px-1">
                                        {inCartQty}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateCartItemQty(cartItem!.cartItemId, inCartQty + 1)}
                                        disabled={updateCartItemMutation.isPending}
                                        className="rounded-full p-1 text-emerald-800 hover:bg-emerald-100 dark:text-emerald-200 dark:hover:bg-emerald-900/60 transition"
                                        aria-label="Increase quantity"
                                      >
                                        <Plus className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleAddVariant(variant, 1)}
                                      disabled={isAdding || isOutOfStock}
                                      className="rounded-full border-emerald-600 text-xs font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-600 h-8 px-3.5"
                                    >
                                      <Plus className="mr-1 h-3.5 w-3.5" /> Add
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Price section */}
                    <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/50">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-extrabold text-stone-900 dark:text-stone-50">
                          ₹{displayPrice}
                        </span>
                        {displayPrice !== activePrice && (
                          <span className="text-lg text-stone-400 line-through">
                            ₹{activePrice}
                          </span>
                        )}
                        {discountPercent ? (
                          <span className="text-xs font-bold text-emerald-600">
                            Save ₹{activePrice - displayPrice} ({discountPercent}% OFF)
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-[11px] text-stone-500">
                        {selectedVariant
                          ? `Price for ${selectedVariant.label} • Inclusive of all taxes`
                          : product.unitLabel
                          ? `Price ${product.unitLabel} • Inclusive of all taxes`
                          : "Inclusive of all taxes • Superfast local delivery"}
                      </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                        Product Highlights
                      </h3>
                      <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">
                        {product.description ||
                          "Carefully sourced and handled under optimal storage conditions for exceptional quality and freshness."}
                      </p>
                    </div>

                    {/* Nutritional Information or Store Guarantees */}
                    {product.hasNutritionalInfo && product.nutritionalInfo ? (
                      <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-zinc-900">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                            Nutritional Information
                          </h4>
                          <span className="text-[11px] font-medium text-stone-400">
                            {product.nutritionalInfo.servingSize || "Approx per 100g"}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                          <div className="rounded-xl bg-stone-50 p-2 dark:bg-stone-800">
                            <p className="text-[10px] text-stone-500">Energy</p>
                            <p className="font-bold text-stone-900 dark:text-stone-50">
                              {product.nutritionalInfo.energy || "—"}
                            </p>
                          </div>
                          <div className="rounded-xl bg-stone-50 p-2 dark:bg-stone-800">
                            <p className="text-[10px] text-stone-500">Protein</p>
                            <p className="font-bold text-stone-900 dark:text-stone-50">
                              {product.nutritionalInfo.protein || "—"}
                            </p>
                          </div>
                          <div className="rounded-xl bg-stone-50 p-2 dark:bg-stone-800">
                            <p className="text-[10px] text-stone-500">Carbs</p>
                            <p className="font-bold text-stone-900 dark:text-stone-50">
                              {product.nutritionalInfo.carbs || "—"}
                            </p>
                          </div>
                          <div className="rounded-xl bg-stone-50 p-2 dark:bg-stone-800">
                            <p className="text-[10px] text-stone-500">Fats</p>
                            <p className="font-bold text-stone-900 dark:text-stone-50">
                              {product.nutritionalInfo.fats || "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* When unticked by seller: fill this space with SheoMart Store Quality & Guarantees */
                      <div className="rounded-2xl border border-stone-200/80 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-900/40">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                            Quality &amp; Store Guarantees
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verified Quality
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-2 rounded-xl bg-white p-2.5 shadow-2xs dark:bg-stone-800">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[11px] text-stone-900 dark:text-stone-100 truncate">100% Inspected</p>
                              <p className="text-[10px] text-stone-400 truncate">Hygienic handling</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 rounded-xl bg-white p-2.5 shadow-2xs dark:bg-stone-800">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <Truck className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[11px] text-stone-900 dark:text-stone-100 truncate">Direct Delivery</p>
                              <p className="text-[10px] text-stone-400 truncate">Local store dispatch</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quantity & Action Buttons */}
                  <div className="space-y-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                    {totalInCartForProduct > 0 ? (
                      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/40">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-bold text-stone-900 dark:text-stone-50">
                              {totalInCartForProduct} item(s) in your cart
                            </span>
                          </div>
                          <span className="text-base font-extrabold text-stone-900 dark:text-stone-50">
                            Total: ₹{totalCartPriceForProduct}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-stone-600 dark:text-stone-300">
                          {productCartItems.map((item) => {
                            const unitPrice =
                              item.unitDiscountPrice ??
                              item.unitPrice ??
                              item.product?.discountPrice ??
                              item.product?.price ??
                              0;
                            return (
                              <span
                                key={item.cartItemId}
                                className="rounded-full bg-white px-2.5 py-1 font-medium shadow-2xs dark:bg-stone-800"
                              >
                                {item.quantity} × {item.variantLabel || item.product.unit || "Pack"} (₹{unitPrice * item.quantity})
                              </span>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                          <Button
                            asChild
                            className="flex-1 rounded-full bg-emerald-600 py-6 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
                          >
                            <Link href="/cart">
                              <ShoppingBag className="mr-2 h-4 w-4" /> Go to Cart • ₹{totalCartPriceForProduct}
                            </Link>
                          </Button>

                          {/* Wishlist button */}
                          <button
                            type="button"
                            onClick={handleToggleWishlist}
                            disabled={
                              addWishlistItemMutation.isPending || removeWishlistItemMutation.isPending
                            }
                            className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${
                              isInWishlist
                                ? "border-red-200 bg-red-50 text-red-500 shadow-sm dark:border-red-900/60 dark:bg-red-950/40"
                                : "border-stone-200 bg-stone-50 text-stone-600 hover:text-emerald-600 dark:border-stone-700 dark:bg-stone-950"
                            }`}
                          >
                            <Heart className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        {/* Quantity Counter */}
                        <div className="flex items-center rounded-full border border-stone-200 bg-stone-50 p-1 dark:border-stone-700 dark:bg-stone-950">
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            className="rounded-full p-2 text-stone-600 hover:bg-white hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-stone-900 dark:text-stone-50">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.min(product.quantity ?? 10, q + 1))}
                            disabled={(product.quantity ?? 0) <= quantity}
                            className="rounded-full p-2 text-stone-600 hover:bg-white hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Add to Cart button */}
                        <Button
                          onClick={handleAddToCart}
                          disabled={isOutOfStock || isAdding}
                          className="flex-1 rounded-full bg-emerald-600 py-6 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
                        >
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          {isOutOfStock
                            ? "Out of Stock"
                            : `Add ${selectedVariant ? `(${selectedVariant.label})` : ""} to Cart • ₹${displayPrice * quantity}`}
                        </Button>

                        {/* Wishlist button */}
                        <button
                          type="button"
                          onClick={handleToggleWishlist}
                          disabled={
                            addWishlistItemMutation.isPending || removeWishlistItemMutation.isPending
                          }
                          className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${
                            isInWishlist
                              ? "border-red-200 bg-red-50 text-red-500 shadow-sm dark:border-red-900/60 dark:bg-red-950/40"
                              : "border-stone-200 bg-stone-50 text-stone-600 hover:text-emerald-600 dark:border-stone-700 dark:bg-stone-950"
                          }`}
                        >
                          <Heart className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    )}

                    {message && (
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Frequently Bought Together */}
              {frequentlyBoughtTogether.length > 0 && (
                <section className="space-y-4 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">
                    Pair Well With
                  </p>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50">
                    Frequently Bought Together
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {frequentlyBoughtTogether.map((item) => (
                      <ProductCard key={item.productId} product={item} />
                    ))}
                  </div>
                </section>
              )}

              {/* Reviews Section */}
              <ProductReviewsSection
                productId={product.productId || ""}
                productName={product.name}
              />

              {/* Related Products */}
              {relatedProducts.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">
                        Similar Items
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-50">
                        More in {categoryName}
                      </h2>
                    </div>
                    <Link
                      href="/explore"
                      className="text-xs font-semibold text-emerald-600 hover:underline"
                    >
                      View all
                    </Link>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {relatedProducts.map((item) => (
                      <ProductCard key={item.productId} product={item} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <EmptyState
              title="Product not found"
              description="This product is no longer available or may have been removed."
            />
          )}
        </Container>
      </Section>
    </PageWrapper>
  );
}

export default function ProductDetailPage() {
  const params = useParams<{ productId: string }>();
  const searchParams = useSearchParams();
  return (
    <ProductDetailContent
      productId={params?.productId}
      storeId={searchParams.get("storeId") ?? undefined}
    />
  );
}
