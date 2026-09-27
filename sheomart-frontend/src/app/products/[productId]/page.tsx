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
import { useAddCartItem } from "@/hooks/use-cart";
import { useAddWishlistItem, useRemoveWishlistItem, useWishlist } from "@/hooks/use-wishlist";
import { addRecentlyViewedProduct } from "@/lib/recently-viewed";

export function ProductDetailContent({ productId, storeId }: { productId?: string; storeId?: string }) {
  const router = useRouter();
  const productQuery = useProduct(productId, storeId);
  const productsQuery = useProducts();
  const categoriesQuery = useCategories();
  const wishlistQuery = useWishlist();
  const addCartItemMutation = useAddCartItem();
  const addWishlistItemMutation = useAddWishlistItem();
  const removeWishlistItemMutation = useRemoveWishlistItem();
  const { isAuthenticated } = useAuthStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
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
  }, [product]);

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

  const discountPercent =
    product?.discount ??
    (product?.discountPrice && product?.price
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0);

  const displayPrice = product?.discountPrice ?? product?.price ?? 0;
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

  const handleAddToCart = () => {
    if (!product?.productId) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setMessage(null);
    addCartItemMutation.mutate(
      { productId: product.productId, storeId: selectedStoreId ?? undefined, quantity },
      {
        onSuccess: () => {
          setMessage(`Added ${quantity} item(s) to your cart.`);
        },
        onError: (error) => {
          setMessage(error instanceof Error ? error.message : "Unable to add item to cart.");
        },
      }
    );
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
                        {product.unit || "1 pack"}
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

                    {/* Price section */}
                    <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/50">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-extrabold text-stone-900 dark:text-stone-50">
                          ₹{displayPrice}
                        </span>
                        {displayPrice !== product.price && (
                          <span className="text-lg text-stone-400 line-through">
                            ₹{product.price}
                          </span>
                        )}
                        {discountPercent ? (
                          <span className="text-xs font-bold text-emerald-600">
                            Save ₹{product.price - displayPrice} ({discountPercent}% OFF)
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-[11px] text-stone-500">
                        Inclusive of all taxes • Superfast local delivery
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

                    {/* Nutrition facts placeholder */}
                    <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-zinc-900">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                        Nutritional Information (Approx per 100g)
                      </h4>
                      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="rounded-xl bg-stone-50 p-2 dark:bg-stone-800">
                          <p className="text-[10px] text-stone-500">Energy</p>
                          <p className="font-bold text-stone-900 dark:text-stone-50">120 kcal</p>
                        </div>
                        <div className="rounded-xl bg-stone-50 p-2 dark:bg-stone-800">
                          <p className="text-[10px] text-stone-500">Protein</p>
                          <p className="font-bold text-stone-900 dark:text-stone-50">3.2 g</p>
                        </div>
                        <div className="rounded-xl bg-stone-50 p-2 dark:bg-stone-800">
                          <p className="text-[10px] text-stone-500">Carbs</p>
                          <p className="font-bold text-stone-900 dark:text-stone-50">18.5 g</p>
                        </div>
                        <div className="rounded-xl bg-stone-50 p-2 dark:bg-stone-800">
                          <p className="text-[10px] text-stone-500">Fats</p>
                          <p className="font-bold text-stone-900 dark:text-stone-50">1.1 g</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Action Buttons */}
                  <div className="space-y-3 pt-4 border-t border-stone-100 dark:border-stone-800">
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
                        disabled={isOutOfStock || addCartItemMutation.isPending}
                        className="flex-1 rounded-full bg-emerald-600 py-6 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
                      >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        {isOutOfStock ? "Out of Stock" : `Add to Cart • ₹${displayPrice * quantity}`}
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
