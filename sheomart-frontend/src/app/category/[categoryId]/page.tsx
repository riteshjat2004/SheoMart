"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { CategoryHeader } from "@/components/marketplace/categories/CategoryHeader";
import { CategoryBreadcrumb } from "@/components/marketplace/categories/CategoryBreadcrumb";
import { CategorySidebar } from "@/components/marketplace/categories/CategorySidebar";
import { CategoryProductsGrid } from "@/components/marketplace/categories/CategoryProductsGrid";
import { CategoryEmptyState } from "@/components/marketplace/categories/CategoryEmptyState";
import { CategoryLoadingSkeleton } from "@/components/marketplace/categories/CategoryLoadingSkeleton";
import { ErrorState } from "@/components/common/error-state";
import { useCategories } from "@/hooks/use-categories";
import { useCategory } from "@/hooks/use-category";
import { useCategoryProducts } from "@/hooks/use-category-products";

export default function CategoryDetailPage() {
  const params = useParams<{ categoryId: string }>();
  const categoryId = params?.categoryId;
  const categoriesQuery = useCategories();
  const categoryQuery = useCategory(categoryId);
  const productsQuery = useCategoryProducts(categoryId);

  const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];
  const category = categoryQuery.data;
  const products = Array.isArray(productsQuery.data) ? productsQuery.data : [];

  return (
    <PageWrapper>
      <Section className="space-y-6 py-8 sm:py-10 lg:py-12">
        <Container className="space-y-6">
          <CategoryBreadcrumb items={[{ label: "Categories", href: "/categories" }, { label: category?.name ?? "Category" }]} />

          <CategoryHeader
            eyebrow="Single category"
            title={category?.name ?? "Category"}
            description={category?.description ?? "Browse the latest products curated for this category."}
            actions={
              <Button asChild variant="outline">
                <Link href="/categories">Back to categories</Link>
              </Button>
            }
          />

          {categoryQuery.isLoading || productsQuery.isLoading || categoriesQuery.isLoading ? (
            <CategoryLoadingSkeleton />
          ) : categoryQuery.isError || productsQuery.isError || categoriesQuery.isError ? (
            <div className="space-y-4">
              <ErrorState message={(categoryQuery.error ?? productsQuery.error ?? categoriesQuery.error) instanceof Error ? (categoryQuery.error ?? productsQuery.error ?? categoriesQuery.error)?.message ?? "Unable to load this category." : "Unable to load this category."} />
              <div className="flex justify-end">
                <Button asChild variant="outline">
                  <Link href="/categories">Browse all categories</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
              <CategorySidebar categories={categories} currentCategoryId={categoryId} />
              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-stone-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/80">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Selected category</p>
                  <h2 className="mt-2 text-xl font-semibold text-stone-900 dark:text-stone-50">{category?.name}</h2>
                  <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-300">{category?.description ?? "Products from this category are shown below."}</p>
                </div>
                {products.length ? <CategoryProductsGrid products={products} /> : <CategoryEmptyState title="No products in this category yet" description="New arrivals will appear here as sellers publish products." />}
              </div>
            </div>
          )}
        </Container>
      </Section>
    </PageWrapper>
  );
}
