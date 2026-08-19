"use client";

import { CheckCircle2, ChevronDown, Circle, Eye, EyeOff, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AdminReview } from "@/types/admin-review";

interface AdminReviewRowProps {
  review: AdminReview;
  isUpdatingVisibility?: boolean;
  onVisibilityChange: (review: AdminReview) => void;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function AdminReviewRow({ review, isUpdatingVisibility = false, onVisibilityChange }: AdminReviewRowProps) {
  const [expanded, setExpanded] = useState(false);
  const hasLongComment = review.comment.length > 180;
  const comment = expanded || !hasLongComment ? review.comment : `${review.comment.slice(0, 180).trimEnd()}...`;

  return (
    <article className="rounded-xl border border-stone-200 bg-white/80 p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/80">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-stone-900 dark:text-stone-50">{review.reviewer?.name ?? "Unknown reviewer"}</span>
            <span className="text-xs text-stone-500 dark:text-stone-400">on {review.product?.name ?? "Unknown product"}</span>
            {review.isVerifiedPurchase ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" />Verified purchase</span> : null}
          </div>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">{review.store?.storeName ?? "Unknown store"}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" aria-label={`${review.rating} out of 5 stars`}>
            {Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-3.5 w-3.5 ${index < review.rating ? "fill-current" : "text-amber-200 dark:text-amber-900"}`} />)}
            <span>{review.rating}/5</span>
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${review.isVisible ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`}>
            {review.isVisible ? "Visible" : "Hidden"}
          </span>
          {review.isDeleted ? <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">Deleted</span> : null}
          {!review.isDeleted ? (
            <Button type="button" variant="outline" size="sm" onClick={() => onVisibilityChange(review)} disabled={isUpdatingVisibility}>
              {review.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {isUpdatingVisibility ? "Saving..." : review.isVisible ? "Hide review" : "Show review"}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-3 border-t border-stone-200/80 pt-3 dark:border-stone-800">
        {review.title ? <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">{review.title}</h3> : null}
        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-stone-600 dark:text-stone-300">{comment || "No written comment."}</p>
        {hasLongComment ? <button type="button" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-600 dark:text-emerald-300" onClick={() => setExpanded((current) => !current)}>{expanded ? "Show less" : "Read full review"}<ChevronDown className={`h-3.5 w-3.5 transition ${expanded ? "rotate-180" : ""}`} /></button> : null}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400"><Circle className="h-2.5 w-2.5" />Submitted {formatDate(review.createdAt)}</div>
      </div>
    </article>
  );
}
