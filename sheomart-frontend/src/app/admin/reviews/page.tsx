"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Filter,
  Flag,
  RotateCcw,
  Search,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AdminReviewRow } from "@/components/dashboard/admin/AdminReviewRow";
import { ReviewBulkToolbar } from "@/components/dashboard/admin/ReviewBulkToolbar";
import { ReviewDetailsModal } from "@/components/dashboard/admin/ReviewDetailsModal";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import {
  useAdminReviews,
  useAdminReviewStats,
  useModerateReview,
  useSoftDeleteReview,
  useRestoreReview,
  useFlagReview,
  useBulkReviewAction,
} from "@/hooks/use-admin-reviews";
import { fetchAdminProducts } from "@/services/admin-products";
import { fetchAdminStores } from "@/services/store";
import type { AdminReview, AdminReviewFilters, ReviewStatus } from "@/types/admin-review";
import type { AdminProduct } from "@/types/admin-product";
import type { StoreItem } from "@/types/marketplace";

type ReviewTab = "all" | "queue" | "approved" | "hidden" | "rejected" | "trash";

const defaultFilters: AdminReviewFilters = {
  page: 1,
  limit: 20,
  sortBy: "createdAt",
  sortOrder: "desc",
};

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState<ReviewTab>("all");
  const [filters, setFilters] = useState<AdminReviewFilters>(defaultFilters);
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);
  const [inspectReviewId, setInspectReviewId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Confirm dialog state for dangerous actions
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
    confirmLabel: string;
    isDestructive?: boolean;
  }>({
    open: false,
    title: "",
    description: "",
    action: async () => {},
    confirmLabel: "Confirm",
  });
  const [isConfirming, setIsConfirming] = useState(false);

  // Queries & Mutations
  const computedFilters = useMemo(() => {
    const f: AdminReviewFilters = { ...filters };
    if (activeTab === "queue") {
      f.status = "pending";
    } else if (activeTab === "approved") {
      f.status = "approved";
      f.isDeleted = false;
    } else if (activeTab === "hidden") {
      f.status = "hidden";
      f.isDeleted = false;
    } else if (activeTab === "rejected") {
      f.status = "rejected";
      f.isDeleted = false;
    } else if (activeTab === "trash") {
      f.isDeleted = true;
    } else {
      // "all"
      f.isDeleted = false;
    }
    return f;
  }, [filters, activeTab]);

  const reviewsQuery = useAdminReviews(computedFilters);
  const statsQuery = useAdminReviewStats();

  const moderateMutation = useModerateReview();
  const deleteMutation = useSoftDeleteReview();
  const restoreMutation = useRestoreReview();
  const flagMutation = useFlagReview();
  const bulkMutation = useBulkReviewAction();

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

  const reviews = reviewsQuery.data?.reviews ?? [];
  const pagination = reviewsQuery.data?.pagination;
  const stats = statsQuery.data;

  // Filter updates
  const updateFilters = (updates: Partial<AdminReviewFilters>) => {
    setFilters((current) => ({ ...current, ...updates, page: 1 }));
    setSelectedReviewIds([]);
  };

  const handleTabChange = (tab: ReviewTab) => {
    setActiveTab(tab);
    setFilters((current) => ({ ...current, page: 1 }));
    setSelectedReviewIds([]);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setSelectedReviewIds([]);
  };

  // Selection handlers
  const handleToggleSelect = (reviewId: string) => {
    setSelectedReviewIds((prev) =>
      prev.includes(reviewId) ? prev.filter((id) => id !== reviewId) : [...prev, reviewId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReviewIds.length === reviews.length) {
      setSelectedReviewIds([]);
    } else {
      setSelectedReviewIds(reviews.map((r) => r.reviewId));
    }
  };

  // Quick single actions
  const handleModerateSingle = async (review: AdminReview, status: ReviewStatus) => {
    try {
      await moderateMutation.mutateAsync({ reviewId: review.reviewId, status });
      setFeedback({ type: "success", message: `Review status changed to ${status}.` });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to update review status." });
    }
  };

  const handleFlagSingle = async (review: AdminReview, type: "spam" | "abuse") => {
    try {
      await flagMutation.mutateAsync({ reviewId: review.reviewId, type });
      setFeedback({ type: "success", message: `Review flagged as ${type}.` });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to flag review." });
    }
  };

  const handleDeleteSingle = (review: AdminReview) => {
    setConfirmDialog({
      open: true,
      title: "Move Review to Trash?",
      description: `This will soft-delete the review by ${review.reviewer?.name || "the user"} and exclude its rating from store and product averages.`,
      confirmLabel: "Move to Trash",
      isDestructive: true,
      action: async () => {
        await deleteMutation.mutateAsync(review.reviewId);
        setFeedback({ type: "success", message: "Review moved to trash." });
      },
    });
  };

  const handleRestoreSingle = async (review: AdminReview) => {
    try {
      await restoreMutation.mutateAsync(review.reviewId);
      setFeedback({ type: "success", message: "Review restored successfully." });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to restore review." });
    }
  };

  // Bulk actions
  const executeBulkAction = (
    action: "approve" | "reject" | "hide" | "unhide" | "delete" | "restore" | "mark_spam" | "mark_abuse",
    title: string,
    description: string,
    isDestructive = false
  ) => {
    if (selectedReviewIds.length === 0) return;

    setConfirmDialog({
      open: true,
      title,
      description,
      confirmLabel: "Confirm",
      isDestructive,
      action: async () => {
        const result = await bulkMutation.mutateAsync({
          reviewIds: selectedReviewIds,
          action,
        });
        setFeedback({
          type: "success",
          message: `${result.affectedCount} reviews updated: ${result.message}`,
        });
        setSelectedReviewIds([]);
      },
    });
  };

  const handleConfirmAction = async () => {
    try {
      setIsConfirming(true);
      await confirmDialog.action();
      setConfirmDialog((prev) => ({ ...prev, open: false }));
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Operation failed." });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Admin" }, { label: "Review Moderation" }]} />
      <PageHeader
        title="Review Moderation & Feedback"
        description="Inspect, moderate, approve, or suppress marketplace reviews. Synchronizes product and store rating aggregates automatically."
      />

      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl border p-4 text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Stats Overview & Rating Distribution */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total Reviews"
            value={stats.total.toLocaleString()}
            description="Submitted across platform"
            icon={<Star className="h-5 w-5 fill-amber-400 text-amber-400" />}
          />
          <StatCard
            title="Average Rating"
            value={`${stats.averageRating.toFixed(1)} ★`}
            description="Platform aggregate"
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          />
          <StatCard
            title="Moderation Queue"
            value={stats.pending.toLocaleString()}
            description="Reviews awaiting review"
            icon={<Clock className="h-5 w-5 text-amber-600" />}
          />
          <StatCard
            title="Reported"
            value={stats.reported.toLocaleString()}
            description="Flagged by users or systems"
            icon={<Flag className="h-5 w-5 text-purple-600" />}
          />
          <StatCard
            title="Hidden / Deleted"
            value={(stats.hidden + stats.deleted).toLocaleString()}
            description="Excluded from storefront"
            icon={<EyeOff className="h-5 w-5 text-stone-500" />}
          />
        </div>
      )}

      {/* Rating Breakdown Progress Bars Card */}
      {stats && stats.total > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white/70 p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/70">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Marketplace Rating Breakdown
              </h3>
              <p className="text-xs text-stone-500">
                Distribution of all approved and pending customer scores
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
              <span className="font-bold text-lg text-amber-500">{stats.averageRating.toFixed(1)}</span>
              <span>out of 5 stars based on {stats.total} reviews</span>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.ratingDistribution[stars as 1 | 2 | 3 | 4 | 5] || 0;
              const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={stars} className="rounded-xl border border-stone-100 bg-stone-50/60 p-3 dark:border-stone-800 dark:bg-stone-900/40">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    <span className="flex items-center gap-1">
                      {stars} <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    </span>
                    <span>{count} ({percent}%)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Review Moderation Table & Filter Panel */}
      <DashboardCard
        title="Review Management"
        description="Filter by moderation state, store, rating, or search keywords."
      >
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3 dark:border-stone-800">
          <button
            type="button"
            onClick={() => handleTabChange("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "all"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
            }`}
          >
            All Reviews
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("queue")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "queue"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
            }`}
          >
            <span>Moderation Queue</span>
            {stats && stats.pending > 0 && (
              <span className="rounded-full bg-amber-200/90 px-1.5 py-0.2 text-[10px] font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                {stats.pending}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("approved")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "approved"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
            }`}
          >
            Approved ({stats?.approved ?? 0})
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("hidden")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "hidden"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
            }`}
          >
            Hidden ({stats?.hidden ?? 0})
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("rejected")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "rejected"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
            }`}
          >
            Rejected ({stats?.rejected ?? 0})
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("trash")}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "trash"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
            }`}
          >
            <Trash2 className="h-3 w-3" />
            Trash ({stats?.deleted ?? 0})
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(15rem,1.5fr)_repeat(4,minmax(8rem,1fr))_auto]">
          <label className="flex min-h-10 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-500 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
            <Search className="h-4 w-4 shrink-0" />
            <input
              value={filters.search ?? ""}
              onChange={(e) => updateFilters({ search: e.target.value || undefined })}
              placeholder="Search reviewer, product, comment..."
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-stone-400 text-xs sm:text-sm"
            />
          </label>

          <select
            value={filters.productId ?? ""}
            onChange={(e) => updateFilters({ productId: e.target.value || undefined })}
            className="min-h-10 rounded-lg border border-stone-200 bg-white px-3 text-xs sm:text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
          >
            <option value="">All products</option>
            {productsQuery.data?.map((p) => (
              <option key={p.productId} value={p.productId}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={filters.storeId ?? ""}
            onChange={(e) => updateFilters({ storeId: e.target.value || undefined })}
            className="min-h-10 rounded-lg border border-stone-200 bg-white px-3 text-xs sm:text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
          >
            <option value="">All stores</option>
            {storesQuery.data?.map((s) => (
              <option key={s.storeId ?? s._id} value={s.storeId ?? s._id ?? ""}>
                {s.storeName ?? s.name ?? "Store"}
              </option>
            ))}
          </select>

          <select
            value={filters.rating ?? ""}
            onChange={(e) => updateFilters({ rating: e.target.value ? Number(e.target.value) : undefined })}
            className="min-h-10 rounded-lg border border-stone-200 bg-white px-3 text-xs sm:text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
          >
            <option value="">All star ratings</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} Stars
              </option>
            ))}
          </select>

          <select
            value={filters.isVerifiedPurchase === undefined ? "" : String(filters.isVerifiedPurchase)}
            onChange={(e) =>
              updateFilters({
                isVerifiedPurchase: e.target.value === "true" ? true : e.target.value === "false" ? false : undefined,
              })
            }
            className="min-h-10 rounded-lg border border-stone-200 bg-white px-3 text-xs sm:text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
          >
            <option value="">All buyer types</option>
            <option value="true">Verified purchase</option>
            <option value="false">Unverified</option>
          </select>

          <Button type="button" variant="outline" size="sm" onClick={clearFilters} className="h-10 text-xs">
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>
        </div>

        {/* Table Selection Header */}
        {reviews.length > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-stone-100/70 px-3 py-2 text-xs text-stone-600 dark:bg-stone-800/60 dark:text-stone-400">
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={selectedReviewIds.length > 0 && selectedReviewIds.length === reviews.length}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 dark:border-stone-700 dark:bg-stone-800"
              />
              <span>Select all {reviews.length} visible reviews</span>
            </label>
            {selectedReviewIds.length > 0 && (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {selectedReviewIds.length} selected
              </span>
            )}
          </div>
        )}

        {/* Reviews List */}
        <div className="mt-3">
          {reviewsQuery.isLoading && (
            <EmptyState title="Loading reviews" description="Fetching marketplace feedback records." />
          )}

          {reviewsQuery.isError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300">
              {reviewsQuery.error instanceof Error ? reviewsQuery.error.message : "Unable to load reviews."}
            </div>
          )}

          {!reviewsQuery.isLoading && !reviewsQuery.isError && reviews.length === 0 && (
            <EmptyState
              title="No reviews found"
              description="No feedback matched the current tab and filter criteria."
            />
          )}

          {!reviewsQuery.isLoading && !reviewsQuery.isError && reviews.length > 0 && (
            <div className="space-y-3">
              {reviews.map((review) => (
                <AdminReviewRow
                  key={review.reviewId}
                  review={review}
                  isSelected={selectedReviewIds.includes(review.reviewId)}
                  onToggleSelect={handleToggleSelect}
                  onInspect={() => setInspectReviewId(review.reviewId)}
                  onModerate={handleModerateSingle}
                  onFlag={handleFlagSingle}
                  onDelete={handleDeleteSingle}
                  onRestore={handleRestoreSingle}
                  isProcessing={
                    moderateMutation.isPending ||
                    deleteMutation.isPending ||
                    restoreMutation.isPending ||
                    flagMutation.isPending
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-5 flex flex-col gap-3 border-t border-stone-200 pt-4 text-xs text-stone-600 dark:border-stone-800 dark:text-stone-300 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} reviews
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1 || reviewsQuery.isFetching}
                onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
                className="h-8 text-xs"
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages || reviewsQuery.isFetching}
                onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
                className="h-8 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </DashboardCard>

      {/* Bulk Action Floating Toolbar */}
      <ReviewBulkToolbar
        selectedCount={selectedReviewIds.length}
        isDeletedTab={activeTab === "trash"}
        isProcessing={bulkMutation.isPending}
        onApprove={() =>
          executeBulkAction(
            "approve",
            `Approve ${selectedReviewIds.length} Reviews?`,
            "Approved reviews will be displayed on storefront product and store pages and included in rating calculations."
          )
        }
        onReject={() =>
          executeBulkAction(
            "reject",
            `Reject ${selectedReviewIds.length} Reviews?`,
            "Rejected reviews will not be shown on the storefront or counted in rating averages.",
            true
          )
        }
        onHide={() =>
          executeBulkAction(
            "hide",
            `Hide ${selectedReviewIds.length} Reviews?`,
            "Hidden reviews will be suppressed from the storefront without deleting them."
          )
        }
        onUnhide={() =>
          executeBulkAction(
            "unhide",
            `Unhide ${selectedReviewIds.length} Reviews?`,
            "Unhidden reviews will be restored to visible status on storefront."
          )
        }
        onMarkSpam={() =>
          executeBulkAction(
            "mark_spam",
            `Mark ${selectedReviewIds.length} Reviews as Spam?`,
            "These reviews will be flagged as spam and hidden from the storefront.",
            true
          )
        }
        onMarkAbuse={() =>
          executeBulkAction(
            "mark_abuse",
            `Mark ${selectedReviewIds.length} Reviews as Abuse?`,
            "These reviews will be flagged for abusive content and hidden from the storefront.",
            true
          )
        }
        onDelete={() =>
          executeBulkAction(
            "delete",
            `Move ${selectedReviewIds.length} Reviews to Trash?`,
            "Selected reviews will be soft-deleted and omitted from all storefront rating scores.",
            true
          )
        }
        onRestore={() =>
          executeBulkAction(
            "restore",
            `Restore ${selectedReviewIds.length} Reviews from Trash?`,
            "Selected reviews will be restored back to approved status and recalculated."
          )
        }
        onClear={() => setSelectedReviewIds([])}
      />

      {/* Review Details & Moderation Modal */}
      {inspectReviewId && (
        <ReviewDetailsModal
          reviewId={inspectReviewId}
          onClose={() => setInspectReviewId(null)}
          onChanged={() => {
            reviewsQuery.refetch();
            statsQuery.refetch();
          }}
        />
      )}

      {/* Centered Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        confirmVariant={confirmDialog.isDestructive ? "destructive" : "default"}
        isConfirming={isConfirming}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        onConfirm={handleConfirmAction}
      />
    </DashboardContent>
  );
}
