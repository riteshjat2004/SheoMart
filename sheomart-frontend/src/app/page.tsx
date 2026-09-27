"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { HeroSection } from "@/components/home/HeroSection";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { TodayDealsSection } from "@/components/home/TodayDealsSection";
import { ShoppingCollections } from "@/components/home/ShoppingCollections";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { TrustAndStatsSection } from "@/components/home/TrustAndStatsSection";
import { LocalStorySection } from "@/components/home/LocalStorySection";
import { AppDownloadSection } from "@/components/home/AppDownloadSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FaqSection } from "@/components/home/FaqSection";
import { CategoryCard } from "@/components/marketplace/CategoryCard";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { StoreCard } from "@/components/store/StoreCard";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { CategorySkeleton } from "@/components/marketplace/skeletons/CategorySkeleton";
import { ProductSkeleton } from "@/components/marketplace/skeletons/ProductSkeleton";
import { StoreSkeleton } from "@/components/marketplace/skeletons/StoreSkeleton";
import { useCategories } from "@/hooks/use-categories";
import { useTrendingProducts } from "@/hooks/use-home";
import { useStores } from "@/hooks/use-stores";
import { useAddresses } from "@/hooks/use-addresses";
import { useAuthStore } from "@/store/auth-store";
import { useCoupons, useOffers } from "@/hooks/use-promotions";
import { ArrowRight, ShoppingCart, Sparkles, Store, Compass } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const categoriesQuery = useCategories();
  const productsQuery = useTrendingProducts();
  const isCustomer = useAuthStore((state) => state.user?.role === "customer");
  const addressesQuery = useAddresses(isCustomer);
  const defaultAddress = addressesQuery.data?.find((address) => address.isDefault) ?? addressesQuery.data?.[0];
  const storesQuery = useStores(isCustomer && defaultAddress ? { pincode: defaultAddress.pincode } : undefined);
  const offersQuery = useOffers();
  const couponsQuery = useCoupons();

  const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];
  const products = Array.isArray(productsQuery.data) ? productsQuery.data : [];
  const stores = Array.isArray(storesQuery.data) ? storesQuery.data : [];

  const nearbyStores = stores.slice(0, 6);
  const featuredCategories = categories.slice(0, 8);
  const featuredProducts = products.slice(0, 8);
  const allOffers = offersQuery.data ?? [];
  const allCoupons = couponsQuery.data ?? [];

  const categoryLookup = useMemo(() => new Map(categories.flatMap((category) => {
    const categoryId = category.categoryId ?? category._id;
    return categoryId ? [[categoryId, { categoryId, name: category.name, slug: category.slug ?? categoryId }] as const] : [];
  })), [categories]);

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/explore?query=${encodeURIComponent(trimmed)}`);
  };

  return (
    <PageWrapper>
      <Section className="pt-4 sm:pt-6 lg:pt-8 pb-16">
        <Container className="space-y-12 sm:space-y-16">
          {/* 1. HERO SECTION (Dynamic Greeting, Search, Location, Floating Cards) */}
          <HeroSection
            initialSearch={searchQuery}
            onSearch={handleSearchSubmit}
          />

          {/* 2. BRAND MARQUEE (Top Neighborhood Brands Ticker) */}
          <BrandMarquee />

          {/* 3. TODAY'S DEALS & PROMOTIONS (Flash Deals, Live Countdown, Instant Copy Coupons) */}
          <TodayDealsSection
            offers={allOffers}
            coupons={allCoupons}
            categoryLookup={categoryLookup}
          />

          {/* 4. FEATURED CATEGORIES EXPERIENCE */}
          <section className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Explore Departments
                </span>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Shop by category
                </h2>
                <p className="mt-1 text-sm text-stone-400">
                  Everything you need for your pantry, kitchen, and home routines.
                </p>
              </div>

              {categories.length > featuredCategories.length && (
                <Button asChild variant="outline" className="rounded-xl border-stone-800 text-stone-300 hover:bg-stone-800">
                  <Link href="/categories">
                    View All Categories ({categories.length})
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>

            {categoriesQuery.isLoading ? (
              <CategorySkeleton />
            ) : categoriesQuery.isError ? (
              <div className="space-y-4 rounded-3xl border border-stone-800 bg-stone-900/60 p-6 shadow-sm">
                <ErrorState message={categoriesQuery.error instanceof Error ? categoriesQuery.error.message : "Unable to load categories."} />
                <div className="flex justify-end">
                  <Button onClick={() => categoriesQuery.refetch()}>Retry</Button>
                </div>
              </div>
            ) : categories.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4">
                {featuredCategories.map((category) => (
                  <CategoryCard key={category.categoryId ?? category.name} category={category} />
                ))}
              </div>
            ) : (
              <EmptyState title="Categories will appear soon." description="We are fetching the latest categories from SheoMart." />
            )}
          </section>

          {/* 5. TRENDING PRODUCTS & DAILY ESSENTIALS */}
          <section className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Popular in Sheopur"
                title="Trending & daily essentials"
                description="Fast-selling staples, fresh produce, and customer favorites."
              />
              <Button asChild variant="outline" className="rounded-xl border-stone-800 text-stone-300 hover:bg-stone-800">
                <Link href="/explore">
                  View All Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {productsQuery.isLoading ? (
              <ProductSkeleton />
            ) : productsQuery.isError ? (
              <div className="space-y-4 rounded-3xl border border-stone-800 bg-stone-900/60 p-6 shadow-sm">
                <ErrorState message={productsQuery.error instanceof Error ? productsQuery.error.message : "Unable to load products."} />
                <div className="flex justify-end">
                  <Button onClick={() => productsQuery.refetch()}>Retry</Button>
                </div>
              </div>
            ) : featuredProducts.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <TrendingProducts products={featuredProducts} />
              </div>
            ) : (
              <EmptyState title="No products available yet." description="Check back soon for fresh SheoMart arrivals." />
            )}
          </section>

          {/* 6. CURATED ROUTINE COLLECTIONS */}
          <ShoppingCollections />

          {/* 7. TRUSTED NEIGHBORHOOD STORES */}
          <section className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Neighborhood Kiranas"
                title="Trusted local stores near you"
                description="Verified sellers ready to pack your order fresh and deliver locally."
              />
              <Button asChild variant="outline" className="rounded-xl border-stone-800 text-stone-300 hover:bg-stone-800">
                <Link href="/stores">
                  Explore All Stores
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {storesQuery.isLoading ? (
              <StoreSkeleton />
            ) : storesQuery.isError ? (
              <div className="space-y-4 rounded-3xl border border-stone-800 bg-stone-900/60 p-6 shadow-sm">
                <ErrorState message={storesQuery.error instanceof Error ? storesQuery.error.message : "Unable to load stores."} />
                <div className="flex justify-end">
                  <Button onClick={() => storesQuery.refetch()}>Retry</Button>
                </div>
              </div>
            ) : nearbyStores.length ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {nearbyStores.map((store) => (
                  <StoreCard key={store.storeId ?? store.storeName ?? store.name ?? "store"} store={store} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <EmptyState title="No nearby stores found in your sector." description="Try exploring all approved stores to find another seller in Sheopur." />
                <div className="flex justify-center">
                  <Button asChild variant="outline">
                    <Link href="/explore">Explore all stores</Link>
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* 8. HOW SHEOMART WORKS (3-Step Animated Timeline) */}
          <HowItWorksSection />

          {/* 9. TRUST PILLARS & LIVE MARKETPLACE METRICS */}
          <TrustAndStatsSection />

          {/* 10. LOCAL STORYTELLING ("The Heart of Sheopur") */}
          <LocalStorySection />

          {/* 11. ANDROID APP DOWNLOAD EXPERIENCE */}
          <AppDownloadSection />

          {/* 12. CUSTOMER TESTIMONIALS (Real Sheopur Reviews) */}
          <TestimonialsSection />

          {/* 13. FREQUENTLY ASKED QUESTIONS */}
          <FaqSection />
        </Container>
      </Section>

      {/* Mobile Sticky Quick-Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-800 bg-stone-950/95 p-3 backdrop-blur-md sm:hidden">
        <div className="flex items-center justify-between gap-3 px-2">
          <Button asChild className="w-full rounded-xl bg-emerald-600 font-bold text-white shadow-lg hover:bg-emerald-500">
            <Link href="/explore" className="flex items-center justify-center gap-2">
              <Compass className="h-4 w-4" />
              <span>Explore All Groceries</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="shrink-0 rounded-xl border-stone-800 px-4">
            <Link href="/stores" className="flex items-center gap-1.5 text-xs text-stone-300">
              <Store className="h-4 w-4 text-emerald-400" />
              <span>Stores</span>
            </Link>
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
