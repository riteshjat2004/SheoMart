"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Hero } from "@/components/marketplace/Hero";
import { SearchBar } from "@/components/marketplace/SearchBar";
import { CategoryCard } from "@/components/marketplace/CategoryCard";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { HomepagePromotions } from "@/components/home/HomepagePromotions";
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
import { ArrowRight, Check, CheckCircle2, Clock3, Copy, Leaf, ShieldCheck, Smartphone } from "lucide-react";
import { useCoupons, useOffers } from "@/hooks/use-promotions";
import { ANDROID_APP } from "@/constants/app";
import { trackEvent } from "@/lib/analytics";

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const expiry = (value: string) => new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

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
  const nearbyStores = stores.slice(0, 8);
  const featuredCategories = categories.slice(0, 4);
  const featuredProducts = products.slice(0, 8);
  const allOffers = offersQuery.data ?? [];
  const allCoupons = couponsQuery.data ?? [];
  const categoryLookup = useMemo(() => new Map(categories.flatMap((category) => {
    const categoryId = category.categoryId ?? category._id;
    return categoryId ? [[categoryId, { categoryId, name: category.name, slug: category.slug ?? categoryId }] as const] : [];
  })), [categories]);

  const handleSearchSubmit = () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    router.push(`/explore?query=${encodeURIComponent(trimmedQuery)}`);
  };

  return (
    <PageWrapper>
      <Section className="pt-6 sm:pt-8 lg:pt-10">
        <Container className="space-y-6 sm:space-y-8">
          <Hero />

          <div className="relative z-20 overflow-visible rounded-[2rem] border border-stone-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-zinc-900/85">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Discover what you need</p>
                <h2 className="mt-2 text-lg font-semibold text-stone-900 sm:text-xl dark:text-stone-50">Search fresh groceries, pantry staples, and everyday essentials in seconds.</h2>
              </div>
              <div className="w-full lg:max-w-xl">
                <SearchBar value={searchQuery} onChange={setSearchQuery} onSubmit={handleSearchSubmit} enableSuggestions />
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
              <div className="space-y-4 rounded-[1.75rem] border border-stone-200 bg-white/80 p-5 shadow-sm dark:border-stone-800 dark:bg-zinc-900/80">
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

          <HomepagePromotions offers={allOffers} coupons={allCoupons} categoryLookup={categoryLookup} />

          <section className="space-y-5">
            <SectionHeading eyebrow="Trending products" title="Popular picks this week" description="Handpicked favorites prepared for fast browsing and smooth checkout later." />
            {productsQuery.isLoading ? (
              <ProductSkeleton />
            ) : productsQuery.isError ? (
              <div className="space-y-4 rounded-[1.75rem] border border-stone-200 bg-white/80 p-5 shadow-sm dark:border-stone-800 dark:bg-zinc-900/80">
                <ErrorState message={productsQuery.error instanceof Error ? productsQuery.error.message : "Unable to load products."} />
                <div className="flex justify-end">
                  <Button onClick={() => productsQuery.refetch()}>Retry</Button>
                </div>
              </div>
            ) : featuredProducts.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <TrendingProducts products={featuredProducts} />
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
              <div className="space-y-4 rounded-[1.75rem] border border-stone-200 bg-white/80 p-5 shadow-sm dark:border-stone-800 dark:bg-zinc-900/80">
                <ErrorState message={storesQuery.error instanceof Error ? storesQuery.error.message : "Unable to load stores."} />
                <div className="flex justify-end">
                  <Button onClick={() => storesQuery.refetch()}>Retry</Button>
                </div>
              </div>
            ) : nearbyStores.length ? (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  {nearbyStores.map((store) => (
                    <StoreCard key={store.storeId ?? store.storeName ?? store.name ?? "store"} store={store} />
                  ))}
                </div>
                <div className="flex justify-center">
                  <Button asChild variant="outline">
                    <Link href="/stores">
                      View All Stores
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4"><EmptyState title="No nearby stores found in your area." description="Try exploring all approved stores to find another seller." /><div className="flex justify-center"><Button asChild variant="outline"><Link href="/explore">Explore all stores</Link></Button></div></div>
            )}
          </section>

          <section className="rounded-[2rem] border border-stone-200 bg-white/90 p-6 shadow-sm dark:border-stone-800 dark:bg-zinc-900/85">
            <SectionHeading eyebrow="Why choose SheoMart" title="A thoughtful grocery experience" description="Modern shopping made simple, trustworthy, and beautifully designed." align="center" />
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[{ icon: Clock3, title: "Fast delivery", description: "Quick doorstep delivery with live updates" }, { icon: ShieldCheck, title: "Secure payments", description: "Protected transactions and trusted checkout" }, { icon: CheckCircle2, title: "Verified stores", description: "Only reliable sellers and quality checks" }, { icon: Leaf, title: "Fresh products", description: "Carefully selected, everyday essentials" }].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-stone-800 dark:bg-stone-950/70">
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

          <section className="rounded-[2rem] border border-emerald-100 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 p-6 text-white shadow-[0_24px_80px_-40px_rgba(16,185,129,0.65)] sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-100">Download the app</p>
                <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Shop smarter from your phone.</h2>
                <p className="mt-3 text-sm leading-7 text-emerald-50 sm:text-base">Get the SheoMart app for faster reorders, curated deals, and a smoother grocery routine.</p>

                {/* Compact Beta Features List */}
                <div className="mt-5 grid grid-cols-1 gap-4 border-t border-emerald-400/30 pt-4 sm:grid-cols-2 text-xs">
                  <div className="space-y-2">
                    <p className="font-semibold uppercase tracking-wider text-emerald-100 text-[11px]">Features</p>
                    <ul className="space-y-1.5 text-emerald-50">
                      <li className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 shrink-0 text-white" />
                        <span>Secure Login</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 shrink-0 text-white" />
                        <span>Home Screen</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 shrink-0 text-white" />
                        <span>Browse Categories</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 shrink-0 text-white" />
                        <span>Featured Products</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold uppercase tracking-wider text-emerald-200/90 text-[11px]">Coming Soon</p>
                    <ul className="space-y-1.5 text-emerald-100/80">
                      <li className="flex items-center gap-2">
                        <Clock3 className="h-3.5 w-3.5 shrink-0 text-emerald-200" />
                        <span>Cart</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock3 className="h-3.5 w-3.5 shrink-0 text-emerald-200" />
                        <span>Wishlist</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock3 className="h-3.5 w-3.5 shrink-0 text-emerald-200" />
                        <span>Orders</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock3 className="h-3.5 w-3.5 shrink-0 text-emerald-200" />
                        <span>Payments</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:items-end">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-700/50 px-3 py-1 text-xs font-medium text-emerald-100 shadow-sm backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300"></span>
                  Android Beta v{ANDROID_APP.VERSION}
                </span>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={ANDROID_APP.DOWNLOAD_PATH}
                    download={`SheoMart-v${ANDROID_APP.VERSION}-beta.apk`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackEvent("app_download_clicked", {
                        platform: "android",
                        version: ANDROID_APP.VERSION,
                        source: "homepage_download_section",
                      });
                    }}
                  >
                    <Button variant="secondary" className="bg-white text-stone-900 hover:bg-stone-100">
                      <Smartphone className="mr-2 h-4 w-4" />
                      Download app
                    </Button>
                  </a>
                  <Button variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10" asChild>
                    <Link href="/about">
                      Learn more
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-stone-200 bg-white/90 p-6 shadow-sm dark:border-stone-800 dark:bg-zinc-900/85">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Stay in the loop</p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-900 dark:text-stone-50">Get fresh deals and seasonal offers in your inbox.</h2>
                <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-300">Subscribe for curated picks, speedy delivery reminders, and member-only savings.</p>
              </div>
              <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-full border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 outline-none ring-0 transition focus:border-emerald-500 focus:bg-white dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200 dark:focus:bg-stone-900"
                />
                <Button className="shrink-0">Subscribe</Button>
              </div>
            </div>
          </section>
        </Container>
      </Section>
    </PageWrapper>
  );
}
