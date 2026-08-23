"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { useStore } from "@/hooks/use-store";
import { useProductsByStore } from "@/hooks/use-products-by-store";
import { MapPin, Phone, Star } from "lucide-react";

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
                <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <div className="h-48 bg-stone-100 sm:h-64 dark:bg-stone-800">{store.banner ? <img src={store.banner} alt={`${store.storeName ?? "Store"} banner`} className="h-full w-full object-cover" /> : null}</div>
                  <div className="p-6 pt-0"><div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="flex items-end gap-4"><div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-emerald-100 text-2xl font-semibold text-emerald-700 dark:border-stone-900 dark:bg-emerald-950/60 dark:text-emerald-300">{store.logo ? <img src={store.logo} alt="" className="h-full w-full object-cover" /> : (store.storeName ?? "S").charAt(0)}</div><div><p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Store profile</p><h1 className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-50">{store.storeName ?? store.name}</h1></div></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase text-emerald-700">{store.status ?? "Approved"}</span></div>
                    <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-600 dark:text-stone-300">{store.description ?? "Fresh products from this local seller, curated for your everyday needs."}</p>
                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-stone-600 dark:text-stone-300"><span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-current text-amber-500" />{typeof store.rating === "number" ? store.rating.toFixed(1) : "New"} ({store.totalReviews ?? 0} reviews)</span><span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-emerald-600" />{[store.address, store.city, store.state, store.pincode].filter(Boolean).join(", ") || "Address unavailable"}</span></div>
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
                    <p><span className="font-semibold text-stone-900 dark:text-stone-50">Address:</span> {[store.address, store.city, store.state, store.pincode].filter(Boolean).join(", ") || "N/A"}</p>
                    <p><span className="font-semibold text-stone-900 dark:text-stone-50">Pickup hours:</span> {store.pickupOpeningTime ?? "10:00"} - {store.pickupClosingTime ?? "20:00"}</p>
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-emerald-600" /><span className="font-semibold text-stone-900 dark:text-stone-50">Phone:</span> {store.phone ?? "N/A"}</p>
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
