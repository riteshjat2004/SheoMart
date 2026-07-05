"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { EmptyState } from "@/components/common/empty-state";
import { useProducts } from "@/hooks/use-products";
import { clearRecentlyViewed, getRecentlyViewedIds } from "@/lib/recently-viewed";

export default function RecentlyViewedPage() {
  const productsQuery = useProducts();
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    setRecentIds(getRecentlyViewedIds());
  }, []);

  const products = Array.isArray(productsQuery.data) ? productsQuery.data : [];

  const recentlyViewedProducts = useMemo(() => {
    const map = new Map(products.map((product) => [product.productId, product]));
    return recentIds
      .map((id) => map.get(id))
      .filter((product): product is typeof products[number] => Boolean(product));
  }, [products, recentIds]);

  const handleClear = () => {
    clearRecentlyViewed();
    setRecentIds([]);
  };

  return (
    <PageWrapper>
      <Section className="space-y-6 py-8 sm:py-10 lg:py-12">
        <Container className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionHeading eyebrow="Recently viewed" title="Products you recently looked at" description="Pick up where you left off from your latest browsing sessions." />
            </div>
            <Button type="button" variant="outline" className="h-fit" onClick={handleClear} disabled={!recentlyViewedProducts.length}>
              Clear history
            </Button>
          </div>

          {recentlyViewedProducts.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {recentlyViewedProducts.map((product) => (
                <ProductCard key={product.productId ?? product.name} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <EmptyState title="No recently viewed products" description="Browse product pages to populate your recent activity." />
              <div className="flex justify-end">
                <Button asChild>
                  <Link href="/explore">Explore products</Link>
                </Button>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </PageWrapper>
  );
}
