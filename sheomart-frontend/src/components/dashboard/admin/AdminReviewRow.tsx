"use client";

import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Circle,
  Eye,
  EyeOff,
  MoreVertical,
  RotateCcw,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AdminReview, ReviewStatus } from "@/types/admin-review";

interface AdminReviewRowProps {
  review: AdminReview;
  isSelected?: boolean;
  onToggleSelect?: (reviewId: string) => void;
  onInspect?: (review: AdminReview) => void;
  onModerate?: (review: AdminReview, status: ReviewStatus) => void;
  onFlag?: (review: AdminReview, type: "spam" | "abuse") => void;
  onDelete?: (review: AdminReview) => void;
  onRestore?: (review: AdminReview) => void;
  isProcessing?: boolean;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const statusBadgeStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  rejected: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  hidden: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700",
  reported: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  deleted: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 border-rose-200 dark:border-rose-800",
};

export function AdminReviewRow({
  review,
  isSelected = false,
  onToggleSelect,
  onInspect,
  onModerate,
  onFlag,
  onDelete,
  onRestore,
  isProcessing = false,
}: AdminReviewRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const hasLongComment = review.comment.length > 180;
  const comment = expanded || !hasLongComment ? review.comment : `${review.comment.slice(0, 180).trimEnd()}...`;

  return (
    <article
      className={`relative rounded-xl border p-4 shadow-sm transition ${
        isSelected
          ? "border-emerald-500 bg-emerald-50/20 dark:border-emerald-700 dark:bg-emerald-950/20"
          : "border-stone-200 bg-white/80 dark:border-stone-800 dark:bg-stone-900/80"
      }`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Selection Checkbox */}
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(review.reviewId)}
              className="mt-1 h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 dark:border-stone-700 dark:bg-stone-800"
            />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-stone-900 dark:text-stone-50">
                {review.reviewer?.name ?? "Unknown reviewer"}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                on <span className="font-medium text-stone-700 dark:text-stone-300">{review.product?.name ?? "Unknown product"}</span>
              </span>
              {review.isVerifiedPurchase && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified purchase
                </span>
              )}
            </div>

            <p className="mt-1 inline-flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
              Store: <span className="font-medium text-stone-700 dark:text-stone-300">{review.store?.storeName ?? "Unknown store"}</span>
            </p>
          </div>
        </div>

        {/* Rating, Status & Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Star Rating */}
          <span
            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
            aria-label={`${review.rating} out of 5 stars`}
          >
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={`h-3.5 w-3.5 ${
                  index < review.rating ? "fill-current" : "text-amber-200 dark:text-amber-900"
                }`}
              />
            ))}
            <span className="ml-0.5">{review.rating}/5</span>
          </span>

          {/* Status Badge */}
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
              statusBadgeStyles[review.status] || statusBadgeStyles.pending
            }`}
          >
            {review.status}
          </span>

          {/* Report Badge */}
          {review.reportCount > 0 && (
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              {review.reportCount} {review.reportCount === 1 ? "report" : "reports"}
            </span>
          )}

          {/* Inspect Button */}
          {onInspect && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onInspect(review)}
              className="text-xs h-8"
            >
              Inspect
            </Button>
          )}

          {/* Quick Moderate Actions */}
          {!review.isDeleted ? (
            <>
              {review.status !== "approved" && onModerate && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => onModerate(review, "approved")}
                  className="h-8 text-xs text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                  title="Quick Approve"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Approve</span>
                </Button>
              )}

              {/* Action Dropdown Menu */}
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="h-8 w-8 p-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>

                {menuOpen && (
                  <div
                    className="absolute right-0 top-9 z-30 w-44 rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl dark:border-stone-800 dark:bg-stone-900"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    {review.status !== "rejected" && onModerate && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onModerate(review, "rejected");
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/40"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    )}

                    {onModerate && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onModerate(review, review.status === "hidden" ? "approved" : "hidden");
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                      >
                        {review.status === "hidden" ? (
                          <>
                            <Eye className="h-3.5 w-3.5" /> Unhide Review
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3.5 w-3.5" /> Hide Review
                          </>
                        )}
                      </button>
                    )}

                    {onFlag && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            onFlag(review, "spam");
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/40"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" /> Flag Spam
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            onFlag(review, "abuse");
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                        >
                          <AlertOctagon className="h-3.5 w-3.5" /> Flag Abuse
                        </button>
                      </>
                    )}

                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete(review);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 border-t border-stone-100 dark:border-stone-800 mt-1 pt-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Move to Trash
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            onRestore && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isProcessing}
                onClick={() => onRestore(review)}
                className="h-8 text-xs text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40 gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restore
              </Button>
            )
          )}
        </div>
      </div>

      {/* Review Comment Body */}
      <div className="mt-3 border-t border-stone-200/80 pt-3 dark:border-stone-800">
        {review.title && (
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">
            {review.title}
          </h3>
        )}
        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-stone-600 dark:text-stone-300">
          {comment || "No written comment."}
        </p>

        {hasLongComment && (
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-600 dark:text-emerald-300"
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? "Show less" : "Read full review"}
            <ChevronDown className={`h-3.5 w-3.5 transition ${expanded ? "rotate-180" : ""}`} />
          </button>
        )}

        {/* Image thumbnails preview if any */}
        {review.images && review.images.length > 0 && (
          <div className="mt-2.5 flex items-center gap-2">
            {review.images.slice(0, 4).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="thumb"
                className="h-10 w-10 rounded-md object-cover border border-stone-200 dark:border-stone-700"
              />
            ))}
            {review.images.length > 4 && (
              <span className="text-xs text-stone-400">+{review.images.length - 4} more</span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
          <Circle className="h-2 w-2 fill-current" />
          <span>Submitted {formatDate(review.createdAt)}</span>
          {review.moderationReason && (
            <span className="ml-2 italic text-purple-600 dark:text-purple-400">
              Note: {review.moderationReason}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
