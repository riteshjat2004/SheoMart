"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { StoreCard } from "@/components/marketplace/StoreCard";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { useStore } from "@/hooks/use-store";
import { useProductsByStore } from "@/hooks/use-products-by-store";

export default function StoreDetailPage() {
  const params = useParams<{ storeId: string }>();
  const storeId = params?.storeId;
  const storeQuery = useStore(storeId);
  const productsQuery = useProductsByStore(storeId);

  const store = storeQuery.data;
  const products = Array.isArray(productsQuery.data) ? productsQuery.data : [];

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
            <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <p className="text-sm text-stone-500">Loading store details …</p>
            </div>
          ) : storeQuery.isError || productsQuery.isError ? (
            <ErrorState message={(storeQuery.error ?? productsQuery.error) instanceof Error ? (storeQuery.error ?? productsQuery.error)?.message ?? "Unable to load store details." : "Unable to load store details."} />
          ) : store ? (
            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-6">
                <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Store profile</p>
                      <h1 className="mt-3 text-3xl font-semibold text-stone-900 dark:text-stone-50">{store.storeName ?? store.name}</h1>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 dark:text-stone-300">{store.description ?? "Fresh products from this local seller, curated for your everyday needs."}</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 text-sm font-medium text-stone-700 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-200">
                      <p>{store.city ?? store.address ?? "Local"}</p>
                      <p className="mt-2 text-emerald-600">{store.status ?? "Open"}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Products</p>
                      <h2 className="mt-2 text-xl font-semibold text-stone-900 dark:text-stone-50">Available from this store</h2>
                    </div>
                    <p className="text-sm text-stone-500 dark:text-stone-400">{products.length} items</p>
                  </div>
                  {products.length ? (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {products.map((product) => (
                        <ProductCard key={product.productId ?? product.name} product={product} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="No products published yet" description="This store has no products available right now." />
                  )}
                </div>
              </div>

              <aside className="space-y-6">
                <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Store snapshot</h3>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
                    <p><span className="font-semibold text-stone-900 dark:text-stone-50">City:</span> {store.city ?? "N/A"}</p>
                    <p><span className="font-semibold text-stone-900 dark:text-stone-50">Status:</span> {store.status ?? "Open"}</p>
                    <p><span className="font-semibold text-stone-900 dark:text-stone-50">Delivery:</span> {store.deliveryTime ?? "Standard"}</p>
                    <p><span className="font-semibold text-stone-900 dark:text-stone-50">Verified:</span> {store.isVerified ? "Yes" : "No"}</p>
                  </div>
                </div>
                <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">More actions</h3>
                  <div className="mt-4 space-y-3">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/categories">Browse categories</Link>
                    </Button>
                    <Button asChild variant="secondary" className="w-full">
                      <Link href="/">Return home</Link>
                    </Button>
                  </div>
                </div>
              </aside>
            </div>
          ) : (
            <EmptyState title="Store not found" description="We could not locate this store. Verify the URL or search for another seller." />
          )}
        </Container>
      </Section>
    </PageWrapper>
  );
}
