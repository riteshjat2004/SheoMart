"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Store,
  Tag,
  MapPin,
  AlertCircle,
  X,
  Compass,
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
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { useCategories } from "@/hooks/use-categories";
import { useProducts } from "@/hooks/use-products";
import { useStores } from "@/hooks/use-stores";
import { useCustomerLocation } from "@/hooks/use-customer-location";
import { LocationPickerModal } from "@/components/layout/LocationPickerModal";
import type { CategoryItem, ProductItem } from "@/types/marketplace";

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
  const paramQuery = searchParams.get("query") ?? "";
  const paramCategory = searchParams.get("category") ?? "all";
  const paramTab = searchParams.get("tab") as "products" | "categories" | "stores" | null;

  const [query, setQuery] = useState(paramQuery);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [selectedCategory, setSelectedCategory] = useState<string>(paramCategory);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<"all" | "under_100" | "100_500" | "above_500">("all");
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "stores">("products");
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [isCatalogViewOnly, setIsCatalogViewOnly] = useState(false);

  // Synchronize state when URL search params change (e.g., clicking "Explore" in Navbar or searching)
  useEffect(() => {
    setQuery(paramQuery);
  }, [paramQuery]);

  useEffect(() => {
    setSelectedCategory(paramCategory);
  }, [paramCategory]);

  useEffect(() => {
    if (paramTab && ["products", "categories", "stores"].includes(paramTab)) {
      setActiveTab(paramTab);
    }
  }, [paramTab]);

  const { activePincode, locationLabel, setPincode, clearLocation } = useCustomerLocation();
  const categoriesQuery = useCategories();
  const productsQuery = useProducts();
  const storesQuery = useStores(activePincode ? { pincode: activePincode } : undefined);

  const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];
  const products = Array.isArray(productsQuery.data) ? productsQuery.data : [];
  const stores = Array.isArray(storesQuery.data) ? storesQuery.data : [];

  // Check if current PIN has any operating stores (Strict Hyper-local check)
  const isLocationUnserviceable = Boolean(
    activePincode && storesQuery.isSuccess && stores.length === 0
  );

  // Reset catalog view-only mode when PIN changes
  useEffect(() => {
    setIsCatalogViewOnly(false);
  }, [activePincode]);

  // Build a lookup map for categories (supporting UUIDs, slugs, and normalized names)
  const categoryMap = useMemo(() => {
    const map = new Map<string, CategoryItem>();
    for (const c of categories) {
      if (c.categoryId) map.set(c.categoryId.toLowerCase(), c);
      if (c.slug) map.set(c.slug.toLowerCase(), c);
      if (c.name) map.set(c.name.toLowerCase(), c);
    }
    return map;
  }, [categories]);

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

  // Filter Stores (Strict to active PIN)
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

  // Filter Products strictly to active location
  const filteredProducts = useMemo(() => {
    // 1. Exclude unpublished or deleted items
    let result = products.filter(
      (p) => p.isPublished !== false && p.isActive !== false && !p.isDeleted
    );

    // 2. Strict Hyper-Local Location Filter:
    // If a PIN is active and not overridden by Catalog View-Only mode:
    if (activePincode && !isCatalogViewOnly) {
      const allowedStoreIds = new Set(stores.map((s) => s.storeId).filter(Boolean));
      const isSheopurPin = activePincode === "476337";

      result = result.filter(
        (p) =>
          (p.storeId && allowedStoreIds.has(p.storeId)) ||
          (isSheopurPin && p.storeId?.includes("sheopur"))
      );
    }

    // 3. Search query filter
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter((p) => {
        const cat = categoryMap.get(p.categoryId?.toLowerCase() ?? "");
        return (
          fuzzyMatch(p.name, q) ||
          fuzzyMatch(p.description ?? "", q) ||
          fuzzyMatch(p.brand ?? "", q) ||
          (p.category && fuzzyMatch(p.category, q)) ||
          (cat?.name && fuzzyMatch(cat.name, q)) ||
          (p.storeName && fuzzyMatch(p.storeName, q))
        );
      });
    }

    // 4. Category matching (handles categoryId UUIDs, slugs like 'vegetables', and names)
    if (selectedCategory && selectedCategory !== "all") {
      const target = selectedCategory.toLowerCase().trim();
      result = result.filter((p) => {
        if (p.categoryId?.toLowerCase() === target) return true;
        const cat = categoryMap.get(p.categoryId?.toLowerCase() ?? "");
        if (cat) {
          if (cat.categoryId?.toLowerCase() === target) return true;
          if (cat.slug?.toLowerCase() === target) return true;
          if (cat.name.toLowerCase() === target) return true;
          if (cat.slug?.toLowerCase().includes(target) || target.includes(cat.slug?.toLowerCase() || "")) return true;
          if (cat.name.toLowerCase().includes(target) || target.includes(cat.name.toLowerCase())) return true;
        }
        if (p.category) {
          const pCat = p.category.toLowerCase();
          if (pCat === target || pCat.includes(target) || target.includes(pCat)) return true;
        }
        return false;
      });
    }

    // 5. Brand filter
    if (selectedBrand !== "all") {
      result = result.filter((p) => p.brand === selectedBrand);
    }

    // 6. In Stock Only
    if (inStockOnly) {
      result = result.filter((p) => (p.quantity ?? 0) > 0);
    }

    // 7. Price Range
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

    // 8. Minimum Discount
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

    // 9. Sorting
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
    isCatalogViewOnly,
    stores,
    categoryMap,
  ]);

  const resetAllFilters = () => {
    setQuery("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setInStockOnly(false);
    setPriceRange("all");
    setMinDiscount(0);
    setSortBy("featured");
    setIsCatalogViewOnly(false);
  };

  const hasActiveFilters =
    query !== "" ||
    selectedCategory !== "all" ||
    selectedBrand !== "all" ||
    inStockOnly ||
    priceRange !== "all" ||
    minDiscount > 0 ||
    isCatalogViewOnly;

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
                  Find Groceries, Fresh Produce &amp; Stores
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

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLocationModalOpen(true)}
                  className="rounded-full border-stone-200 bg-white hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800 h-8 px-3 text-xs font-medium"
                  title="Change delivery PIN code"
                >
                  <MapPin className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                  <span>
                    Delivery to:{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {locationLabel}
                    </strong>
                  </span>
                </Button>
                {activePincode ? (
                  <button
                    type="button"
                    onClick={clearLocation}
                    title="Reset location (browse all)"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Location Delivery Serviceability Banner */}
          {activePincode ? (
            isLocationUnserviceable && !isCatalogViewOnly ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/80 px-4 py-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    No local partner stores currently deliver to <strong>PIN {activePincode}</strong>. SheoMart is currently operational in <strong>Sheopur (PIN 476337)</strong>.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPincode("476337")}
                    className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 shadow-2xs"
                  >
                    Switch to Sheopur (476337)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationModalOpen(true)}
                    className="rounded-full border border-amber-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-800 hover:bg-amber-100/60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
                  >
                    Change PIN
                  </button>
                </div>
              </div>
            ) : isCatalogViewOnly ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-300 bg-stone-100 px-4 py-2.5 text-xs text-stone-700 dark:border-stone-700 dark:bg-stone-850 dark:text-stone-300">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Catalog View Only:</strong> Viewing marketplace products across all stores. (Orders cannot be delivered to PIN {activePincode}).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCatalogViewOnly(false)}
                  className="font-bold underline text-emerald-700 hover:text-emerald-900 dark:text-emerald-400"
                >
                  Exit Catalog View
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200/90 bg-emerald-50/70 px-4 py-2.5 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    Delivering to <strong>PIN {activePincode}</strong> ({stores.length} partner store{stores.length > 1 ? "s" : ""} serving your area).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLocationModalOpen(true)}
                  className="font-bold underline hover:text-emerald-700 dark:hover:text-emerald-100"
                >
                  Change Location
                </button>
              </div>
            )
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-xs text-stone-600 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-300">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>
                  Select your delivery PIN code to view stores and products available in your locality.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                className="font-bold text-emerald-600 hover:underline dark:text-emerald-400"
              >
                Set Delivery PIN
              </button>
            </div>
          )}

          {/* If Location is Unserviceable, show dedicated prompt unless catalog view is chosen */}
          {isLocationUnserviceable && !isCatalogViewOnly ? (
            <div className="rounded-[2.5rem] border border-stone-200/90 bg-white p-8 sm:p-12 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-700 shadow-xs dark:bg-amber-950/70 dark:text-amber-400">
                <MapPin className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-xl font-bold tracking-tight text-stone-900 sm:text-2xl dark:text-stone-50">
                Delivery Not Available at PIN {activePincode}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                We do not have partner grocery stores operating in PIN <strong className="text-stone-900 dark:text-stone-100">{activePincode}</strong> yet. SheoMart local delivery is currently active in <strong className="text-emerald-700 dark:text-emerald-400">Sheopur (PIN 476337)</strong>.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  type="button"
                  onClick={() => setLocationModalOpen(true)}
                  className="rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
                >
                  Change Delivery Location
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPincode("476337")}
                  className="rounded-full border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                >
                  Switch to Sheopur (476337)
                </Button>
              </div>
              <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsCatalogViewOnly(true)}
                  className="text-xs font-medium text-stone-500 hover:text-emerald-600 dark:text-stone-400 dark:hover:text-emerald-400 underline transition"
                >
                  Browse all marketplace products anyway (Catalog View Only)
                </button>
              </div>
            </div>
          ) : (
            <>
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
                          <option key={c.categoryId ?? c.name} value={c.slug ?? c.categoryId ?? c.name}>
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
                        {activePincode && !isCatalogViewOnly ? ` for PIN ${activePincode}` : ""}
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
                      <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 p-8 text-center shadow-sm dark:border-stone-700 dark:bg-stone-950/70">
                        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
                          No products matched your criteria
                        </h3>
                        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                          {activePincode
                            ? `No items found matching your filters for PIN ${activePincode}. Try adjusting your search keyword or filters.`
                            : "Try clearing some filters or changing your search keyword."}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={resetAllFilters}
                            className="rounded-full bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            Reset All Filters
                          </Button>
                          {activePincode ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setLocationModalOpen(true)}
                              className="rounded-full text-xs font-medium"
                            >
                              Change Delivery PIN ({activePincode})
                            </Button>
                          ) : null}
                        </div>
                      </div>
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
                      title="No stores found in this area"
                      description={`No approved stores are currently delivering to PIN ${activePincode || "your location"}.`}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </Container>
      </Section>

      <LocationPickerModal open={locationModalOpen} onClose={() => setLocationModalOpen(false)} />
    </PageWrapper>
  );
}
