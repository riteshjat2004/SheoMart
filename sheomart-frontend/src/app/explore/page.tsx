"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SearchBar } from "@/components/marketplace/SearchBar";
import { CategoryCard } from "@/components/marketplace/CategoryCard";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { StoreCard } from "@/components/marketplace/StoreCard";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { useCategories } from "@/hooks/use-categories";
import { useProducts } from "@/hooks/use-products";
import { useStores } from "@/hooks/use-stores";
import { useMemo, useState } from "react";

const fuzzyMatch = (text: string, query: string) => text.toLowerCase().includes(query.toLowerCase());

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const categoriesQuery = useCategories();
  const productsQuery = useProducts();
  const storesQuery = useStores();

  const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];
  const products = Array.isArray(productsQuery.data) ? productsQuery.data : [];
  const stores = Array.isArray(storesQuery.data) ? storesQuery.data : [];

  const filteredCategories = useMemo(
    () => (query ? categories.filter((category) => fuzzyMatch(category.name, query) || fuzzyMatch(category.description ?? "", query)) : categories),
    [categories, query]
  );

  const filteredProducts = useMemo(
    () => (query ? products.filter((product) => fuzzyMatch(product.name, query) || fuzzyMatch(product.description ?? "", query) || fuzzyMatch(product.category ?? "", query)) : products),
    [products, query]
  );

  const filteredStores = useMemo(
    () => (query ? stores.filter((store) => fuzzyMatch(store.storeName ?? store.name ?? "", query) || fuzzyMatch(store.city ?? "", query) || fuzzyMatch(store.address ?? "", query)) : stores),
    [stores, query]
  );

  const searchTerm = query.trim();

  return (
    <PageWrapper>
      <Section className="space-y-6 py-8 sm:py-10 lg:py-12">
        <Container className="space-y-6">
          <div className="space-y-4 rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/80">
            <SectionHeading eyebrow="Search the marketplace" title="Find products, categories, and stores" description="Search the SheoMart marketplace by name, category, store, or ingredient." />
            <SearchBar value={query} onChange={setQuery} onSubmit={() => {}} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="space-y-8">
              <section className="space-y-4 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Search results</p>
                    <h2 className="mt-2 text-xl font-semibold text-stone-900 dark:text-stone-50">Results for “{searchTerm || "all"}”.</h2>
                  </div>
                  <Button asChild variant="outline" className="h-fit">
                    <Link href="/categories">Browse all categories</Link>
                  </Button>
                </div>
                {!searchTerm ? (
                  <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">Enter a query above to filter products, categories, and stores in the marketplace.</p>
                ) : null}
              </section>

              <section className="space-y-4">
                <SectionHeading eyebrow="Categories" title="Matching categories" />
                {categoriesQuery.isLoading ? (
                  <p className="text-sm text-stone-500">Loading categories...</p>
                ) : categoriesQuery.isError ? (
                  <ErrorState message={categoriesQuery.error instanceof Error ? categoriesQuery.error.message : "Unable to load categories."} />
                ) : filteredCategories.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {filteredCategories.map((category) => (
                      <CategoryCard key={category.categoryId ?? category.name} category={category} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No categories found" description="Try a broader term like ‘snacks’, ‘wellness’, or ‘pantry’." />
                )}
              </section>

              <section className="space-y-4">
                <SectionHeading eyebrow="Products" title="Matching products" />
                {productsQuery.isLoading ? (
                  <p className="text-sm text-stone-500">Loading products...</p>
                ) : productsQuery.isError ? (
                  <ErrorState message={productsQuery.error instanceof Error ? productsQuery.error.message : "Unable to load products."} />
                ) : filteredProducts.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.productId ?? product.name} product={product} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No products found" description="Try searching for product names, brands, or category types." />
                )}
              </section>

              <section className="space-y-4">
                <SectionHeading eyebrow="Stores" title="Matching stores" />
                {storesQuery.isLoading ? (
                  <p className="text-sm text-stone-500">Loading stores...</p>
                ) : storesQuery.isError ? (
                  <ErrorState message={storesQuery.error instanceof Error ? storesQuery.error.message : "Unable to load stores."} />
                ) : filteredStores.length ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    {filteredStores.map((store) => (
                      <StoreCard key={store.storeId ?? store.storeName ?? store.name ?? "store"} store={store} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No stores found" description="Broaden your search or try a different city or store name." />
                )}
              </section>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Search tips</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
                  <li>Search product names like “mango”, “organic milk”, or “bath soap”.</li>
                  <li>Use category phrases such as “snacks”, “fresh produce”, or “beverages”.</li>
                  <li>Try store names, cities, or neighborhoods to find local sellers.</li>
                </ul>
              </div>

              <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Quick actions</h3>
                <div className="mt-4 space-y-3">
                  <Button asChild variant="secondary" className="w-full">
                    <Link href="/categories">Explore categories</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/" className="w-full">Back to homepage</Link>
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </PageWrapper>
  );
}
