"use client";

import { CheckCircle2, MessageSquare, Star, ThumbsUp, User } from "lucide-react";
import { useState } from "react";

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
}: {
  storeName?: string;
  totalReviews?: number;
  averageRating?: number;
}) {
  const [likes, setLikes] = useState<Record<string, number>>({});

  const handleLike = (id: string, initial: number) => {
    setLikes((prev) => ({
      ...prev,
      [id]: (prev[id] ?? initial) + 1,
    }));
  };

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
              {totalReviews > 0 ? `${totalReviews} reviews` : "Community Mart"}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
            Real shopping experiences from neighborhood customers
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium dark:border-stone-800 dark:bg-stone-900">
          <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
          <span className="font-bold text-stone-900 dark:text-stone-100">
            {averageRating.toFixed(1)} / 5.0
          </span>
          <span className="text-stone-400">Rating</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {communityReviews.map((review) => {
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
                  <div className="mt-3 rounded-xl border border-stone-100 bg-stone-50 p-2.5 text-[11px] text-stone-600 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-400">
                    <div className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                      <MessageSquare className="h-3 w-3" />
                      <span>{storeName} Response:</span>
                    </div>
                    <p className="mt-1">{review.sellerReply}</p>
                  </div>
                ) : null}
              </div>

              {/* Helpful button */}
              <div className="mt-4 flex items-center justify-end border-t border-stone-100 pt-2 text-[11px] text-stone-400 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => handleLike(review.id, review.helpfulCount)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                >
                  <ThumbsUp className="h-3 w-3" />
                  <span>Helpful ({count})</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
