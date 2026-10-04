"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  RotateCcw,
  Check,
  ChevronDown,
  Sparkles,
  ArrowUpDown,
  Store,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SearchBar } from "@/components/marketplace/SearchBar";
import { CategoryCard } from "@/components/marketplace/CategoryCard";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ProductListItem } from "@/components/marketplace/ProductListItem";
import { StoreCard } from "@/components/store/StoreCard";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { useCategories } from "@/hooks/use-categories";
import { useProducts } from "@/hooks/use-products";
import { useStores } from "@/hooks/use-stores";
import { useCustomerLocation } from "@/hooks/use-customer-location";
import { LocationPickerModal } from "@/components/layout/LocationPickerModal";
import { MapPin } from "lucide-react";
import type { ProductItem } from "@/types/marketplace";

const fuzzyMatch = (text: string, query: string) =>
  text.toLowerCase().includes(query.toLowerCase());

type SortOption =
  | "featured"
  | "price_asc"
  | "price_desc"
  | "discount_desc"
  | "rating_desc"
  | "name_asc";

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") ?? "";
  const initialCategory = searchParams.get("category") ?? "all";

  const [query, setQuery] = useState(initialQuery);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<"all" | "under_100" | "100_500" | "above_500">("all");
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "stores">("products");
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const { activePincode, locationLabel } = useCustomerLocation();
  const categoriesQuery = useCategories();
  const productsQuery = useProducts();
  const storesQuery = useStores(activePincode ? { pincode: activePincode } : undefined);

  const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];
  const products = Array.isArray(productsQuery.data) ? productsQuery.data : [];
  const stores = Array.isArray(storesQuery.data) ? storesQuery.data : [];

  // Extract available brands
  const brands = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.brand?.trim()) set.add(p.brand.trim());
    }
    return Array.from(set).sort();
  }, [products]);

  // Filter Categories
  const filteredCategories = useMemo(
    () =>
      query
        ? categories.filter(
            (c) =>
              fuzzyMatch(c.name, query) || fuzzyMatch(c.description ?? "", query)
          )
        : categories,
    [categories, query]
  );

  // Filter Stores
  const filteredStores = useMemo(
    () =>
      query
        ? stores.filter(
            (s) =>
              fuzzyMatch(s.storeName ?? s.name ?? "", query) ||
              fuzzyMatch(s.city ?? "", query) ||
              fuzzyMatch(s.address ?? "", query)
          )
        : stores,
    [stores, query]
  );

  // Filter Products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.isPublished && p.isActive);

    // Search query
    if (query.trim()) {
      result = result.filter(
        (p) =>
          fuzzyMatch(p.name, query) ||
          fuzzyMatch(p.description ?? "", query) ||
          fuzzyMatch(p.brand ?? "", query) ||
          fuzzyMatch(p.category ?? "", query)
      );
    }

    // Category
    if (selectedCategory !== "all") {
      result = result.filter(
        (p) =>
          p.categoryId === selectedCategory ||
          p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Brand
    if (selectedBrand !== "all") {
      result = result.filter((p) => p.brand === selectedBrand);
    }

    // In Stock Only
    if (inStockOnly) {
      result = result.filter((p) => (p.quantity ?? 0) > 0);
    }

    // Price Range
    if (priceRange === "under_100") {
      result = result.filter((p) => (p.discountPrice ?? p.price) < 100);
    } else if (priceRange === "100_500") {
      result = result.filter((p) => {
        const eff = p.discountPrice ?? p.price;
        return eff >= 100 && eff <= 500;
      });
    } else if (priceRange === "above_500") {
      result = result.filter((p) => (p.discountPrice ?? p.price) > 500);
    }

    // Restrict products to stores delivering to this PIN code
    if (activePincode && storesQuery.isSuccess) {
      const allowedStoreIds = new Set(stores.map((s) => s.storeId).filter(Boolean));
      result = result.filter((p) => p.storeId && allowedStoreIds.has(p.storeId));
    }

    // Minimum Discount
    if (minDiscount > 0) {
      result = result.filter((p) => {
        const disc =
          p.discount ??
          (p.discountPrice && p.price
            ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
            : 0);
        return disc >= minDiscount;
      });
    }

    // Sorting
    const sorted = [...result];
    switch (sortBy) {
      case "price_asc":
        sorted.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
        break;
      case "price_desc":
        sorted.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
        break;
      case "discount_desc":
        sorted.sort((a, b) => {
          const discA = a.discount ?? (a.discountPrice ? a.price - a.discountPrice : 0);
          const discB = b.discount ?? (b.discountPrice ? b.price - b.discountPrice : 0);
          return discB - discA;
        });
        break;
      case "rating_desc":
        sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "name_asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return sorted;
  }, [
    products,
    query,
    selectedCategory,
    selectedBrand,
    inStockOnly,
    priceRange,
    minDiscount,
    sortBy,
    activePincode,
    stores,
    storesQuery.isSuccess,
  ]);

  const resetAllFilters = () => {
    setQuery("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setInStockOnly(false);
    setPriceRange("all");
    setMinDiscount(0);
    setSortBy("featured");
  };

  const hasActiveFilters =
    query !== "" ||
    selectedCategory !== "all" ||
    selectedBrand !== "all" ||
    inStockOnly ||
    priceRange !== "all" ||
    minDiscount > 0;

  return (
    <PageWrapper>
      <Section className="space-y-6 py-6 sm:py-8 lg:py-10">
        <Container className="space-y-6">
          {/* Header & Search */}
          <div className="rounded-[2rem] border border-stone-200/90 bg-white/95 p-6 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/90">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-400">
                  Explore Grocery Marketplace
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-50">
                  Find Groceries, Fresh Produce & Stores
                </h1>
              </div>
              <div className="w-full lg:max-w-md">
                <SearchBar
                  value={query}
                  onChange={setQuery}
                  placeholder="Search products, brands, or essentials..."
                />
              </div>
            </div>

            {/* Quick tabs & Location */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4 dark:border-stone-800">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("products")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    activeTab === "products"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                  }`}
                >
                  Products ({filteredProducts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("categories")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    activeTab === "categories"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                  }`}
                >
                  Categories ({filteredCategories.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("stores")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    activeTab === "stores"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                  }`}
                >
                  Stores ({filteredStores.length})
                </button>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLocationModalOpen(true)}
                className="rounded-full border-stone-200 bg-white hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800 h-8 px-3 text-xs font-medium"
                title="Change delivery PIN code"
              >
                <MapPin className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                <span>Location: <strong className="text-emerald-600 dark:text-emerald-400">{locationLabel}</strong></span>
              </Button>
            </div>
          </div>

          {/* Tab 1: Products */}
          {activeTab === "products" && (
            <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
              {/* Filter Sidebar - Sticky on desktop */}
              <aside className="space-y-5 rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-zinc-900 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                    <span className="font-semibold text-stone-900 dark:text-stone-50">Filters</span>
                  </div>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="flex items-center gap-1 text-xs text-stone-500 hover:text-emerald-600"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </button>
                  )}
                </div>

                {/* Category filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-800 outline-none transition focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.categoryId ?? c.name} value={c.categoryId ?? c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand filter */}
                {brands.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                      Brand
                    </label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-800 outline-none transition focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
                    >
                      <option value="all">All Brands</option>
                      {brands.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Price range */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Price
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {[
                      { id: "all", label: "Any Price" },
                      { id: "under_100", label: "Under ₹100" },
                      { id: "100_500", label: "₹100 - ₹500" },
                      { id: "above_500", label: "Above ₹500" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPriceRange(p.id as typeof priceRange)}
                        className={`rounded-lg px-2.5 py-1.5 text-center font-medium transition ${
                          priceRange === p.id
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-stone-50 text-stone-600 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-300"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Minimum Discount */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Discount
                  </label>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {[0, 10, 20, 30, 50].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setMinDiscount(d)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                          minDiscount === d
                            ? "bg-emerald-600 text-white"
                            : "bg-stone-50 text-stone-600 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-300"
                        }`}
                      >
                        {d === 0 ? "All" : `${d}%+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* In Stock toggle */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                  <label className="flex cursor-pointer items-center justify-between text-xs font-medium text-stone-700 dark:text-stone-300">
                    <span>In-Stock Items Only</span>
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                </div>
              </aside>

              {/* Products Area */}
              <div className="space-y-4">
                {/* Controls Bar: Sort & View Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm dark:border-stone-800 dark:bg-zinc-900">
                  <p className="text-xs font-medium text-stone-600 dark:text-stone-400">
                    Showing <span className="font-semibold text-stone-900 dark:text-stone-100">{filteredProducts.length}</span> products
                  </p>

                  <div className="flex items-center gap-3">
                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <ArrowUpDown className="h-3.5 w-3.5 text-stone-400" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-medium text-stone-800 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
                      >
                        <option value="featured">Featured</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="discount_desc">Biggest Discount</option>
                        <option value="rating_desc">Highest Rated</option>
                        <option value="name_asc">Name: A to Z</option>
                      </select>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center rounded-lg border border-stone-200 p-0.5 dark:border-stone-700">
                      <button
                        type="button"
                        aria-label="Grid view"
                        onClick={() => setViewMode("grid")}
                        className={`rounded p-1.5 transition ${
                          viewMode === "grid"
                            ? "bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100"
                            : "text-stone-400 hover:text-stone-600"
                        }`}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="List view"
                        onClick={() => setViewMode("list")}
                        className={`rounded p-1.5 transition ${
                          viewMode === "list"
                            ? "bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100"
                            : "text-stone-400 hover:text-stone-600"
                        }`}
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product List / Grid */}
                {productsQuery.isLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="h-80 animate-pulse rounded-2xl bg-stone-200/70 dark:bg-stone-800"
                      />
                    ))}
                  </div>
                ) : productsQuery.isError ? (
                  <ErrorState
                    message={
                      productsQuery.error instanceof Error
                        ? productsQuery.error.message
                        : "Unable to load products."
                    }
                  />
                ) : filteredProducts.length ? (
                  viewMode === "grid" ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {filteredProducts.map((p) => (
                        <ProductCard key={p.productId ?? p.name} product={p} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredProducts.map((p) => (
                        <ProductListItem key={p.productId ?? p.name} product={p} />
                      ))}
                    </div>
                  )
                ) : (
                  <EmptyState
                    title="No products matched your criteria"
                    description="Try clearing some filters or changing your search keyword."
                  />
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Categories */}
          {activeTab === "categories" && (
            <div className="space-y-4">
              {categoriesQuery.isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-40 animate-pulse rounded-2xl bg-stone-200/70 dark:bg-stone-800" />
                  ))}
                </div>
              ) : filteredCategories.length ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {filteredCategories.map((c) => (
                    <CategoryCard key={c.categoryId ?? c.name} category={c} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No categories found"
                  description="Try searching with a broader keyword."
                />
              )}
            </div>
          )}

          {/* Tab 3: Stores */}
          {activeTab === "stores" && (
            <div className="space-y-4">
              {storesQuery.isLoading ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-52 animate-pulse rounded-2xl bg-stone-200/70 dark:bg-stone-800" />
                  ))}
                </div>
              ) : filteredStores.length ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {filteredStores.map((s) => (
                    <StoreCard key={s.storeId ?? s.storeName ?? s.name ?? "store"} store={s} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No stores found"
                  description="No approved neighborhood stores match your search."
                />
              )}
            </div>
          )}
        </Container>
      </Section>

      <LocationPickerModal open={locationModalOpen} onClose={() => setLocationModalOpen(false)} />
    </PageWrapper>
  );
}
