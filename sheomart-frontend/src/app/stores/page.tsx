"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { StoreCard } from "@/components/store/StoreCard";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { StoreSkeleton } from "@/components/marketplace/skeletons/StoreSkeleton";
import { useStores } from "@/hooks/use-stores";
import { useCustomerLocation } from "@/hooks/use-customer-location";
import { LocationPickerModal } from "@/components/layout/LocationPickerModal";
import { ArrowLeft, ArrowRight, MapPin, Search } from "lucide-react";

const STORES_PER_PAGE = 12;

export default function StoresPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const { activePincode, locationLabel } = useCustomerLocation();
  const storesQuery = useStores(activePincode ? { pincode: activePincode } : undefined);
  const stores = Array.isArray(storesQuery.data) ? storesQuery.data : [];
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredStores = stores.filter((store) => {
    if (!normalizedQuery) return true;

    return [store.storeName, store.name, store.address, store.city, store.state]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(normalizedQuery));
  });
  const totalPages = Math.max(1, Math.ceil(filteredStores.length / STORES_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const visibleStores = filteredStores.slice((page - 1) * STORES_PER_PAGE, page * STORES_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <PageWrapper>
      <Section className="space-y-6 py-8 sm:py-10 lg:py-12">
        <Container className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Store directory" title="Explore all stores" description="Find approved SheoMart sellers by name or location." />
            <Button asChild variant="outline" className="h-fit">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back home
              </Link>
            </Button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-xl flex-1">
              <label htmlFor="store-search" className="sr-only">Search stores</label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                id="store-search"
                type="search"
                value={searchQuery}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search by store name or locality"
                className="w-full rounded-full border border-stone-200 bg-white px-11 py-3 text-sm text-stone-700 outline-none transition focus:border-emerald-500 dark:border-stone-700 dark:bg-zinc-900 dark:text-stone-200"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setLocationModalOpen(true)}
              className="rounded-full border-stone-200 bg-white hover:bg-stone-100 dark:border-stone-700 dark:bg-zinc-900 dark:hover:bg-stone-800 h-11 px-4 text-xs font-medium shrink-0 shadow-xs"
              title="Change delivery PIN code"
            >
              <MapPin className="mr-2 h-3.5 w-3.5 text-emerald-500" />
              <span>Delivering to: <strong className="text-emerald-600 dark:text-emerald-400">{locationLabel}</strong></span>
            </Button>
          </div>

          {storesQuery.isLoading ? (
            <StoreSkeleton />
          ) : storesQuery.isError ? (
            <div className="space-y-4">
              <ErrorState message={storesQuery.error instanceof Error ? storesQuery.error.message : "Unable to load stores."} />
              <div className="flex justify-center">
                <Button onClick={() => storesQuery.refetch()}>Retry</Button>
              </div>
            </div>
          ) : visibleStores.length ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {visibleStores.map((store) => (
                  <StoreCard key={store.storeId ?? store.storeName ?? store.name ?? "store"} store={store} />
                ))}
              </div>
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" disabled={page === 1} onClick={() => setCurrentPage(page - 1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-stone-500 dark:text-stone-400">Page {page} of {totalPages}</span>
                <Button variant="outline" disabled={page === totalPages} onClick={() => setCurrentPage(page + 1)}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <EmptyState
                title={activePincode ? `No stores found delivering to PIN ${activePincode}` : "No stores match your search."}
                description={activePincode ? "Try searching for a different keyword or change your PIN code." : "Try another store name or locality."}
              />
              <div className="flex justify-center gap-3">
                <Button variant="default" onClick={() => setLocationModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  Change Delivery PIN
                </Button>
              </div>
            </div>
          )}
        </Container>
      </Section>

      <LocationPickerModal open={locationModalOpen} onClose={() => setLocationModalOpen(false)} />
    </PageWrapper>
  );
}
