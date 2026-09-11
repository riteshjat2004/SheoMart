"use client";

import { useMemo, useState } from "react";
import { useCategories } from "@/hooks/use-categories";
import { useOffers } from "@/hooks/use-promotions";
import { PromotionOfferCard } from "@/components/marketplace/PromotionOfferCard";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";

export default function OffersPage() {
  const [search, setSearch] = useState("");
  const offersQuery = useOffers();
  const categoriesQuery = useCategories();
  const categoryLookup = useMemo(() => new Map((categoriesQuery.data ?? []).flatMap((category) => { const categoryId = category.categoryId ?? category._id; return categoryId ? [[categoryId, { categoryId, name: category.name, slug: category.slug ?? categoryId }] as const] : []; })), [categoriesQuery.data]);
  const offers = (offersQuery.data ?? []).filter((offer) => !search.trim() || `${offer.title} ${offer.festivalName}`.toLowerCase().includes(search.trim().toLowerCase()));

  return <PageWrapper><Section className="py-8 sm:py-10"><Container className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Live promotions</p><h1 className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-50">All Offers</h1><p className="mt-2 text-stone-600 dark:text-stone-300">Browse every active offer from SheoMart stores.</p></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search offers" className="min-h-11 w-full max-w-xl rounded-full border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900" />{offersQuery.isLoading ? <LoadingSkeleton rows={4} /> : offersQuery.isError ? <ErrorState message={offersQuery.error.message} /> : offers.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{offers.map((offer) => <PromotionOfferCard key={offer.offerId} offer={offer} categoryLookup={categoryLookup} />)}</div> : <EmptyState title="No active offers" description="Check back soon for fresh savings." />}</Container></Section></PageWrapper>;
}
