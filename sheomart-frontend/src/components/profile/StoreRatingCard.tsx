"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquare, Star, Store, Sparkles, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRateOrder } from "@/hooks/use-orders";
import type { OrderRecord } from "@/services/orders";

interface StoreRatingCardProps {
  order: OrderRecord;
  className?: string;
  onRated?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent!",
};

export function StoreRatingCard({ order, className = "", onRated }: StoreRatingCardProps) {
  const storeName = order.store?.storeName ?? order.storeName ?? "SheoMart Neighborhood Store";
  const rateOrderMutation = useRateOrder();

  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState<number>(order.orderRating?.rating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState(order.orderRating?.comment || "");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // If already rated and not actively editing
  if (order.orderRating?.rating && !isEditing) {
    const existingRating = order.orderRating.rating;
    const existingComment = order.orderRating.comment;
    const ratedAt = order.orderRating.ratedAt
      ? new Date(order.orderRating.ratedAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;

    return (
      <div
        className={`rounded-2xl border border-emerald-200/80 bg-linear-to-br from-emerald-50/60 to-white p-5 shadow-xs dark:border-emerald-900/60 dark:from-emerald-950/20 dark:to-stone-900 ${className}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Store Feedback Submitted
              </p>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                You rated {storeName}
              </h3>
            </div>
          </div>
          {ratedAt && (
            <span className="text-xs text-stone-400 dark:text-stone-500">
              {ratedAt}
            </span>
          )}
        </div>

        <div className="mt-3.5 flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= existingRating
                  ? "fill-amber-400 text-amber-400"
                  : "text-stone-300 dark:text-stone-700"
              }`}
            />
          ))}
          <span className="ml-2 text-sm font-extrabold text-stone-800 dark:text-stone-200">
            {existingRating} / 5
          </span>
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
            ({RATING_LABELS[existingRating] || "Rated"})
          </span>
        </div>

        {existingComment ? (
          <p className="mt-2.5 rounded-xl border border-stone-100 bg-white/80 p-3 text-xs italic text-stone-600 dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-300">
            &ldquo;{existingComment}&rdquo;
          </p>
        ) : null}

        <div className="mt-3 flex items-center justify-between border-t border-emerald-100/60 pt-2.5 dark:border-emerald-900/40">
          <p className="text-[11px] text-stone-400 dark:text-stone-500">
            Your rating directly supports {storeName}&apos;s neighborhood reputation.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setRating(existingRating);
              setComment(existingComment || "");
              setIsEditing(true);
            }}
            className="h-7 gap-1 px-2.5 text-xs text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
          >
            <Pencil className="h-3 w-3" />
            Edit Rating
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order.orderId) return;

    if (rating === 0) {
      setFeedback({ type: "error", message: "Please select a star rating between 1 and 5." });
      return;
    }

    setFeedback(null);
    try {
      await rateOrderMutation.mutateAsync({
        orderId: order.orderId,
        rating,
        comment: comment.trim() || undefined,
      });
      setFeedback({
        type: "success",
        message: isEditing ? "Your rating has been updated!" : "Thank you! Your store rating has been submitted.",
      });
      setIsEditing(false);
      if (onRated) {
        onRated();
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to submit store rating.",
      });
    }
  };

  const activeStar = hoverRating || rating;

  return (
    <div
      className={`rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Completed Order Feedback
              </span>
              <Sparkles className="h-3 w-3 text-amber-500" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50">
              How was your experience with {storeName}?
            </h3>
          </div>
        </div>
      </div>

      <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">
        Leave a quick overall rating for packing, speed, and store service.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
        {/* Interactive Star Row */}
        <div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`Rate ${star} stars`}
                className="rounded-md p-1 transition hover:scale-115 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    star <= activeStar
                      ? "fill-amber-400 text-amber-400"
                      : "text-stone-300 hover:text-amber-200 dark:text-stone-700"
                  }`}
                />
              </button>
            ))}
            {activeStar > 0 && (
              <span className="ml-2.5 text-xs font-bold text-stone-700 dark:text-stone-300">
                {activeStar} ★ ({RATING_LABELS[activeStar]})
              </span>
            )}
          </div>
        </div>

        {/* Optional Review Comment */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
            <MessageSquare className="h-3.5 w-3.5 text-stone-400" />
            Write a review <span className="font-normal text-stone-400">(optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            maxLength={1000}
            placeholder="Share details about packaging quality, delivery speed, or store communication..."
            className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
          />
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`rounded-lg px-3 py-2 text-xs font-medium ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300"
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Action Row */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] text-stone-400">
            Only 1 overall rating per order. No need to rate individual items.
          </p>
          <div className="flex items-center gap-2">
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setFeedback(null);
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={rateOrderMutation.isPending || rating === 0}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {rateOrderMutation.isPending
                ? "Submitting..."
                : isEditing
                ? "Update Store Rating"
                : "Submit Store Rating"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
