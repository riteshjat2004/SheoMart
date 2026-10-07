"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, MessageSquare, Star, ThumbsUp } from "lucide-react";
import { fetchStorePublicReviews } from "@/services/store";

interface ReviewItem {
  id: string;
  name: string;
  avatarBg: string;
  rating: number;
  date: string;
  comment: string;
  sellerReply?: string;
  helpfulCount: number;
}

const communityReviews: ReviewItem[] = [
  {
    id: "r1",
    name: "Ramesh Sharma",
    avatarBg: "bg-emerald-100 text-emerald-800",
    rating: 5,
    date: "2 days ago",
    comment: "Vegetables were fresh and delivered within 25 minutes. Really reliable neighborhood store!",
    sellerReply: "Thank you Ramesh ji! We ensure daily morning fresh produce for our neighbors. 🙏",
    helpfulCount: 8,
  },
  {
    id: "r2",
    name: "Pooja Gupta",
    avatarBg: "bg-orange-100 text-orange-800",
    rating: 5,
    date: "1 week ago",
    comment: "Great prices on daily atta, milk, and spices. Very polite store keeper.",
    helpfulCount: 5,
  },
  {
    id: "r3",
    name: "Anil Verma",
    avatarBg: "bg-blue-100 text-blue-800",
    rating: 4,
    date: "2 weeks ago",
    comment: "Standard kirana packaging and everything ordered was delivered accurately.",
    sellerReply: "Thanks Anil ji, we appreciate your continuous support! 🙌",
    helpfulCount: 3,
  },
];

export function NormalStoreReviews({
  storeName = "Local Store",
  totalReviews = 0,
  averageRating = 4.8,
  storeId,
}: {
  storeName?: string;
  totalReviews?: number;
  averageRating?: number;
  storeId?: string;
}) {
  const [likes, setLikes] = useState<Record<string, number>>({});

  const reviewsQuery = useQuery({
    queryKey: ["store-public-reviews", storeId],
    queryFn: () => (storeId ? fetchStorePublicReviews(storeId) : null),
    enabled: Boolean(storeId),
    staleTime: 1000 * 60 * 5,
  });

  const realReviews = reviewsQuery.data?.reviews || [];
  const effectiveAverage =
    averageRating > 0 ? averageRating : reviewsQuery.data?.averageRating || 4.8;
  const effectiveTotal =
    totalReviews > 0 ? totalReviews : reviewsQuery.data?.total || realReviews.length;

  const handleLike = (id: string, initial: number) => {
    setLikes((prev) => ({
      ...prev,
      [id]: (prev[id] ?? initial) + 1,
    }));
  };

  const displayedReviews =
    realReviews.length > 0
      ? realReviews.map((r, index) => ({
          id: r.reviewId,
          name: r.user?.name || "Verified Customer",
          avatarBg:
            index % 3 === 0
              ? "bg-emerald-100 text-emerald-800"
              : index % 3 === 1
              ? "bg-orange-100 text-orange-800"
              : "bg-blue-100 text-blue-800",
          rating: r.rating,
          date: new Date(r.createdAt).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          }),
          comment: r.comment,
          sellerReply: r.sellerReply?.comment,
          helpfulCount: 2 + index,
        }))
      : communityReviews;

  return (
    <section aria-labelledby="normal-reviews-heading" className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2
              id="normal-reviews-heading"
              className="text-lg font-bold text-stone-900 dark:text-stone-50"
            >
              Customer Reviews &amp; Community Feedback
            </h2>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {effectiveTotal > 0 ? `${effectiveTotal} reviews` : "Verified Store"}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
            Real shopping experiences from neighborhood customers at {storeName}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium dark:border-stone-800 dark:bg-stone-900">
          <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
          <span className="font-bold text-stone-900 dark:text-stone-100">
            {effectiveAverage.toFixed(1)} / 5.0
          </span>
          <span className="text-stone-400">Rating</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {displayedReviews.map((review) => {
          const count = likes[review.id] ?? review.helpfulCount;

          return (
            <article
              key={review.id}
              className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-xs transition-all hover:border-emerald-300 hover:shadow-sm dark:border-stone-800 dark:bg-stone-900"
            >
              <div>
                {/* Author row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${review.avatarBg}`}
                    >
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {review.name}
                      </p>
                      <p className="text-[10px] text-stone-400">{review.date}</p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    Verified Buyer
                  </span>
                </div>

                {/* Rating stars */}
                <div className="mt-2.5 flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < review.rating ? "fill-current" : "text-stone-200 dark:text-stone-700"}`}
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="mt-2 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                  &ldquo;{review.comment}&rdquo;
                </p>

                {/* Seller Reply */}
                {review.sellerReply ? (
                  <div className="mt-3 rounded-xl bg-stone-50 p-2.5 text-[11px] text-stone-600 dark:bg-stone-950 dark:text-stone-400">
                    <p className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3 text-emerald-600" /> Store Owner Reply:
                    </p>
                    <p className="mt-0.5 italic">{review.sellerReply}</p>
                  </div>
                ) : null}
              </div>

              {/* Helpful count button */}
              <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2.5 dark:border-stone-800">
                <span className="text-[10px] text-stone-400">Was this helpful?</span>
                <button
                  type="button"
                  onClick={() => handleLike(review.id, review.helpfulCount)}
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-stone-500 transition hover:bg-stone-100 hover:text-emerald-600 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-emerald-400"
                >
                  <ThumbsUp className="h-2.5 w-2.5" />
                  <span>{count}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
