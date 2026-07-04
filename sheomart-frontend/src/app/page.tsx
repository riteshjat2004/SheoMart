"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Hero } from "@/components/marketplace/Hero";
import { SearchBar } from "@/components/marketplace/SearchBar";
import { CategoryCard } from "@/components/marketplace/CategoryCard";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { StoreCard } from "@/components/marketplace/StoreCard";
import { OfferCard } from "@/components/marketplace/OfferCard";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { CategorySkeleton } from "@/components/marketplace/skeletons/CategorySkeleton";
import { ProductSkeleton } from "@/components/marketplace/skeletons/ProductSkeleton";
import { StoreSkeleton } from "@/components/marketplace/skeletons/StoreSkeleton";
import { useCategories } from "@/hooks/use-categories";
import { useProducts } from "@/hooks/use-products";
import { useStores } from "@/hooks/use-stores";
import { ArrowRight, CheckCircle2, Clock3, Leaf, ShieldCheck, Smartphone } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const categoriesQuery = useCategories();
  const productsQuery = useProducts();
  const storesQuery = useStores();

  const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];
  const products = Array.isArray(productsQuery.data) ? productsQuery.data : [];
  const stores = Array.isArray(storesQuery.data) ? storesQuery.data : [];
  const featuredCategories = categories.slice(0, 4);
  const featuredProducts = products.slice(0, 8);
  const nearbyStores = stores.slice(0, 3);

  const handleSearchSubmit = () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    router.push(`/explore?query=${encodeURIComponent(trimmedQuery)}`);
  };

  return (
    <PageWrapper>
      <Section className="pt-8 sm:pt-10 lg:pt-12">
        <Container className="space-y-8">
          <Hero />

          <div className="rounded-[2rem] border border-stone-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/80">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Discover what you need</p>
                <h2 className="mt-2 text-xl font-semibold text-stone-900 dark:text-stone-50">Search fresh groceries, pantry staples, and everyday essentials.</h2>
              </div>
              <div className="w-full lg:max-w-xl">
                <SearchBar value={searchQuery} onChange={setSearchQuery} onSubmit={handleSearchSubmit} />
              </div>
            </div>
          </div>

          <section className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading eyebrow="Featured categories" title="Curated for your everyday routine" description="Browse fresh picks, pantry staples, beverages, and more designed for calm living." />
              {categories.length > featuredCategories.length ? (
                <Button asChild variant="outline" className="h-fit">
                  <Link href="/categories">View all categories</Link>
                </Button>
              ) : null}
            </div>
            {categoriesQuery.isLoading ? (
              <CategorySkeleton />
            ) : categoriesQuery.isError ? (
              <div className="space-y-4">
                <ErrorState message={categoriesQuery.error instanceof Error ? categoriesQuery.error.message : "Unable to load categories."} />
                <div className="flex justify-end">
                  <Button onClick={() => categoriesQuery.refetch()}>Retry</Button>
                </div>
              </div>
            ) : categories.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {featuredCategories.map((category) => (
                  <CategoryCard key={category.categoryId ?? category.name} category={category} />
                ))}
              </div>
            ) : (
              <EmptyState title="Categories will appear soon." description="We are fetching the latest categories from SheoMart." />
            )}
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <OfferCard title="Weekend freshness festival" description="Enjoy extra savings on organic produce and pantry staples all weekend long." accent="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" />
            <OfferCard title="First-order coupon" description="Use coupon SHEOMART10 for complimentary delivery on your first basket." accent="bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" />
          </section>

          <section className="space-y-5">
            <SectionHeading eyebrow="Trending products" title="Popular picks this week" description="Handpicked favorites prepared for fast browsing and smooth checkout later." />
            {productsQuery.isLoading ? (
              <ProductSkeleton />
            ) : productsQuery.isError ? (
              <div className="space-y-4">
                <ErrorState message={productsQuery.error instanceof Error ? productsQuery.error.message : "Unable to load products."} />
                <div className="flex justify-end">
                  <Button onClick={() => productsQuery.refetch()}>Retry</Button>
                </div>
              </div>
            ) : featuredProducts.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.productId ?? product.name} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState title="No products available yet." description="Check back soon for fresh SheoMart arrivals." />
            )}
          </section>

          <section className="space-y-5">
            <SectionHeading eyebrow="Nearby stores" title="Trusted neighborhood stores" description="Verified sellers ready to deliver from local inventory." />
            {storesQuery.isLoading ? (
              <StoreSkeleton />
            ) : storesQuery.isError ? (
              <div className="space-y-4">
                <ErrorState message={storesQuery.error instanceof Error ? storesQuery.error.message : "Unable to load stores."} />
                <div className="flex justify-end">
                  <Button onClick={() => storesQuery.refetch()}>Retry</Button>
                </div>
              </div>
            ) : nearbyStores.length ? (
              <div className="grid gap-4 md:grid-cols-3">
                {nearbyStores.map((store) => (
                  <StoreCard key={store.storeId ?? store.storeName ?? store.name ?? "store"} store={store} />
                ))}
              </div>
            ) : (
              <EmptyState title="No stores available yet." description="New stores will appear here once they are live." />
            )}
          </section>

          <section className="rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/80">
            <SectionHeading eyebrow="Why choose SheoMart" title="A thoughtful grocery experience" description="Modern shopping made simple, trustworthy, and beautifully designed." align="center" />
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[{ icon: Clock3, title: "Fast delivery", description: "Quick doorstep delivery with live updates" }, { icon: ShieldCheck, title: "Secure payments", description: "Protected transactions and trusted checkout" }, { icon: CheckCircle2, title: "Verified stores", description: "Only reliable sellers and quality checks" }, { icon: Leaf, title: "Fresh products", description: "Carefully selected, everyday essentials" }].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5 text-center dark:border-stone-800 dark:bg-stone-950/60">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-stone-50">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-[2rem] border border-emerald-100 bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white shadow-[0_24px_80px_-40px_rgba(16,185,129,0.65)] sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-100">Download the app</p>
                <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Shop smarter from your phone.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-50 sm:text-base">Get the SheoMart app for faster reorders, curated deals, and a smoother grocery routine.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" className="bg-white text-stone-900 hover:bg-stone-100">
                  <Smartphone className="mr-2 h-4 w-4" />
                  Download app
                </Button>
                <Button variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </section>
        </Container>
      </Section>
    </PageWrapper>
  );
}
