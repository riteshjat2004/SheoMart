"use client";

import { useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Flag,
  MessageSquare,
  Package,
  RotateCcw,
  Shield,
  Star,
  Store,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useAdminReviewDetails,
  useModerateReview,
  useSoftDeleteReview,
  useRestoreReview,
  useFlagReview,
} from "@/hooks/use-admin-reviews";
import type { ReviewStatus } from "@/types/admin-review";

interface ReviewDetailsModalProps {
  reviewId: string | null;
  onClose: () => void;
  onChanged?: () => void;
}

export function ReviewDetailsModal({ reviewId, onClose, onChanged }: ReviewDetailsModalProps) {
  const { data, isLoading, error } = useAdminReviewDetails(reviewId);
  const moderateMutation = useModerateReview();
  const deleteMutation = useSoftDeleteReview();
  const restoreMutation = useRestoreReview();
  const flagMutation = useFlagReview();

  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  if (!reviewId) return null;

  const review = data?.review;
  const reviewer = data?.reviewer;
  const product = data?.product;
  const store = data?.store;

  const formatDate = (val?: string | null) => {
    if (!val) return "N/A";
    const d = new Date(val);
    return Number.isNaN(d.getTime())
      ? "N/A"
      : d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const statusStyles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    rejected: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    hidden: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700",
    reported: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    deleted: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  };

  const handleModerate = async (status: ReviewStatus, reason?: string) => {
    if (!review) return;
    try {
      await moderateMutation.mutateAsync({ reviewId: review.reviewId, status, reason });
      setActionFeedback(`Review status updated to ${status}.`);
      setShowRejectInput(false);
      onChanged?.();
    } catch (e: any) {
      setActionFeedback(e.message || "Action failed.");
    }
  };

  const handleDelete = async () => {
    if (!review) return;
    try {
      await deleteMutation.mutateAsync(review.reviewId);
      setActionFeedback("Review moved to trash.");
      onChanged?.();
    } catch (e: any) {
      setActionFeedback(e.message || "Failed to delete review.");
    }
  };

  const handleRestore = async () => {
    if (!review) return;
    try {
      await restoreMutation.mutateAsync(review.reviewId);
      setActionFeedback("Review restored successfully.");
      onChanged?.();
    } catch (e: any) {
      setActionFeedback(e.message || "Failed to restore review.");
    }
  };

  const handleFlag = async (type: "spam" | "abuse") => {
    if (!review) return;
    try {
      await flagMutation.mutateAsync({ reviewId: review.reviewId, type });
      setActionFeedback(`Review flagged as ${type}.`);
      onChanged?.();
    } catch (e: any) {
      setActionFeedback(e.message || "Failed to flag review.");
    }
  };

  const isBusy =
    moderateMutation.isPending ||
    deleteMutation.isPending ||
    restoreMutation.isPending ||
    flagMutation.isPending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-950">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              <Star className="h-6 w-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Review Moderation
                </h2>
                {review && (
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                      statusStyles[review.status] || statusStyles.pending
                    }`}
                  >
                    {review.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Review ID: <span className="font-mono">{reviewId}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center text-stone-500">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mb-3" />
              <p className="text-sm font-medium">Loading review details...</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              {error instanceof Error ? error.message : "Failed to load review details."}
            </div>
          )}

          {actionFeedback && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              {actionFeedback}
            </div>
          )}

          {review && !isLoading && (
            <>
              {/* Review Content & Rating Card */}
              <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }, (_, idx) => (
                      <Star
                        key={idx}
                        className={`h-5 w-5 ${
                          idx < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-stone-200 dark:text-stone-700"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-base font-bold text-stone-900 dark:text-stone-100">
                      {review.rating} / 5
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {review.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verified Purchase
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        review.isVisible
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      }`}
                    >
                      {review.isVisible ? "Visible on Storefront" : "Hidden from Storefront"}
                    </span>
                  </div>
                </div>

                {review.title && (
                  <h3 className="mt-3 text-base font-bold text-stone-900 dark:text-stone-100">
                    {review.title}
                  </h3>
                )}

                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                  {review.comment || <span className="italic text-stone-400">No written comment provided.</span>}
                </p>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-stone-500 mb-2">Customer Photos ({review.images.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {review.images.map((img, idx) => (
                        <a
                          key={idx}
                          href={img}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative h-20 w-20 overflow-hidden rounded-lg border border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-800"
                        >
                          <img
                            src={img}
                            alt={`Review Photo ${idx + 1}`}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-stone-400 border-t border-stone-100 pt-3 dark:border-stone-800">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Submitted: {formatDate(review.createdAt)}
                  </span>
                  {review.moderatedAt && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Moderated: {formatDate(review.moderatedAt)}
                    </span>
                  )}
                  {review.deletedAt && (
                    <span className="inline-flex items-center gap-1 text-rose-500">
                      <Trash2 className="h-3.5 w-3.5" />
                      Deleted: {formatDate(review.deletedAt)}
                    </span>
                  )}
                </div>
              </div>

              {/* Reports & Flag Details Card if reported */}
              {(review.reportCount > 0 || review.reportReasons?.length > 0 || review.moderationReason) && (
                <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900/60 dark:bg-purple-950/20">
                  <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300 font-semibold text-sm">
                    <Flag className="h-4 w-4" />
                    Moderation & Report History
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-purple-900 dark:text-purple-200">
                    <p>Report Count: <span className="font-bold">{review.reportCount}</span></p>
                    {review.reportReasons && review.reportReasons.length > 0 && (
                      <div>
                        <span>Report Reasons:</span>
                        <ul className="list-disc pl-5 mt-1 space-y-0.5">
                          {review.reportReasons.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.moderationReason && (
                      <p className="mt-2 font-medium">Moderator Note: {review.moderationReason}</p>
                    )}
                  </div>
                </div>
              )}

              {/* 2-Column: Reviewer & Product Details */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Reviewer Details */}
                <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                      Reviewer Details
                    </h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-stone-400 block">Name</span>
                      <span className="font-semibold text-stone-900 dark:text-stone-100">
                        {reviewer?.name || review.reviewer?.name || "Unknown"}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Email</span>
                      <span className="text-stone-700 dark:text-stone-300">
                        {reviewer?.email || review.reviewer?.email || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Role & Customer Status</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="capitalize text-stone-700 dark:text-stone-300 font-medium">
                          {reviewer?.role || "Customer"}
                        </span>
                        {reviewer?.isVerifiedCustomer && (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" /> Verified Customer
                          </span>
                        )}
                      </div>
                    </div>
                    {reviewer?.userId && (
                      <div className="pt-1">
                        <a
                          href={`/admin/users?search=${encodeURIComponent(reviewer.email || reviewer.name || "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          View Full User Profile <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product & Store Details */}
                <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                      Product & Store
                    </h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-stone-400 block">Product</span>
                      <span className="font-semibold text-stone-900 dark:text-stone-100">
                        {product?.name || review.product?.name || "Unknown Product"}
                      </span>
                      {product?.sku && (
                        <span className="text-[11px] text-stone-400 block">SKU: {product.sku}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-stone-400 block">Store</span>
                      <span className="font-medium text-stone-800 dark:text-stone-200">
                        {store?.storeName || review.store?.storeName || "Unknown Store"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-stone-500">
                      <span>Product Rating: {product?.rating ?? "N/A"} ★</span>
                      <span>Total Reviews: {product?.totalReviews ?? 0}</span>
                    </div>
                    {product?.productId && (
                      <div className="pt-1">
                        <a
                          href={`/admin/products?search=${encodeURIComponent(product.name || "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          View Product in Catalog <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Direct Moderation Control Panel */}
              <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/40">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                  Moderator Actions
                </h4>

                <div className="flex flex-wrap items-center gap-2">
                  {review.status !== "approved" && (
                    <Button
                      size="sm"
                      disabled={isBusy}
                      onClick={() => handleModerate("approved")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approve Review
                    </Button>
                  )}

                  {review.status !== "rejected" && !showRejectInput && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isBusy}
                      onClick={() => setShowRejectInput(true)}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 gap-1.5 text-xs"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject Review
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => handleModerate(review.status === "hidden" ? "approved" : "hidden")}
                    className="gap-1.5 text-xs"
                  >
                    {review.status === "hidden" ? (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        Unhide Review
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        Hide Review
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => handleFlag("spam")}
                    className="text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/40 gap-1.5 text-xs"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Flag as Spam
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => handleFlag("abuse")}
                    className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 gap-1.5 text-xs"
                  >
                    <AlertOctagon className="h-3.5 w-3.5" />
                    Flag as Abuse
                  </Button>

                  {review.isDeleted ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isBusy}
                      onClick={handleRestore}
                      className="text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40 gap-1.5 text-xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restore Review
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isBusy}
                      onClick={handleDelete}
                      className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 gap-1.5 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Move to Trash
                    </Button>
                  )}
                </div>

                {showRejectInput && (
                  <div className="mt-3 space-y-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
                    <label className="block text-xs font-medium text-amber-900 dark:text-amber-200">
                      Reason for Rejection (Optional)
                    </label>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. Inappropriate language, off-topic, spam link..."
                      className="w-full rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-amber-500 dark:border-amber-700 dark:bg-stone-900"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={isBusy}
                        onClick={() => handleModerate("rejected", rejectReason || undefined)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-7"
                      >
                        Confirm Rejection
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowRejectInput(false)}
                        className="text-xs h-7"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end border-t border-stone-200 px-6 py-4 dark:border-stone-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
