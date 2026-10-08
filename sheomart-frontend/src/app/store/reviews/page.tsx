"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Star,
  Search,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Send,
  Flag,
  Filter,
  Package,
  Store,
} from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  useStoreReviews,
  useReplyToStoreReview,
  useReportStoreReview,
} from "@/hooks/use-seller-reviews";
import type { StoreReviewItem } from "@/services/seller-reviews";

export default function StoreReviewsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [reportingReview, setReportingReview] = useState<StoreReviewItem | null>(null);
  const [reportReason, setReportReason] = useState("");

  const reviewsQuery = useStoreReviews({
    page,
    limit: 10,
    search: search.trim() || undefined,
    rating: ratingFilter,
  });

  const replyMutation = useReplyToStoreReview();
  const reportMutation = useReportStoreReview();

  const reviews = reviewsQuery.data?.reviews ?? [];
  const stats = reviewsQuery.data?.stats;
  const pagination = reviewsQuery.data?.pagination;

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) return;
    await replyMutation.mutateAsync({ reviewId, comment: replyText });
    setReplyingReviewId(null);
    setReplyText("");
  };

  const handleReportSubmit = async () => {
    if (!reportingReview) return;
    await reportMutation.mutateAsync({
      reviewId: reportingReview.reviewId,
      reason: reportReason,
    });
    setReportingReview(null);
    setReportReason("");
  };

  const totalReviews = stats?.totalReviews ?? 0;
  const avgRating = stats?.averageRating ?? 0;

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Reviews & Feedback" }]} />

      <PageHeader
        category="SALES & CUSTOMERS"
        title="Store Product Reviews"
        description="Monitor verified customer ratings, reply directly to shoppers, and report abusive feedback to admin."
      />

      {/* Review Analytics Summary Header */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/50">
            <Star className="h-8 w-8 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-stone-900 dark:text-stone-50">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-stone-400">/ 5.0</span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Store overall customer satisfaction rating
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50">
            <MessageSquare className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <span className="text-3xl font-extrabold text-stone-900 dark:text-stone-50">
              {totalReviews}
            </span>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Lifetime verified customer reviews received
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats?.breakdown?.[star] ?? 0;
              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-7 flex items-center gap-0.5 font-bold text-stone-600 dark:text-stone-400">
                    {star} <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  </span>
                  <div className="flex-1 h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-amber-400 rounded-full"
                    />
                  </div>
                  <span className="w-8 text-right font-medium text-stone-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search reviews by comment or title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-9 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setRatingFilter(undefined);
              setPage(1);
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              ratingFilter === undefined
                ? "bg-emerald-600 text-white shadow-xs"
                : "border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300"
            }`}
          >
            All Ratings
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setRatingFilter(s);
                setPage(1);
              }}
              className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${
                ratingFilter === s
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300"
              }`}
            >
              <span>{s}</span>
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Review Cards List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center dark:border-stone-800 dark:bg-stone-900">
            <MessageSquare className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-700 mb-3" />
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">No reviews found</h4>
            <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1">
              Customer reviews for products sold by your store will appear here with customer names and star ratings.
            </p>
          </div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.reviewId}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {(r.user?.name || "C").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {r.user?.name || "Verified Customer"}
                      </p>
                      {r.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-stone-400">
                      Reviewed on {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < r.rating ? "text-amber-500 fill-amber-500" : "text-stone-200 dark:text-stone-800"
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReportingReview(r)}
                    className="h-7 px-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Report abusive review to admin"
                  >
                    <Flag className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Product or Order Referenced */}
              {r.product ? (
                <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-stone-50 p-2 text-xs dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-200/80 dark:bg-stone-700">
                    <Package className="h-4 w-4 text-stone-600 dark:text-stone-300" />
                  </div>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {r.product.name}
                  </span>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-amber-50/60 p-2 text-xs dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/60">
                    <Store className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                  </div>
                  <span className="font-semibold text-amber-900 dark:text-amber-200">
                    Store Order Experience {r.orderId ? `(Order #${r.orderId.slice(-8)})` : ""}
                  </span>
                </div>
              )}

              {/* Review Text */}
              <div className="mt-3">
                {r.title && (
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 mb-1">
                    {r.title}
                  </h4>
                )}
                <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300">
                  {r.comment || "No written comment left."}
                </p>
              </div>

              {/* Seller Reply Section */}
              {r.sellerReply ? (
                <div className="mt-4 rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                      Store Owner Response
                    </span>
                    <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
                      {new Date(r.sellerReply.repliedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-stone-800 dark:text-stone-200">
                    {r.sellerReply.comment}
                  </p>
                </div>
              ) : replyingReviewId === r.reviewId ? (
                <div className="mt-4 space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-950">
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                    Write Public Store Response
                  </label>
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Thank the customer or address their concern professionally..."
                    className="w-full rounded-lg border border-stone-200 bg-white p-2 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReplyingReviewId(null)}
                      className="h-7 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={replyMutation.isPending || !replyText.trim()}
                      onClick={() => handleReplySubmit(r.reviewId)}
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Send className="mr-1 h-3 w-3" />
                      Post Reply
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyingReviewId(r.reviewId);
                      setReplyText("");
                    }}
                    className="h-7 gap-1 text-xs"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Reply as Store
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Report Review Modal */}
      {reportingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center gap-2.5 text-rose-600 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50">
                Report Review to Admin
              </h3>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
              Admin will review this report against marketplace guidelines (e.g. spam, abusive language, or competitor sabotage).
            </p>

            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Reason for Report
            </label>
            <textarea
              rows={3}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Explain why this review violates guidelines..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs outline-none focus:border-rose-500 dark:border-stone-800 dark:bg-stone-950"
            />

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReportingReview(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={reportMutation.isPending || !reportReason.trim()}
                onClick={handleReportSubmit}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Submit Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardContent>
  );
}
