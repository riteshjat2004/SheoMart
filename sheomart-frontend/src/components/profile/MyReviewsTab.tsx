"use client";

import Link from "next/link";
import { useState } from "react";
import { Star, Edit3, Trash2, CheckCircle2, MessageSquare, Store } from "lucide-react";
import { useMyReviews, useUpdateProductReview, useDeleteProductReview } from "@/hooks/use-reviews";
import { Button } from "@/components/ui/button";
import type { CustomerReview } from "@/services/reviews";

export function MyReviewsTab() {
  const myReviewsQuery = useMyReviews();
  const updateReviewMutation = useUpdateProductReview();
  const deleteReviewMutation = useDeleteProductReview();

  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const reviews = myReviewsQuery.data ?? [];

  const handleOpenEdit = (r: CustomerReview) => {
    setEditingReview(r);
    setRating(r.rating);
    setTitle(r.title);
    setComment(r.comment);
    setFeedback(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    setFeedback(null);

    updateReviewMutation.mutate(
      {
        reviewId: editingReview.reviewId,
        productId: editingReview.productId,
        payload: { rating, title, comment },
      },
      {
        onSuccess: () => {
          setFeedback("Review updated successfully!");
          setEditingReview(null);
        },
        onError: (err) => {
          setFeedback(err instanceof Error ? err.message : "Failed to update review");
        },
      }
    );
  };

  const handleDelete = (reviewId: string, productId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    deleteReviewMutation.mutate({ reviewId, productId });
  };

  if (myReviewsQuery.isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-stone-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-300">
          {feedback}
        </div>
      )}

      {editingReview && (
        <form
          onSubmit={handleSaveEdit}
          className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-950 dark:bg-emerald-950/20"
        >
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50">
            Edit Your Review for {editingReview.product?.name ?? editingReview.store?.storeName ?? "Store Experience"}
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Rating
            </label>
            <div className="flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 hover:scale-110"
                >
                  <Star className={`h-5 w-5 ${s <= rating ? "fill-current" : "text-stone-300"}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Comment
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingReview(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateReviewMutation.isPending}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Save Changes
            </Button>
          </div>
        </form>
      )}

      {reviews.length ? (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.reviewId}
              className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-stone-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-stone-100 bg-stone-50 dark:border-stone-800 flex items-center justify-center">
                  {r.product?.thumbnail ? (
                    <img
                      src={r.product.thumbnail}
                      alt={r.product?.name ?? "Product"}
                      className="h-full w-full object-cover"
                    />
                  ) : r.store?.logo ? (
                    <img
                      src={r.store.logo}
                      alt={r.store?.storeName ?? "Store"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>

                <div className="space-y-1">
                  {r.product ? (
                    <Link
                      href={`/products/${r.productId}`}
                      className="text-sm font-bold text-stone-900 hover:underline dark:text-stone-50"
                    >
                      {r.product.name}
                    </Link>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-stone-900 dark:text-stone-50">
                        {r.store?.storeName ?? "Store Experience"}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        Store Rating
                      </span>
                      {r.orderId ? (
                        <span className="text-[11px] font-mono text-stone-400">
                          #{r.orderId.slice(-8).toUpperCase()}
                        </span>
                      ) : null}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${s <= r.rating ? "fill-current" : "text-stone-300"}`}
                        />
                      ))}
                    </div>
                    {r.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300">{r.comment}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(r)}
                  className="rounded-lg border border-stone-200 p-2 text-stone-500 hover:border-emerald-500 hover:text-emerald-600 dark:border-stone-700"
                  title="Edit Review"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(r.reviewId, r.productId)}
                  className="rounded-lg border border-stone-200 p-2 text-stone-500 hover:border-red-500 hover:text-red-600 dark:border-stone-700"
                  title="Delete Review"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-200 p-8 text-center dark:border-stone-800">
          <MessageSquare className="mx-auto h-8 w-8 text-stone-300" />
          <p className="mt-2 text-sm font-semibold text-stone-800 dark:text-stone-200">
            You haven&apos;t written any reviews yet
          </p>
          <p className="mt-1 text-xs text-stone-500">
            After purchasing items from neighborhood stores, share your honest feedback to help other
            shoppers.
          </p>
        </div>
      )}
    </div>
  );
}
