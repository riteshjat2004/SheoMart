"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Crown, MessageSquare, Quote, Star } from "lucide-react";
import { fetchStorePublicReviews } from "@/services/store";
import type { StoreItem } from "@/types/marketplace";
import { royalTheme } from "./royalTheme";

interface RoyalTestimonialsProps {
  store?: StoreItem;
}

export function RoyalTestimonials({ store }: RoyalTestimonialsProps) {
  const storeId = store?.storeId;
  const storeName = store?.storeName ?? store?.name ?? "Royal Merchant";

  const reviewsQuery = useQuery({
    queryKey: ["store-public-reviews", storeId],
    queryFn: () => (storeId ? fetchStorePublicReviews(storeId) : null),
    enabled: Boolean(storeId),
    staleTime: 1000 * 60 * 5,
  });

  const realReviews = reviewsQuery.data?.reviews || [];
  const averageRating =
    typeof store?.rating === "number" && store.rating > 0
      ? store.rating
      : reviewsQuery.data?.averageRating || 4.9;
  const totalReviews =
    typeof store?.totalReviews === "number" && store.totalReviews > 0
      ? store.totalReviews
      : reviewsQuery.data?.total || 0;

  // Curated fallback reviews if store has no public reviews yet
  const fallbackTestimonials = [
    {
      name: "Verified Patron",
      title: "Royal Member",
      quote: `Exceptional presentation and packaging. Delivered fresh and with utmost care from ${storeName}.`,
      rating: 5,
    },
    {
      name: "Connoisseur Buyer",
      title: "Frequent Shopper",
      quote: "Quality and authenticity are evident in every selection. Truly stands apart as a luxury flagship mart.",
      rating: 5,
    },
  ];

  return (
    <section className="space-y-4" aria-labelledby="royal-testimonials-heading">
      <div className="flex items-center justify-between">
        <div>
          <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${royalTheme.accent}`}>
            <Crown className="h-3.5 w-3.5" />
            Connoisseur Reviews & Feedback
          </p>
          <h2 id="royal-testimonials-heading" className={`mt-1 text-2xl font-bold tracking-tight ${royalTheme.panelText}`}>
            Trusted by Discerning Buyers
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300 font-semibold hidden sm:flex">
          <Star className="h-4 w-4 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
          <span>
            {averageRating} / 5.0 ({totalReviews} {totalReviews === 1 ? "Review" : "Reviews"})
          </span>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {realReviews.length > 0
          ? realReviews.map((rev) => (
              <article
                key={rev.reviewId}
                className={`min-w-[290px] max-w-[340px] flex-1 rounded-3xl border border-amber-300/80 p-6 shadow-md shadow-amber-500/10 dark:border-amber-400/35 dark:shadow-black/40 transition-all duration-300 ${royalTheme.panel} ${royalTheme.hover}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-1" aria-label={`${rev.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < Math.round(rev.rating)
                            ? "fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400"
                            : "text-stone-300 dark:text-stone-700"
                        }`}
                      />
                    ))}
                  </div>
                  <Quote className="h-5 w-5 text-amber-500/30 dark:text-amber-400/40" />
                </div>

                <p className="mt-4 text-sm leading-6 text-stone-700 dark:text-stone-200 italic line-clamp-3">
                  “{rev.comment}”
                </p>

                {rev.sellerReply?.comment ? (
                  <div className="mt-3 rounded-xl bg-amber-50/70 p-2.5 text-[11px] text-amber-950 dark:bg-stone-900/60 dark:text-amber-200 border border-amber-200/50 dark:border-amber-400/20">
                    <span className="font-bold flex items-center gap-1">
                      <MessageSquare className="h-3 w-3 text-amber-600" /> Store Reply:
                    </span>
                    <p className="mt-0.5 text-stone-600 dark:text-stone-400 italic line-clamp-2">
                      {rev.sellerReply.comment}
                    </p>
                  </div>
                ) : null}

                <div className="mt-5 flex items-center justify-between border-t border-amber-200/80 dark:border-amber-400/15 pt-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-300 bg-amber-100 font-bold text-xs text-amber-900 shadow-xs dark:border-amber-400/60 dark:bg-stone-900 dark:text-amber-300">
                      {(rev.user?.name || "C").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-white">
                        {rev.user?.name || "Verified Customer"}
                      </p>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Verified Purchase
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          : fallbackTestimonials.map(({ name, title, quote, rating }) => (
              <article
                key={name}
                className={`min-w-[290px] max-w-[340px] flex-1 rounded-3xl border border-amber-300/80 p-6 shadow-md shadow-amber-500/10 dark:border-amber-400/35 dark:shadow-black/40 transition-all duration-300 ${royalTheme.panel} ${royalTheme.hover}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-1" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star key={index} className="h-4 w-4 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
                    ))}
                  </div>
                  <Quote className="h-5 w-5 text-amber-500/30 dark:text-amber-400/40" />
                </div>

                <p className="mt-4 text-sm leading-6 text-stone-700 dark:text-stone-200 italic">“{quote}”</p>

                <div className="mt-5 flex items-center gap-2.5 border-t border-amber-200/80 dark:border-amber-400/15 pt-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-300 bg-amber-100 font-bold text-xs text-amber-900 shadow-xs dark:border-amber-400/60 dark:bg-stone-900 dark:text-amber-300">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900 dark:text-white">{name}</p>
                    <span className="text-[10px] text-amber-800 dark:text-amber-300 font-medium">{title}</span>
                  </div>
                </div>
              </article>
            ))}
      </div>
    </section>
  );
}
