"use client";

import { useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminReviewRow } from "@/components/dashboard/admin/AdminReviewRow";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useAdminReviews } from "@/hooks/use-admin-reviews";
import { fetchAdminProducts } from "@/services/admin-products";
import { fetchAdminStores } from "@/services/store";
import { updateAdminReviewVisibility } from "@/services/admin-reviews";
import type { AdminReview, AdminReviewFilters, AdminReviewListResponse } from "@/types/admin-review";
import type { AdminProduct } from "@/types/admin-product";
import type { StoreItem } from "@/types/marketplace";

const defaultFilters: AdminReviewFilters = {
  page: 1,
  limit: 25,
  sortBy: "createdAt",
  sortOrder: "desc",
};

function parseBooleanFilter(value: string) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<AdminReviewFilters>(defaultFilters);
  const [pendingVisibilityReview, setPendingVisibilityReview] = useState<AdminReview | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const reviewsQuery = useAdminReviews(filters);
  const reviews = reviewsQuery.data?.reviews ?? [];
  const pagination = reviewsQuery.data?.pagination;

  const visibilityMutation = useMutation({
    mutationFn: ({ reviewId, isVisible }: { reviewId: string; isVisible: boolean }) => updateAdminReviewVisibility(reviewId, isVisible),
    onSuccess: (_result, variables) => {
      queryClient.setQueryData<AdminReviewListResponse>(["admin-reviews", filters], (current) => current ? {
        ...current,
        reviews: current.reviews.map((review) => review.reviewId === variables.reviewId ? { ...review, isVisible: variables.isVisible } : review),
      } : current);
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      setFeedback({ type: "success", message: `Review ${variables.isVisible ? "shown" : "hidden"} successfully.` });
      setPendingVisibilityReview(null);
    },
    onError: (error: unknown) => {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to update review visibility." });
    },
  });

  const productsQuery = useQuery<AdminProduct[]>({
    queryKey: ["admin-products", "review-filters"],
    queryFn: async () => (await fetchAdminProducts({ page: 1, limit: 100, sortBy: "name", sortOrder: "asc" })).products,
    staleTime: 1000 * 60 * 5,
  });
  const storesQuery = useQuery<StoreItem[]>({
    queryKey: ["stores", "admin"],
    queryFn: fetchAdminStores,
    staleTime: 1000 * 60 * 5,
  });

  const updateFilters = (updates: Partial<AdminReviewFilters>) => {
    setFilters((current) => ({ ...current, ...updates, page: 1 }));
  };

  const clearFilters = () => setFilters(defaultFilters);

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Admin" }, { label: "Reviews" }]} />
      <PageHeader title="Review management" description="Inspect marketplace feedback and moderation state from a read-only administrative view." />

      {feedback ? <div className={`rounded-lg border p-3 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300" : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300"}`}>{feedback.message}</div> : null}

      <DashboardCard title="Marketplace reviews" description="Search and filter review content without changing visibility, deletion, ratings, or ownership data.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(17rem,1.5fr)_repeat(3,minmax(9rem,1fr))_auto]">
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-500 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
            <Search className="h-4 w-4 shrink-0" />
            <input value={filters.search ?? ""} onChange={(event) => updateFilters({ search: event.target.value || undefined })} placeholder="Search review, reviewer, product, or store" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-stone-400" />
          </label>

          <select value={filters.productId ?? ""} onChange={(event) => updateFilters({ productId: event.target.value || undefined })} className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
            <option value="">All products</option>
            {productsQuery.data?.map((product) => <option key={product.productId} value={product.productId}>{product.name}</option>)}
          </select>

          <select value={filters.storeId ?? ""} onChange={(event) => updateFilters({ storeId: event.target.value || undefined })} className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
            <option value="">All stores</option>
            {storesQuery.data?.map((store) => <option key={store.storeId ?? store._id} value={store.storeId ?? store._id ?? ""}>{store.storeName ?? store.name ?? "Store"}</option>)}
          </select>

          <select value={filters.rating ?? ""} onChange={(event) => updateFilters({ rating: event.target.value ? Number(event.target.value) : undefined })} className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
            <option value="">All ratings</option>
            {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
          </select>

          <select value={filters.isVisible === undefined ? "" : String(filters.isVisible)} onChange={(event) => updateFilters({ isVisible: parseBooleanFilter(event.target.value) })} className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
            <option value="">All visibility</option>
            <option value="true">Visible</option>
            <option value="false">Hidden</option>
          </select>

          <select value={filters.isDeleted === undefined ? "" : String(filters.isDeleted)} onChange={(event) => updateFilters({ isDeleted: parseBooleanFilter(event.target.value) })} className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
            <option value="">All deletion states</option>
            <option value="false">Not deleted</option>
            <option value="true">Deleted</option>
          </select>

          <select value={filters.isVerifiedPurchase === undefined ? "" : String(filters.isVerifiedPurchase)} onChange={(event) => updateFilters({ isVerifiedPurchase: parseBooleanFilter(event.target.value) })} className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
            <option value="">All purchase states</option>
            <option value="true">Verified purchase</option>
            <option value="false">Unverified purchase</option>
          </select>

          <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
            <RotateCcw className="h-4 w-4" />
            Clear
          </Button>
        </div>

        <div className="mt-5">
          {reviewsQuery.isLoading ? <EmptyState title="Loading reviews" description="Fetching the latest marketplace feedback." /> : null}
          {reviewsQuery.isError ? <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300">{reviewsQuery.error instanceof Error ? reviewsQuery.error.message : "Unable to load reviews."}</div> : null}
          {!reviewsQuery.isLoading && !reviewsQuery.isError && reviews.length === 0 ? <EmptyState title="No reviews found" description="No reviews match the current search and filters." /> : null}
          {!reviewsQuery.isLoading && !reviewsQuery.isError && reviews.length > 0 ? <div className="space-y-3">{reviews.map((review) => <AdminReviewRow key={review.reviewId} review={review} isUpdatingVisibility={visibilityMutation.isPending && pendingVisibilityReview?.reviewId === review.reviewId} onVisibilityChange={setPendingVisibilityReview} />)}</div> : null}
        </div>

        {pagination && pagination.totalPages > 0 ? (
          <div className="mt-5 flex flex-col gap-3 border-t border-stone-200 pt-4 text-sm text-stone-600 dark:border-stone-800 dark:text-stone-300 sm:flex-row sm:items-center sm:justify-between">
            <span>Page {pagination.page} of {pagination.totalPages} - {pagination.total} reviews</span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" disabled={pagination.page <= 1 || reviewsQuery.isFetching} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}>Previous</Button>
              <Button type="button" variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages || reviewsQuery.isFetching} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}>Next</Button>
            </div>
          </div>
        ) : null}
      </DashboardCard>

      {pendingVisibilityReview ? (
        <ConfirmDialog
          title={`${pendingVisibilityReview.isVisible ? "Hide" : "Show"} this review?`}
          description={`This will change the review's marketplace visibility. The product's rating aggregate may be recalculated.`}
        >
          <Button type="button" variant="outline" onClick={() => setPendingVisibilityReview(null)} disabled={visibilityMutation.isPending}>Cancel</Button>
          <Button type="button" onClick={() => visibilityMutation.mutate({ reviewId: pendingVisibilityReview.reviewId, isVisible: !pendingVisibilityReview.isVisible })} disabled={visibilityMutation.isPending}>
            {visibilityMutation.isPending ? "Saving..." : "Confirm"}
          </Button>
        </ConfirmDialog>
      ) : null}
    </DashboardContent>
  );
}
