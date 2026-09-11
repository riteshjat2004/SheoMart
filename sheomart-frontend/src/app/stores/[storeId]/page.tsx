"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Boxes, Clock3, Crown, MapPin, MessageSquareText, PackageSearch, Phone, Search, ShieldCheck, SortAsc, Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { useCategories } from "@/hooks/use-categories";
import { useStore } from "@/hooks/use-store";
import { useProductsByStore } from "@/hooks/use-products-by-store";
import type { ProductItem, StoreBadge } from "@/types/marketplace";
import { VerifiedStoreHero } from "@/components/stores/verified/VerifiedStoreHero";
import { VerifiedTrustScore } from "@/components/stores/verified/VerifiedTrustScore";
import { VerifiedInfoGrid } from "@/components/stores/verified/VerifiedInfoGrid";
import { VerifiedAchievements } from "@/components/stores/verified/VerifiedAchievements";
import { VerifiedHighlights } from "@/components/stores/verified/VerifiedHighlights";
import { VerifiedAboutStore } from "@/components/stores/verified/VerifiedAboutStore";
import { VerifiedTrustBanner } from "@/components/stores/verified/VerifiedTrustBanner";
import { VerifiedStatsGrid } from "@/components/stores/verified/VerifiedStatsGrid";
import { VerifiedBusinessInfo } from "@/components/stores/verified/VerifiedBusinessInfo";
import { VerifiedCollections } from "@/components/stores/verified/VerifiedCollections";
import { VerifiedDealsCarousel } from "@/components/stores/verified/VerifiedDealsCarousel";
import { VerifiedCouponWallet } from "@/components/stores/verified/VerifiedCouponWallet";
import { VerifiedProductStrip } from "@/components/stores/verified/VerifiedProductStrip";
import { VerifiedOfferBanner } from "@/components/stores/verified/VerifiedOfferBanner";
import { VerifiedSearchSuggestions } from "@/components/stores/verified/VerifiedSearchSuggestions";
import { VerifiedSpotlight } from "@/components/stores/verified/VerifiedSpotlight";
import { VerifiedStickyBar } from "@/components/stores/verified/VerifiedStickyBar";
import { RoyalStoreHero } from "@/components/store/royal/RoyalStoreHero";
import { RoyalStickyBar } from "@/components/store/royal/RoyalStickyBar";
import { RoyalConciergeCard } from "@/components/store/royal/RoyalConciergeCard";
import { RoyalAuthenticityBanner } from "@/components/store/royal/RoyalAuthenticityBanner";
import { RoyalCollections } from "@/components/store/royal/RoyalCollections";
import { RoyalLimitedEdition } from "@/components/store/royal/RoyalLimitedEdition";
import { RoyalPrivileges } from "@/components/store/royal/RoyalPrivileges";
import { RoyalMembershipBanner } from "@/components/store/royal/RoyalMembershipBanner";
import { RoyalTestimonials } from "@/components/store/royal/RoyalTestimonials";
import { RoyalGiftExperience } from "@/components/store/royal/RoyalGiftExperience";
import { RoyalDivider } from "@/components/store/royal/RoyalDivider";
import { RoyalSectionHeader } from "@/components/store/royal/RoyalSectionHeader";
import { RoyalLaunches } from "@/components/store/royal/RoyalLaunches";
import { RoyalEarlyAccess } from "@/components/store/royal/RoyalEarlyAccess";
import { RoyalShoppingConcierge } from "@/components/store/royal/RoyalShoppingConcierge";
import { RoyalRecommendations } from "@/components/store/royal/RoyalRecommendations";
import { RoyalGiftBoxShowcase } from "@/components/store/royal/RoyalGiftBoxShowcase";
import { RoyalVIPBenefits } from "@/components/store/royal/RoyalVIPBenefits";
import { RoyalPackagingShowcase } from "@/components/store/royal/RoyalPackagingShowcase";
import { RoyalShoppingTimeline } from "@/components/store/royal/RoyalShoppingTimeline";
import { RoyalMotion } from "@/components/store/royal/RoyalMotion";
import { useStoreSearch } from "@/components/store/shared/useStoreSearch";
import { getProductDomId, scrollToProduct } from "@/components/store/shared/scrollToProduct";

const CATEGORY_ORDER = [
  "featured",
  "vegetables",
  "fruits",
  "dairy",
  "bakery",
  "snacks",
  "beverages",
  "instant-foods",
  "household",
  "beauty-personal-care",
  "uncategorized",
];

const normalizeCategorySlug = (value?: string) =>
  (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "uncategorized";

type SortMode = "recommended" | "price-low" | "price-high" | "newest" | "biggest-discount" | "az";

const DEFAULT_SORT: SortMode = "recommended";

const sortProducts = (items: ProductItem[], mode: SortMode) => {
  const nextItems = [...items];

  switch (mode) {
    case "price-low":
      return nextItems.sort((first, second) => Number(first.price ?? 0) - Number(second.price ?? 0));
    case "price-high":
      return nextItems.sort((first, second) => Number(second.price ?? 0) - Number(first.price ?? 0));
    case "newest":
      return nextItems.sort((first, second) => Number(new Date(second.updatedAt ?? second.createdAt ?? 0).getTime()) - Number(new Date(first.updatedAt ?? first.createdAt ?? 0).getTime()));
    case "biggest-discount":
      return nextItems.sort((first, second) => (Number(second.discount ?? 0) || Number(second.discountPrice && second.price ? ((second.price - second.discountPrice) / second.price) * 100 : 0)) - (Number(first.discount ?? 0) || Number(first.discountPrice && first.price ? ((first.price - first.discountPrice) / first.price) * 100 : 0)));
    case "az":
      return nextItems.sort((first, second) => (first.name ?? "").localeCompare(second.name ?? ""));
    case "recommended":
    default:
      return nextItems.sort((first, second) => {
        const firstScore = Number(second.rating ?? 0) + Number(second.discount ?? 0) + Number(second.discountPrice && second.price ? ((second.price - second.discountPrice) / second.price) * 100 : 0) * 0.5;
        const secondScore = Number(first.rating ?? 0) + Number(first.discount ?? 0) + Number(first.discountPrice && first.price ? ((first.price - first.discountPrice) / first.price) * 100 : 0) * 0.5;
        return secondScore - firstScore;
      });
  }
};

function ProductSkeleton() {
  return <div className="h-[330px] animate-pulse rounded-2xl border border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-950" />;
}

function StoreEmptyState({ title, description, actionLabel, onAction }: { title: string; description: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 p-8 text-center shadow-sm dark:border-stone-700 dark:bg-stone-950/70">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
        <PackageSearch className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-stone-50">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-stone-600 dark:text-stone-300">{description}</p>
      <Button type="button" onClick={onAction} className="mt-5 rounded-full bg-emerald-500 text-white transition-colors duration-200 hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-400">
        {actionLabel}
      </Button>
    </div>
  );
}

type StoreVariant = "normal" | "verified" | "royal";

function resolveStoreVariant(badge: StoreBadge): StoreVariant {
  switch (badge) {
    case "royal":
      return "royal";
    case "verified":
      return "verified";
    default:
      return "normal";
  }
}

function StoreVariantResolver({ variant, children }: { variant: StoreVariant; children: React.ReactNode }) {
  switch (variant) {
    case "royal":
      return <>{children}</>;
    case "verified":
      return <>{children}</>;
    default:
      return <>{children}</>;
  }
}

export default function StoreDetailPage() {
  const params = useParams<{ storeId: string }>();
  const storeId = params?.storeId;
  const storeQuery = useStore(storeId);
  const productsQuery = useProductsByStore(storeId);
  const categoriesQuery = useCategories();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>(DEFAULT_SORT);
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const stickySearchRef = useRef<HTMLInputElement | null>(null);
  const [stickySearchVisible, setStickySearchVisible] = useState(false);

  useEffect(() => {
    const updateStickyVisibility = () => setStickySearchVisible(window.scrollY > 460);
    updateStickyVisibility();
    window.addEventListener("scroll", updateStickyVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateStickyVisibility);
  }, []);

  const store = storeQuery.data;
  const storeVariant = resolveStoreVariant(store?.badge ?? "normal");
  const products = useMemo(() => (Array.isArray(productsQuery.data) ? productsQuery.data : []), [productsQuery.data]);
  const { searchQuery, setSearchQuery, filteredProducts: searchedProducts, searchResults, clearSearch } = useStoreSearch(products);
  const categories = useMemo(() => (Array.isArray(categoriesQuery.data) ? categoriesQuery.data : []), [categoriesQuery.data]);
  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.categoryId ?? normalizeCategorySlug(category.name), category])),
    [categories]
  );

  const filteredProducts = useMemo(() => {
    return searchedProducts.filter((product) => {
      const matchesCategory = !activeCategory || product.categoryId === activeCategory || normalizeCategorySlug(product.category ?? categoryMap.get(product.categoryId ?? "")?.name ?? "") === activeCategory;
      return matchesCategory;
    });
  }, [activeCategory, categoryMap, searchedProducts]);

  const sortedFilteredProducts = useMemo(() => sortProducts(filteredProducts, sortMode), [filteredProducts, sortMode]);

  const categoryOptions = useMemo(
    () =>
      categories.filter((category) =>
        products.some((product) => product.categoryId === category.categoryId || normalizeCategorySlug(product.category ?? categoryMap.get(product.categoryId ?? "")?.name ?? "") === normalizeCategorySlug(category.name))
      ),
    [categories, categoryMap, products]
  );

  const groupedProducts = useMemo(() => {
    const productGroups = new Map<string, { id: string; name: string; products: typeof products }>();

    products.forEach((product) => {
      const resolvedCategoryName = categoryMap.get(product.categoryId ?? "")?.name ?? product.category ?? "Uncategorized";
      const normalizedKey = normalizeCategorySlug(product.categoryId ?? resolvedCategoryName);
      const resolvedKey = resolvedCategoryName.toLowerCase() === "featured" ? "featured" : normalizedKey;
      const existingGroup = productGroups.get(resolvedKey) ?? {
        id: resolvedKey,
        name: resolvedCategoryName || "Uncategorized",
        products: [],
      };

      existingGroup.products.push(product);
      productGroups.set(resolvedKey, existingGroup);
    });

    const featuredProducts = products.filter((product) => product.discount || (typeof product.rating === "number" && product.rating >= 4.5));
    if (featuredProducts.length) {
      const featuredKey = "featured";
      const featuredGroup = productGroups.get(featuredKey) ?? { id: featuredKey, name: "Featured", products: [] };
      const seen = new Set(featuredGroup.products.map((product) => product.productId ?? product.name));
      featuredProducts.forEach((product) => {
        const key = product.productId ?? product.name;
        if (!seen.has(key)) {
          featuredGroup.products.push(product);
          seen.add(key);
        }
      });
      productGroups.set(featuredKey, featuredGroup);
    }

    const orderedGroups = [...CATEGORY_ORDER]
      .map((categoryKey) => {
        const match = [...productGroups.values()].find((group) => normalizeCategorySlug(group.name) === categoryKey || group.id === categoryKey);
        return match ? { ...match, products: sortProducts(match.products, sortMode) } : null;
      })
      .filter((group): group is { id: string; name: string; products: typeof products } => Boolean(group));

    const remainingGroups = [...productGroups.values()]
      .filter((group) => !orderedGroups.some((orderedGroup) => orderedGroup.id === group.id))
      .map((group) => ({ ...group, products: sortProducts(group.products, sortMode) }));

    return [...orderedGroups, ...remainingGroups];
  }, [categoryMap, products, sortMode]);

  const activeCategoryLabel = activeCategory ? categories.find((category) => (category.categoryId ?? normalizeCategorySlug(category.name)) === activeCategory)?.name ?? activeCategory : "";

  const activeFilters = [
    searchQuery.trim() ? { key: "search", label: searchQuery.trim() } : null,
    activeCategoryLabel ? { key: "category", label: activeCategoryLabel } : null,
  ].filter(Boolean) as Array<{ key: string; label: string }>;

  const hasSortChanged = sortMode !== DEFAULT_SORT;
  const hasFilterChanged = Boolean(searchQuery.trim()) || Boolean(activeCategory) || hasSortChanged;

  const displayedProducts = useMemo(() => {
    if (searchQuery.trim()) {
      return sortedFilteredProducts;
    }

    if (activeCategory) {
      return groupedProducts.filter((group) => group.id === activeCategory).flatMap((group) => group.products);
    }

    return groupedProducts.flatMap((group) => group.products);
  }, [activeCategory, groupedProducts, searchQuery, sortedFilteredProducts]);

  const baseProductCount = searchQuery.trim() ? filteredProducts.length : activeCategory ? groupedProducts.filter((group) => group.id === activeCategory).flatMap((group) => group.products).length : products.length;

  const selectSearchResult = (product: ProductItem) => {
    const productId = product.productId ?? product._id ?? product.name;
    window.setTimeout(() => {
      scrollToProduct(productId, store?.badge ?? "normal");
    }, 50);
  };

  const scrollToStickySearch = () => {
    setStickySearchVisible(true);
    document.getElementById("store-sticky-search")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.scrollTo({ top: Math.max(window.scrollY, 461), behavior: "smooth" });
    window.setTimeout(() => {
      const input = stickySearchRef.current;
      input?.focus();
      if (input) input.setSelectionRange(input.value.length, input.value.length);
    }, 350);
  };

  const featuredSections = useMemo(() => {
    const hasRatings = products.some((product) => typeof product.rating === "number");
    const bestSellers = [...products]
      .sort((first, second) => (hasRatings ? Number(second.rating ?? 0) - Number(first.rating ?? 0) : 0))
      .slice(0, 8);
    const deals = products
      .filter((product) => typeof product.discountPrice === "number")
      .sort((first, second) => {
        const firstDiscount = first.price ? ((first.price - (first.discountPrice ?? first.price)) / first.price) * 100 : 0;
        const secondDiscount = second.price ? ((second.price - (second.discountPrice ?? second.price)) / second.price) * 100 : 0;
        return secondDiscount - firstDiscount;
      })
      .slice(0, 8);
    const newlyAdded = [...products]
      .sort((first, second) => new Date(second.createdAt ?? 0).getTime() - new Date(first.createdAt ?? 0).getTime())
      .slice(0, 8);

    return [
      { title: "Best Sellers", subtitle: "Most loved products from this store.", products: bestSellers },
      { title: "Today's Deals", subtitle: "Save more on these products.", products: deals },
      { title: "Newly Added", subtitle: "Freshly added to this store.", products: newlyAdded },
    ];
  }, [products]);

  const focusCategory = (categoryId: string | null) => {
    if (!categoryId) {
      setActiveCategory(null);
      return;
    }

    setActiveCategory(categoryId);
    setHighlightedCategory(categoryId);

    window.setTimeout(() => {
      const node = categoryRefs.current[categoryId];
      node?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => setHighlightedCategory(null), 1200);
    }, 50);
  };

  return (
    <PageWrapper>
      <Section className="space-y-6 py-8 sm:py-10 lg:py-12">
        <Container className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionHeading eyebrow="Store details" title={store?.storeName ?? store?.name ?? "Store"} description={store?.description ?? "Browse products from this seller."} />
            </div>
            <Button asChild variant="outline" className="h-fit">
              <Link href="/explore">Back to search</Link>
            </Button>
          </div>

          {storeQuery.isLoading || productsQuery.isLoading ? (
            <div className="space-y-6" aria-label="Loading store">
              <div className="h-60 animate-pulse rounded-[2rem] border border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-900 sm:h-72 lg:h-80" />
              <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <div className="h-11 w-full animate-pulse rounded-full bg-stone-100 dark:bg-stone-950" />
                <div className="mt-4 flex gap-2 overflow-hidden">
                  {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-8 w-24 shrink-0 animate-pulse rounded-full bg-stone-100 dark:bg-stone-950" />)}
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => <ProductSkeleton key={index} />)}
                </div>
              </div>
            </div>
          ) : storeQuery.isError || productsQuery.isError ? (
            <ErrorState message={(storeQuery.error ?? productsQuery.error) instanceof Error ? (storeQuery.error ?? productsQuery.error)?.message ?? "Unable to load store details." : "Unable to load store details."} />
          ) : store ? (
            <StoreVariantResolver variant={storeVariant}>
            {storeVariant === "verified" ? <div id="store-sticky-search"><VerifiedStickyBar store={store} visible={stickySearchVisible} search={{ value: searchQuery, onChange: setSearchQuery, onClear: clearSearch, results: searchResults, onSelect: selectSearchResult }} stickySearchRef={stickySearchRef} /></div> : storeVariant === "royal" ? <div id="store-sticky-search" className="border-b border-[#D4AF37]/40"><RoyalStickyBar store={store} visible={stickySearchVisible} search={{ value: searchQuery, onChange: setSearchQuery, onClear: clearSearch, results: searchResults, onSelect: selectSearchResult }} stickySearchRef={stickySearchRef} /></div> : null}
            <div className="space-y-6">
              {storeVariant === "verified" ? <VerifiedStoreHero store={store} search={{ value: searchQuery, onChange: setSearchQuery, onClear: clearSearch, results: searchResults, onSelect: selectSearchResult }} stickySearchRef={stickySearchRef} scrollToStickySearch={scrollToStickySearch} /> : storeVariant === "royal" ? <RoyalStoreHero store={store} search={{ value: searchQuery, onChange: setSearchQuery, onClear: clearSearch, results: searchResults, onSelect: selectSearchResult }} stickySearchRef={stickySearchRef} scrollToStickySearch={scrollToStickySearch} /> : <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <div className="relative h-60 overflow-hidden bg-stone-100 sm:h-72 lg:h-80 dark:bg-stone-800">
                  {store.banner ? (
                    <Image src={store.banner} alt={`${store.storeName ?? "Store"} banner`} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-stone-200 via-stone-100 to-emerald-100 dark:from-stone-800 dark:via-stone-900 dark:to-emerald-950/40" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-900/45 to-stone-950/60" />

                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                      <div className="flex items-end gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-emerald-100 text-2xl font-semibold text-emerald-700 shadow-lg shadow-stone-950/20 dark:border-stone-900 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {store.logo ? (
                            <Image src={store.logo} alt="Store logo" width={80} height={80} className="h-full w-full object-cover" />
                          ) : (
                            (store.storeName ?? "S").charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-300">Store profile</p>
                          <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{store.storeName ?? store.name}</h1>
                          {store.badge !== "normal" ? (
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-white">
                              {store.badge === "verified" ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/60 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-100">
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  Verified Store
                                </span>
                              ) : null}
                              {store.badge === "royal" ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/60 bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold text-amber-100">
                                  <Crown className="h-3.5 w-3.5" />
                                  SheoMart Royal
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <span className="inline-flex items-center rounded-full border border-emerald-400/50 bg-emerald-500/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100">
                        {store.status ?? "Approved"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                  <p className="max-w-3xl text-sm leading-7 text-stone-600 dark:text-stone-300">
                    {store.description ?? "Fresh products from this local seller, curated for your everyday needs."}
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                    {[
                      {
                        icon: Star,
                        label: "Rating",
                        value: typeof store.rating === "number" ? `${store.rating.toFixed(1)} / 5` : "New",
                      },
                      {
                        icon: MessageSquareText,
                        label: "Reviews",
                        value: `${store.totalReviews ?? 0}`,
                      },
                      {
                        icon: MapPin,
                        label: "Address",
                        value: [store.address, store.city, store.state, store.pincode].filter(Boolean).join(", ") || "Address unavailable",
                      },
                      {
                        icon: Clock3,
                        label: "Pickup Hours",
                        value: `${store.pickupOpeningTime ?? "10:00"} - ${store.pickupClosingTime ?? "20:00"}`,
                      },
                      {
                        icon: Phone,
                        label: "Phone",
                        value: store.phone ?? "N/A",
                      },
                      {
                        icon: ShieldCheck,
                        label: "Verified",
                        value: store.isVerified ? "Verified" : "Pending",
                      },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3 dark:border-stone-800 dark:bg-stone-950/50">
                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">{label}</p>
                          <p className="mt-1 break-words text-sm font-medium text-stone-700 dark:text-stone-200">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      { label: "Products", value: String(products.length), icon: Boxes },
                      { label: "Categories", value: String(new Set(products.map((product) => product.categoryId).filter(Boolean)).size || 0), icon: MapPin },
                      { label: "Rating", value: typeof store.rating === "number" ? store.rating.toFixed(1) : "New", icon: Star },
                      { label: "Pickup Hours", value: `${store.pickupOpeningTime ?? "10:00"} - ${store.pickupClosingTime ?? "20:00"}`, icon: Clock3 },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="rounded-2xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-950/50">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">{label}</p>
                          <Icon className="h-4 w-4 text-emerald-600" />
                        </div>
                        <p className="mt-3 text-xl font-semibold text-stone-900 dark:text-stone-50">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild className="flex-1 justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-400">
                      <Link href="/categories">Browse Categories</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 justify-center rounded-full border-stone-300 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800">
                      <Link href="/explore">Back to Search</Link>
                    </Button>
                  </div>
                </div>
              </div>}

              {storeVariant !== "normal" ? (
                <div className="space-y-5">
                  {storeVariant === "royal" ? <RoyalMotion><div className="space-y-5"><div className="grid gap-5 lg:grid-cols-2"><RoyalConciergeCard /><RoyalAuthenticityBanner /></div><RoyalDivider /><RoyalCollections products={products} /><RoyalLimitedEdition products={products} /><RoyalDivider /><RoyalPrivileges /><RoyalMembershipBanner /><RoyalTestimonials /><RoyalGiftExperience /><RoyalDivider /><RoyalSectionHeader title="VIP Shopping Experience" subtitle="A flagship journey from discovery to delivery." /><RoyalLaunches products={products} /><RoyalEarlyAccess /><RoyalShoppingConcierge /><RoyalRecommendations products={products} /><RoyalGiftBoxShowcase /><RoyalVIPBenefits /><RoyalPackagingShowcase /><RoyalShoppingTimeline /><RoyalDivider /></div></RoyalMotion> : null}
                  <VerifiedTrustScore />
                  <VerifiedInfoGrid store={store} productCount={products.length} />
                  <VerifiedAchievements />
                  <VerifiedHighlights />
                  <VerifiedAboutStore store={store} />
                  <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                    <VerifiedStatsGrid />
                    <VerifiedBusinessInfo store={store} />
                  </div>
                  <VerifiedTrustBanner />
                  <VerifiedCollections products={products} />
                  <VerifiedDealsCarousel products={products} />
                  <VerifiedCouponWallet />
                  <VerifiedProductStrip title="Best Seller Products" subtitle="Popular picks from this verified seller." products={products} mode="best" />
                  <VerifiedProductStrip title="New Arrivals" subtitle="The latest additions to this store." products={products} mode="new" />
                  <VerifiedProductStrip title="Trending This Week" subtitle="A quick look at what shoppers are exploring." products={products} mode="trending" />
                  <VerifiedOfferBanner />
                  <VerifiedSearchSuggestions onSelect={setSearchQuery} />
                  <VerifiedSpotlight product={products[0]} />
                </div>
              ) : null}

              <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <div className="flex flex-col gap-4 pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Products</p>
                      <h2 className="mt-2 text-xl font-semibold text-stone-900 dark:text-stone-50">Available from this store</h2>
                    </div>
                    <p className="text-sm text-stone-500 dark:text-stone-400">{filteredProducts.length} items</p>
                  </div>

                  <div className="sticky top-0 z-10 -mx-2 rounded-2xl border border-stone-200 bg-white/90 px-2 py-3 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/90">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto">
                        <div className="flex min-w-[160px] items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200">
                          <SortAsc className="h-4 w-4 text-emerald-600" />
                          <span className="whitespace-nowrap">Showing {displayedProducts.length} of {baseProductCount} products</span>
                        </div>

                        {activeFilters.length ? (
                          <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
                            {activeFilters.map((filter) => (
                              <button
                                key={filter.key}
                                type="button"
                                onClick={() => {
                                  if (filter.key === "search") {
                                    clearSearch();
                                  }
                                  if (filter.key === "category") {
                                    setActiveCategory(null);
                                  }
                                }}
                                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                              >
                                {filter.label}
                                <span aria-hidden="true">×</span>
                              </button>
                            ))}
                          </div>
                        ) : null}

                        {hasFilterChanged ? (
                          <button
                            type="button"
                              onClick={() => {
                              clearSearch();
                              setActiveCategory(null);
                              setSortMode(DEFAULT_SORT);
                            }}
                            className="whitespace-nowrap text-xs font-semibold text-stone-500 transition hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                          >
                            Reset filters
                          </button>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 xl:justify-end">
                        <select
                          value={sortMode}
                          onChange={(event) => setSortMode(event.target.value as SortMode)}
                          className="h-11 min-w-[170px] rounded-full border border-stone-200 bg-stone-50 px-3 text-sm text-stone-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
                        >
                          <option value="recommended">Recommended</option>
                          <option value="price-low">Price: Low to High</option>
                          <option value="price-high">Price: High to Low</option>
                          <option value="newest">Newest</option>
                          <option value="biggest-discount">Biggest Discount</option>
                          <option value="az">A–Z</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="sticky top-0 z-10 -mx-2 rounded-2xl border border-stone-200 bg-white/90 px-2 py-3 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/90">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <label className="relative block w-full xl:max-w-md">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                        <input
                          value={searchQuery}
                          onChange={(event) => setSearchQuery(event.target.value)}
                          placeholder="Search products in this store"
                          className="h-11 w-full rounded-full border border-stone-200 bg-stone-50 pl-10 pr-4 text-sm text-stone-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
                        />
                      </label>

                      <div className="flex max-w-full flex-nowrap items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <button
                          type="button"
                          onClick={() => {
                            if (activeCategory) {
                              setActiveCategory(null);
                            }
                          }}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            !activeCategory ? "bg-emerald-500 text-white" : "border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300"
                          }`}
                        >
                          All
                        </button>
                        {categoryOptions.map((category) => {
                          const categoryKey = category.categoryId ?? normalizeCategorySlug(category.name);
                          const isSelected = activeCategory === categoryKey;

                          return (
                            <button
                              key={categoryKey}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setActiveCategory(null);
                                  return;
                                }
                                focusCategory(categoryKey);
                              }}
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                isSelected ? "bg-emerald-500 text-white" : "border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300"
                              }`}
                            >
                              {category.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {products.length === 0 ? (
                  <div className="mt-6">
                    <StoreEmptyState title="This store has no products yet" description="Check back soon for fresh grocery picks from this seller." actionLabel="Browse other stores" onAction={() => window.location.assign("/explore")} />
                  </div>
                ) : null}

                {products.length > 0 && !searchQuery.trim() && !activeCategory ? (
                  <div className="mt-2 space-y-8">
                    {featuredSections.map((section) => {
                      if (section.title === "Today's Deals" && !section.products.length) {
                        return null;
                      }

                      return (
                        <section key={section.title} aria-labelledby={`${section.title.toLowerCase().replace(/[^a-z]+/g, "-")}-heading`}>
                          <div className="mb-4 flex items-end justify-between gap-4">
                            <div>
                              <h3 id={`${section.title.toLowerCase().replace(/[^a-z]+/g, "-")}-heading`} className="text-lg font-semibold text-stone-900 dark:text-stone-50">
                                {section.title}
                              </h3>
                              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{section.subtitle}</p>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">{section.products.length} items</span>
                          </div>

                          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {section.products.map((product) => (
                              <div id={getProductDomId(product.productId ?? product._id ?? product.name)} key={product.productId ?? product.name} className="min-w-[240px] max-w-[240px] shrink-0 snap-start sm:min-w-[260px] sm:max-w-[260px]">
                                <ProductCard product={product} />
                              </div>
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                ) : null}

                {searchQuery.trim() ? (
                  <div className="mt-6">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Search Results</h3>
                      <p className="text-sm text-stone-500 dark:text-stone-400">{filteredProducts.length} found</p>
                    </div>
                    {filteredProducts.length ? (
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                        {filteredProducts.map((product, index) => (
                          <div id={getProductDomId(product.productId ?? product._id ?? product.name)} key={product.productId ?? product.name} className="animate-[store-fade-in_500ms_ease-out_both]" style={{ animationDelay: `${Math.min(index * 45, 300)}ms` }}>
                            <ProductCard product={product} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <StoreEmptyState title="No products match your search" description="Try another keyword or clear the search to browse the full store." actionLabel="Clear search" onAction={clearSearch} />
                    )}
                  </div>
                ) : products.length > 0 ? (
                  <div className="mt-6 space-y-8">
                    {(activeCategory ? groupedProducts.filter((group) => group.id === activeCategory) : groupedProducts).map((group, index) => {
                      const sectionId = group.id;
                      const isExpanded = Boolean(expandedCategories[sectionId]);
                      const visibleProducts = isExpanded ? group.products : group.products.slice(0, 8);
                      const isHighlighted = highlightedCategory === sectionId;

                      return (
                        <section
                          key={sectionId}
                          ref={(node) => {
                            categoryRefs.current[sectionId] = node;
                          }}
                          style={{ animationDelay: `${Math.min(index * 70, 350)}ms` }}
                          className={`scroll-mt-32 animate-[store-fade-in_500ms_ease-out_both] rounded-2xl border border-stone-200 bg-stone-50/60 p-4 transition-all dark:border-stone-800 dark:bg-stone-950/50 ${
                            isHighlighted ? "ring-2 ring-emerald-300 shadow-lg shadow-emerald-500/10" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">{group.name}</h3>
                              <span className="text-sm text-stone-500 dark:text-stone-400">{group.products.length} products</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => focusCategory(sectionId)}
                              className="text-sm font-medium text-emerald-600 transition hover:text-emerald-500"
                            >
                              View All →
                            </button>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                            {visibleProducts.map((product, productIndex) => (
                              <div id={getProductDomId(product.productId ?? product._id ?? product.name)} key={product.productId ?? product.name} className="animate-[store-fade-in_500ms_ease-out_both]" style={{ animationDelay: `${Math.min(productIndex * 45, 300)}ms` }}>
                                <ProductCard product={product} />
                              </div>
                            ))}
                          </div>

                          {group.products.length > 8 ? (
                            <div className="mt-4 flex justify-center">
                              <button
                                type="button"
                                onClick={() => setExpandedCategories((current) => ({ ...current, [sectionId]: !current[sectionId] }))}
                                className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-500"
                              >
                                {isExpanded ? "Show Less" : "Show More"}
                              </button>
                            </div>
                          ) : null}
                        </section>
                      );
                    })}
                    {activeCategory && !groupedProducts.some((group) => group.id === activeCategory) ? (
                      <StoreEmptyState title="This category is empty" description="There are no products in this category right now. Browse every product from the store instead." actionLabel="Show all products" onAction={() => setActiveCategory(null)} />
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
            </StoreVariantResolver>
          ) : (
            <EmptyState title="Store not found" description="We could not locate this store. Verify the URL or search for another seller." />
          )}
        </Container>
      </Section>
      <style jsx global>{`@keyframes store-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } @keyframes royal-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } @keyframes royal-shimmer { from { background-position: 200% 0; } to { background-position: -20% 0; } } @media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; } }`}</style>
    </PageWrapper>
  );
}
