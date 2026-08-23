"use client";

import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { useAuthStore } from "@/store/auth-store";
import { useProduct } from "@/hooks/use-product";
import { useProducts } from "@/hooks/use-products";
import { useStore } from "@/hooks/use-store";
import { useCategories } from "@/hooks/use-categories";
import { useAddCartItem } from "@/hooks/use-cart";
import { useAddWishlistItem, useWishlist } from "@/hooks/use-wishlist";
import { addRecentlyViewedProduct } from "@/lib/recently-viewed";

export function ProductDetailContent({ productId, storeId }: { productId?: string; storeId?: string }) {
  const router = useRouter();
  const productQuery = useProduct(productId, storeId);
  const productsQuery = useProducts();
  const categoriesQuery = useCategories();
  const wishlistQuery = useWishlist();
  const addCartItemMutation = useAddCartItem();
  const addWishlistItemMutation = useAddWishlistItem();
  const { isAuthenticated } = useAuthStore();
  const [message, setMessage] = useState<string | null>(null);

  const product = productQuery.data;
  const selectedStoreId = storeId ?? product?.storeId;
  const storeQuery = useStore(selectedStoreId ?? undefined);
  const products = Array.isArray(productsQuery.data) ? productsQuery.data : [];
  const wishlist = Array.isArray(wishlistQuery.data) ? wishlistQuery.data : [];
  const isInWishlist = wishlist.some((item) => item.product.productId === product?.productId);

  useEffect(() => {
    if (product?.productId) {
      addRecentlyViewedProduct(product.productId);
    }
  }, [product]);

  const relatedProducts = useMemo(() => product ? products.filter((item) => item.productId !== product.productId && item.isPublished && item.isActive).sort((first, second) => Number(second.categoryId === product.categoryId) - Number(first.categoryId === product.categoryId) || Number(second.storeId === selectedStoreId) - Number(first.storeId === selectedStoreId)).slice(0, 4) : [], [product, products, selectedStoreId]);
  const categoryName = categoriesQuery.data?.find((category) => category.categoryId === product?.categoryId)?.name ?? product?.category ?? "Category unavailable";

  const handleAddToCart = () => {
    if (!product?.productId) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setMessage(null);
    addCartItemMutation.mutate(
      { productId: product.productId, storeId: selectedStoreId ?? undefined, quantity: 1 },
      {
        onSuccess: () => {
          setMessage("Added to cart.");
        },
        onError: (error) => {
          setMessage(error instanceof Error ? error.message : "Unable to add item to cart.");
        },
      }
    );
  };

  const handleAddToWishlist = () => {
    if (!product?.productId) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setMessage(null);
    addWishlistItemMutation.mutate(
      { productId: product.productId },
      {
        onSuccess: () => {
          setMessage("Added to wishlist.");
        },
        onError: (error) => {
          setMessage(error instanceof Error ? error.message : "Unable to add item to wishlist.");
        },
      }
    );
  };

  return (
    <PageWrapper>
      <Section className="space-y-6 py-8 sm:py-10 lg:py-12">
        <Container className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionHeading eyebrow="Product details" title={product?.name ?? "Loading product"} description={product?.description ?? "Explore product details, pricing, and related items."} />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="h-fit">
                <Link href="/explore">Back to explore</Link>
              </Button>
              <Button asChild variant="secondary" className="h-fit">
                <Link href="/recently-viewed">Recently viewed</Link>
              </Button>
            </div>
          </div>

          {productQuery.isLoading ? (
            <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <p className="text-sm text-stone-500">Loading product details …</p>
            </div>
          ) : productQuery.isError ? (
            <ErrorState message={productQuery.error instanceof Error ? productQuery.error.message : "Unable to load product."} />
          ) : product ? (
            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-6">
                <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-stone-100">
                          <img
                            src={product.thumbnail || product.images?.[0] || "/placeholder.png"}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="grid gap-3">
                          {(product.images ?? []).slice(0, 4).map((image, index) => (
                            <div key={index} className="overflow-hidden rounded-[1.25rem] border border-stone-200 bg-stone-100">
                              <img src={image} alt={`${product.name} ${index + 1}`} className="h-28 w-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5 text-stone-700 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-200">
                          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Brand</p>
                          <p className="mt-2 text-base font-semibold text-stone-900 dark:text-stone-50">{product.brand || "Brand unavailable"}</p>
                        </div>
                        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5 text-stone-700 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-200">
                          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Availability</p>
                          <p className="mt-2 text-base font-semibold text-stone-900 dark:text-stone-50">{(product.quantity ?? 0) > 0 ? `${product.quantity} in stock` : "Out of stock"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm uppercase tracking-[0.24em] text-emerald-600">Price</p>
                            <div className="mt-2 flex items-baseline gap-3">
                              <p className="text-4xl font-semibold text-stone-900 dark:text-stone-50">₹{product.discountPrice ?? product.price}</p>
                              {product.discountPrice && product.discountPrice < product.price ? (
                                <p className="text-sm text-stone-400 line-through">₹{product.price}</p>
                              ) : null}
                            </div>
                          </div>
                          <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                            {product.rating?.toFixed(1) ?? "0.0"} ★
                          </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-300">
                          <p className="font-semibold text-stone-900 dark:text-stone-50">SKU</p>
                          <p className="mt-1">{product.sku ?? "N/A"}</p>
                        </div>
                      </div>

                      <div className="space-y-3 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-950/60">
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Description</p>
                        <p className="text-sm leading-7 text-stone-600 dark:text-stone-300">{product.description || "No additional product description available."}</p>
                      </div>

                      <div className="space-y-3 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-950/60">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Shop actions</p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">Customer shopping only</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Button onClick={handleAddToCart} disabled={(product.quantity ?? 0) === 0 || addCartItemMutation.isPending}>
                            {(product.quantity ?? 0) === 0 ? "Out of stock" : "Add to cart"}
                          </Button>
                          <Button
                            variant={isInWishlist ? "secondary" : "outline"}
                            onClick={handleAddToWishlist}
                            disabled={addWishlistItemMutation.isPending}
                          >
                            {isInWishlist ? "In wishlist" : "Add to wishlist"}
                          </Button>
                        </div>
                        {message ? <p className="text-sm text-stone-600 dark:text-stone-300">{message}</p> : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Related products</p>
                      <h2 className="mt-2 text-xl font-semibold text-stone-900 dark:text-stone-50">More like this</h2>
                    </div>
                    <Link href="/explore" className="text-sm font-medium text-emerald-600 hover:underline">Browse more</Link>
                  </div>
                  {relatedProducts.length ? (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {relatedProducts.map((item) => (
                        <ProductCard key={item.productId ?? item.name} product={item} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="No related products found" description="Explore other nearby categories or stores for similar items." />
                  )}
                </div>
              </div>

              <aside className="space-y-6">
                <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Product details</h3>
                  {storeQuery.data ? <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800"><div className="h-24 bg-stone-100 dark:bg-stone-800">{storeQuery.data.banner ? <img src={storeQuery.data.banner} alt="" className="h-full w-full object-cover" /> : null}</div><div className="flex items-center gap-3 p-3"><div className="h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-emerald-100 dark:border-stone-900">{storeQuery.data.logo ? <img src={storeQuery.data.logo} alt="" className="h-full w-full object-cover" /> : null}</div><p className="font-semibold text-stone-900 dark:text-stone-50">{storeQuery.data.storeName ?? storeQuery.data.name}</p></div></div> : null}
                  <div className="mt-4 space-y-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
                    <p><span className="font-semibold text-stone-900 dark:text-stone-50">Category:</span> {categoryName}</p>
                    <p><span className="font-semibold text-stone-900 dark:text-stone-50">Store:</span> {storeQuery.data?.storeName ?? storeQuery.data?.name ?? "Store unavailable"}</p>
                    {storeQuery.data ? <><p><span className="font-semibold text-stone-900 dark:text-stone-50">Store logo:</span> {storeQuery.data.logo ? "Available" : "Not available"}</p><p><span className="font-semibold text-stone-900 dark:text-stone-50">Store banner:</span> {storeQuery.data.banner ? "Available" : "Not available"}</p><p><span className="font-semibold text-stone-900 dark:text-stone-50">Store rating:</span> {storeQuery.data.rating?.toFixed(1) ?? "New"} ({storeQuery.data.totalReviews ?? 0} reviews)</p><p><span className="font-semibold text-stone-900 dark:text-stone-50">Address:</span> {[storeQuery.data.address, storeQuery.data.city, storeQuery.data.state, storeQuery.data.pincode].filter(Boolean).join(", ") || "N/A"}</p><p><span className="font-semibold text-stone-900 dark:text-stone-50">Phone:</span> {storeQuery.data.phone ?? "N/A"}</p><p><span className="font-semibold text-stone-900 dark:text-stone-50">Pickup hours:</span> {storeQuery.data.pickupOpeningTime ?? "10:00"} - {storeQuery.data.pickupClosingTime ?? "20:00"}</p></> : null}
                    <p><span className="font-semibold text-stone-900 dark:text-stone-50">Published:</span> {product.isPublished ? "Yes" : "No"}</p>
                    <p><span className="font-semibold text-stone-900 dark:text-stone-50">Status:</span> {product.isActive ? "Active" : "Inactive"}</p>
                    <p><span className="font-semibold text-stone-900 dark:text-stone-50">Last updated:</span> {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : "Unknown"}</p>
                  </div>
                </div>
              </aside>
            </div>
          ) : (
            <EmptyState title="Product not found" description="This product is no longer available or may have been removed." />
          )}
        </Container>
      </Section>
    </PageWrapper>
  );
}

export default function ProductDetailPage() {
  const params = useParams<{ productId: string }>();
  const searchParams = useSearchParams();
  return <ProductDetailContent productId={params?.productId} storeId={searchParams.get("storeId") ?? undefined} />;
}
