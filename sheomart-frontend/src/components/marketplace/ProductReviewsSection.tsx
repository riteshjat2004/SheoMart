"use client";

import { useState } from "react";
import { Star, MessageSquare, ShieldCheck, Trash2, Edit3, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import {
  useProductReviews,
  useCreateProductReview,
  useUpdateProductReview,
  useDeleteProductReview,
} from "@/hooks/use-reviews";
import type { CustomerReview } from "@/services/reviews";

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
}

export function ProductReviewsSection({ productId, productName }: ProductReviewsSectionProps) {
  const { user, isAuthenticated } = useAuthStore();
  const reviewsQuery = useProductReviews(productId);
  const createReviewMutation = useCreateProductReview();
  const updateReviewMutation = useUpdateProductReview();
  const deleteReviewMutation = useDeleteProductReview();

  const [isWriting, setIsWriting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  // Form fields
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const reviews = reviewsQuery.data ?? [];

  // Ratings calculation
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : "0.0";

  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const r of reviews) {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
    }
  }

  const handleAddImage = () => {
    if (!imageUrl.trim()) return;
    setImages((prev) => [...prev, imageUrl.trim()]);
    setImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenEdit = (review: CustomerReview) => {
    setEditingReviewId(review.reviewId);
    setRating(review.rating);
    setTitle(review.title);
    setComment(review.comment);
    setImages(review.images || []);
    setIsWriting(true);
    setFeedback(null);
  };

  const handleCancel = () => {
    setIsWriting(false);
    setEditingReviewId(null);
    setRating(5);
    setTitle("");
    setComment("");
    setImages([]);
    setFeedback(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!comment.trim()) {
      setFeedback({ type: "error", text: "Please enter your review comments." });
      return;
    }

    if (editingReviewId) {
      updateReviewMutation.mutate(
        {
          reviewId: editingReviewId,
          productId,
          payload: { rating, title, comment, images },
        },
        {
          onSuccess: () => {
            setFeedback({ type: "success", text: "Review updated successfully!" });
            setTimeout(handleCancel, 1200);
          },
          onError: (err) => {
            setFeedback({
              type: "error",
              text: err instanceof Error ? err.message : "Failed to update review",
            });
          },
        }
      );
    } else {
      createReviewMutation.mutate(
        {
          productId,
          payload: { rating, title, comment, images },
        },
        {
          onSuccess: () => {
            setFeedback({ type: "success", text: "Thank you! Your review has been submitted." });
            setTimeout(handleCancel, 1500);
          },
          onError: (err) => {
            setFeedback({
              type: "error",
              text: err instanceof Error ? err.message : "Failed to submit review",
            });
          },
        }
      );
    }
  };

  const handleDelete = (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    deleteReviewMutation.mutate({ reviewId, productId });
  };

  return (
    <section className="space-y-6 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">
            Ratings & Customer Feedback
          </p>
          <h2 className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-50">
            Reviews for {productName}
          </h2>
        </div>

        {isAuthenticated && !isWriting && (
          <Button
            type="button"
            onClick={() => {
              setEditingReviewId(null);
              setIsWriting(true);
              setFeedback(null);
            }}
            className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Write a Review
          </Button>
        )}
      </div>

      {/* Ratings Summary Card */}
      <div className="grid gap-6 rounded-2xl border border-stone-100 bg-stone-50 p-6 md:grid-cols-[200px_1fr] dark:border-stone-800 dark:bg-stone-950/60">
        <div className="flex flex-col items-center justify-center border-b border-stone-200 pb-4 text-center md:border-b-0 md:border-r md:pb-0 md:pr-6 dark:border-stone-800">
          <span className="text-5xl font-extrabold text-stone-900 dark:text-stone-50">
            {avgRating}
          </span>
          <div className="mt-2 flex items-center gap-1 text-amber-500">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(Number(avgRating)) ? "fill-current" : "text-stone-300"
                }`}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Rating bars */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingCounts[star] || 0;
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-8 font-medium text-stone-600 dark:text-stone-300">
                  {star} ★
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                  <div
                    className="h-full bg-amber-400 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-stone-400">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Form */}
      {isWriting && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-950 dark:bg-emerald-950/20"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">
              {editingReviewId ? "Edit Your Review" : "Write Your Product Review"}
            </h3>
            <span className="text-xs text-stone-500">Only verified buyers can review</span>
          </div>

          {feedback && (
            <div
              className={`rounded-xl p-3 text-xs font-medium ${
                feedback.type === "success"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* Star selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Overall Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(s)}
                  className="p-1 transition hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 ${
                      s <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-500"
                        : "text-stone-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-semibold text-amber-700">
                {rating === 5
                  ? "Excellent"
                  : rating === 4
                  ? "Good"
                  : rating === 3
                  ? "Average"
                  : rating === 2
                  ? "Below Average"
                  : "Poor"}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Headline / Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Delicious, fresh and crunchy"
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Your Review Comments
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike? How was the freshness and packaging?"
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
            />
          </div>

          {/* Add Image URL */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Attach Photos (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste image URL (e.g. Cloudinary / Unsplash)"
                className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddImage}>
                Add Photo
              </Button>
            </div>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {images.map((img, i) => (
                  <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border">
                    <img src={img} alt="review" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createReviewMutation.isPending || updateReviewMutation.isPending}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {editingReviewId ? "Save Changes" : "Submit Review"}
            </Button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviewsQuery.isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-100" />
            ))}
          </div>
        ) : reviews.length ? (
          reviews.map((r) => {
            const isOwner = user?.userId === r.userId;
            return (
              <div
                key={r.reviewId}
                className="space-y-2.5 rounded-2xl border border-stone-100 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-zinc-900/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= r.rating ? "fill-current" : "text-stone-300"
                            }`}
                          />
                        ))}
                      </div>
                      {r.title && (
                        <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-50">
                          {r.title}
                        </h4>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                      <span>Customer</span>
                      <span>•</span>
                      <span>
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Recently"}
                      </span>
                      {r.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>

                  {isOwner && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(r)}
                        className="rounded p-1 text-stone-400 hover:text-emerald-600"
                        title="Edit Review"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r.reviewId)}
                        className="rounded p-1 text-stone-400 hover:text-red-600"
                        title="Delete Review"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs leading-5 text-stone-700 dark:text-stone-300">{r.comment}</p>

                {r.images && r.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {r.images.map((img, i) => (
                      <div
                        key={i}
                        className="h-16 w-16 overflow-hidden rounded-xl border border-stone-200"
                      >
                        <img src={img} alt="review pic" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-200 p-8 text-center dark:border-stone-800">
            <MessageSquare className="mx-auto h-8 w-8 text-stone-300" />
            <p className="mt-2 text-sm font-semibold text-stone-800 dark:text-stone-200">
              No reviews yet
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Be the first verified customer to share your thoughts on this item.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
