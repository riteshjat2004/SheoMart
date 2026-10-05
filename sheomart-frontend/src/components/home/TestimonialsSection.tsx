"use client";

import { useState } from "react";
import { Star, MessageSquareHeart, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeaturedReviews } from "@/hooks/use-home";
import { AllReviewsModal, type TestimonialItem } from "./AllReviewsModal";

interface TestimonialsSectionProps {
  pincode?: string | null;
  city?: string | null;
}

const FALLBACK_TESTIMONIALS: TestimonialItem[] = [
  {
    name: "Ramesh Sharma",
    location: "Shivpuri Road, Ward 4",
    avatarText: "RS",
    rating: 5,
    review:
      "Getting fresh cow milk and morning bread delivered in 20 minutes right to our home feels magical. Truly a blessing for busy families!",
    orderedItem: "Pure Dairy & Morning Bread",
    date: "2 days ago",
  },
  {
    name: "Pooja Verma",
    location: "Station Road",
    avatarText: "PV",
    rating: 5,
    review:
      "Vegetables were super fresh, crisp, and packed with care. Exactly the quality I would pick myself at the sabzi mandi, minus the parking hassle.",
    orderedItem: "Farm Fresh Tomatoes & Green Peas",
    date: "Yesterday",
  },
  {
    name: "Anil Meena",
    location: "Pali Road Near Bypass",
    avatarText: "AM",
    rating: 5,
    review:
      "The app is very fast and transparent. I love that I can pick my neighborhood Kirana store where I've shopped for 10 years and have them deliver.",
    orderedItem: "Aashirvaad Atta & Fortune Oil",
    date: "3 days ago",
  },
];

function formatReviewDate(dateVal?: string): string {
  if (!dateVal) return "Recently";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateVal;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays > 1 && diffDays < 30) return `${diffDays} days ago`;
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

export function TestimonialsSection({ pincode, city }: TestimonialsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: dynamicReviews, isLoading } = useFeaturedReviews({ pincode, city });

  const reviewsToDisplay: TestimonialItem[] =
    dynamicReviews && dynamicReviews.length > 0
      ? dynamicReviews.map((r) => ({
          reviewId: r.reviewId,
          name: r.name,
          location: r.storeName ? `${r.storeName}${r.storeCity ? ` • ${r.storeCity}` : ""}` : r.location,
          avatarText: r.avatarText || "VC",
          rating: r.rating,
          review: r.review,
          orderedItem: r.orderedItem || (r.storeName ? `Order from ${r.storeName}` : "Verified Order"),
          date: formatReviewDate(r.date),
        }))
      : FALLBACK_TESTIMONIALS;

  // Show strictly top 3 on homepage grid to keep design balanced & compact
  const topThreeReviews = reviewsToDisplay.slice(0, 3);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300">
            <MessageSquareHeart className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            {pincode ? `Reviews from PIN ${pincode}` : "Verified Local Reviews"}
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl dark:text-white">
            What our customers say
          </h2>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            {pincode
              ? `Real verified experiences from shoppers ordering from local stores near PIN ${pincode}.`
              : "Real ratings and experiences from families who shop fresh on SheoMart every single day."}
          </p>
        </div>

        {reviewsToDisplay.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-900 dark:border-stone-800 dark:text-stone-300 dark:hover:bg-stone-800 shrink-0 self-start sm:self-auto"
          >
            See All Reviews ({reviewsToDisplay.length})
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-3xl border border-stone-200/80 bg-stone-100/70 p-6 dark:border-stone-800 dark:bg-stone-900/60"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            {topThreeReviews.map((t, idx) => (
              <div
                key={t.reviewId || `${t.name}-${idx}`}
                className="relative flex flex-col justify-between rounded-3xl border border-stone-200/90 bg-white/90 p-6 shadow-sm transition hover:border-emerald-400 hover:shadow-md hover:bg-white dark:border-stone-800 dark:bg-stone-900/70 dark:hover:border-emerald-500/40 dark:hover:bg-stone-900"
              >
                <div>
                  {/* Star Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: Math.min(5, Math.max(1, Math.round(t.rating))) }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">{t.date}</span>
                  </div>

                  {/* Review Text */}
                  <p className="mt-4 text-xs sm:text-sm leading-relaxed text-stone-700 italic dark:text-stone-200">
                    &ldquo;{t.review}&rdquo;
                  </p>
                </div>

                <div className="mt-6 border-t border-stone-100 pt-4 dark:border-stone-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-bold text-white text-xs">
                        {t.avatarText}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                          {t.name}
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-[180px]">
                          {t.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl bg-emerald-50/70 px-3 py-1.5 text-[11px] text-emerald-800 font-medium flex items-center justify-between dark:bg-stone-950/60 dark:text-emerald-400">
                    <span className="shrink-0 mr-2">Verified Order:</span>
                    <span className="text-stone-700 truncate dark:text-stone-300">{t.orderedItem}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {reviewsToDisplay.length > 3 && (
            <div className="pt-2 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(true)}
                className="rounded-xl border-stone-200 bg-white/80 px-6 text-xs sm:text-sm font-medium text-stone-700 shadow-2xs hover:bg-stone-100 hover:text-stone-900 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                Read all {reviewsToDisplay.length} customer reviews
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Interactive Modal to view and filter all reviews */}
      <AllReviewsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reviews={reviewsToDisplay}
        pincode={pincode}
      />
    </section>
  );
}


