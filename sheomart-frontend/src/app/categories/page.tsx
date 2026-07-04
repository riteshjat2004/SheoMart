"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { CategoryHeader } from "@/components/marketplace/categories/CategoryHeader";
import { CategoryGrid } from "@/components/marketplace/categories/CategoryGrid";
import { CategorySidebar } from "@/components/marketplace/categories/CategorySidebar";
import { CategoryBanner } from "@/components/marketplace/categories/CategoryBanner";
import { CategoryLoadingSkeleton } from "@/components/marketplace/categories/CategoryLoadingSkeleton";
import { CategoryEmptyState } from "@/components/marketplace/categories/CategoryEmptyState";
import { ErrorState } from "@/components/common/error-state";
import { useCategories } from "@/hooks/use-categories";

export default function CategoriesPage() {
  const categoriesQuery = useCategories();
  const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];

  return (
    <PageWrapper>
      <Section className="space-y-6 py-8 sm:py-10 lg:py-12">
        <Container className="space-y-6">
          <CategoryHeader
            eyebrow="Category browsing"
            title="Shop by category"
            description="Explore the full collection of active SheoMart categories and dive into the products you need most."
            actions={
              <Button asChild variant="outline">
                <Link href="/">Back home</Link>
              </Button>
            }
          />

          <CategoryBanner
            badge="Freshly curated"
            title="Find the right aisle in seconds"
            description="Browse categories that make everyday essentials easier to discover, from pantry staples to wellness favorites."
            actions={
              <Button variant="secondary" className="bg-white text-stone-900 hover:bg-stone-100">
                Explore deals
              </Button>
            }
          />

          {categoriesQuery.isLoading ? (
            <CategoryLoadingSkeleton />
          ) : categoriesQuery.isError ? (
            <div className="space-y-4">
              <ErrorState message={categoriesQuery.error instanceof Error ? categoriesQuery.error.message : "Unable to load categories."} />
              <div className="flex justify-end">
                <Button onClick={() => categoriesQuery.refetch()}>Retry</Button>
              </div>
            </div>
          ) : categories.length ? (
            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
              <CategorySidebar categories={categories} />
              <div className="space-y-4">
                <CategoryGrid categories={categories} />
              </div>
            </div>
          ) : (
            <CategoryEmptyState title="No categories available right now" description="The catalog will appear here as soon as new categories are published." />
          )}
        </Container>
      </Section>
    </PageWrapper>
  );
}
