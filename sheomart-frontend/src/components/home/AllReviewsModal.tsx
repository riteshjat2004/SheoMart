"use client";

import { useState, useMemo } from "react";
import { X, Star, Search, ShieldCheck, MessageSquareHeart } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TestimonialItem {
  reviewId?: string;
  name: string;
  location: string;
  avatarText: string;
  rating: number;
  review: string;
  orderedItem: string;
  date: string;
}

interface AllReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: TestimonialItem[];
  pincode?: string | null;
}

export function AllReviewsModal({ isOpen, onClose, reviews, pincode }: AllReviewsModalProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (selectedRating !== null && Math.round(r.rating) !== selectedRating) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = r.name.toLowerCase().includes(query);
        const matchesReview = r.review.toLowerCase().includes(query);
        const matchesLocation = r.location.toLowerCase().includes(query);
        const matchesItem = r.orderedItem.toLowerCase().includes(query);
        return matchesName || matchesReview || matchesLocation || matchesItem;
      }
      return true;
    });
  }, [reviews, selectedRating, searchQuery]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 5.0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  }, [reviews]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-3xl border border-stone-200 bg-white shadow-2xl overflow-hidden dark:border-stone-800 dark:bg-stone-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 p-5 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <MessageSquareHeart className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-900 dark:text-white">Customer Reviews</h2>
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {avgRating}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {pincode ? `Reviews from local stores in PIN ${pincode}` : "All verified customer experiences"} ({reviews.length} total)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Rating Filter Bar */}
        <div className="space-y-3 border-b border-stone-100 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-900/60">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews, stores, products..."
              className="w-full rounded-xl border border-stone-200 bg-white pl-9 pr-4 py-2 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-stone-500 dark:text-stone-400 mr-1">Filter:</span>
            <Button
              size="sm"
              variant={selectedRating === null ? "default" : "outline"}
              onClick={() => setSelectedRating(null)}
              className={`h-7 px-3 rounded-lg text-xs ${
                selectedRating === null
                  ? "bg-emerald-600 text-white"
                  : "border-stone-200 text-stone-700 dark:border-stone-700 dark:text-stone-300"
              }`}
            >
              All ({reviews.length})
            </Button>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => Math.round(r.rating) === star).length;
              if (count === 0 && selectedRating !== star) return null;
              return (
                <Button
                  key={star}
                  size="sm"
                  variant={selectedRating === star ? "default" : "outline"}
                  onClick={() => setSelectedRating(selectedRating === star ? null : star)}
                  className={`h-7 px-2.5 rounded-lg text-xs gap-1 ${
                    selectedRating === star
                      ? "bg-amber-500 text-stone-950 font-bold"
                      : "border-stone-200 text-stone-700 dark:border-stone-700 dark:text-stone-300"
                  }`}
                >
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {star}★ ({count})
                </Button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Reviews List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-semibold text-stone-900 dark:text-white">No reviews found</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Try clearing your search query or selecting a different rating filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedRating(null);
                  setSearchQuery("");
                }}
                className="mt-2 text-xs"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            filteredReviews.map((t, idx) => (
              <div
                key={t.reviewId || `${t.name}-${idx}`}
                className="rounded-2xl border border-stone-200/90 bg-white p-4.5 shadow-xs transition hover:border-emerald-300 dark:border-stone-800 dark:bg-stone-900/90"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: Math.min(5, Math.max(1, Math.round(t.rating))) }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-400 dark:text-stone-500">{t.date}</span>
                </div>

                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-stone-200">
                  &ldquo;{t.review}&rdquo;
                </p>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-stone-100 pt-3 dark:border-stone-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 font-bold text-white text-[11px]">
                      {t.avatarText}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1">
                        {t.name}
                        <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      </p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400">{t.location}</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-emerald-50/80 px-2.5 py-1 text-[10px] text-emerald-800 font-medium dark:bg-stone-950/60 dark:text-emerald-400 self-start sm:self-auto">
                    <span className="text-stone-500 dark:text-stone-400 mr-1">Verified Order:</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{t.orderedItem}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-100 bg-stone-50/60 p-3 text-center text-[11px] text-stone-500 dark:border-stone-800 dark:bg-stone-950/40 dark:text-stone-400">
          Showing {filteredReviews.length} of {reviews.length} customer reviews
        </div>
      </div>
    </div>
  );
}
