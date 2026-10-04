"use client";

import { Star, MessageSquareHeart, Quote } from "lucide-react";

interface Testimonial {
  name: string;
  location: string;
  avatarText: string;
  rating: number;
  review: string;
  orderedItem: string;
  date: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Ramesh Sharma",
    location: "Shivpuri Road, Ward 4",
    avatarText: "RS",
    rating: 5,
    review:
      "Getting fresh cow milk and morning bread delivered in 20 minutes right to our home in Sheopur feels magical. Truly a blessing for busy families!",
    orderedItem: "Pure Dairy & Morning Bread",
    date: "2 days ago",
  },
  {
    name: "Pooja Verma",
    location: "Station Road, Sheopur",
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

export function TestimonialsSection() {
  return (
    <section className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300">
          <MessageSquareHeart className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          Loved by Sheopur
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">
          What our customers say
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Real experiences from families across Sheopur who shop smarter every single day.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.name}
            className="relative flex flex-col justify-between rounded-3xl border border-stone-200/90 bg-white/90 p-6 shadow-sm transition hover:border-emerald-400 hover:shadow-md hover:bg-white dark:border-stone-800 dark:bg-stone-900/70 dark:hover:border-emerald-500/40 dark:hover:bg-stone-900"
          >
            <div>
              {/* Star Rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: t.rating }).map((_, i) => (
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
                    <p className="text-sm font-bold text-stone-900 dark:text-white">{t.name}</p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">{t.location}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-emerald-50/70 px-3 py-1.5 text-[11px] text-emerald-800 font-medium flex items-center justify-between dark:bg-stone-950/60 dark:text-emerald-400">
                <span>Verified Order:</span>
                <span className="text-stone-700 dark:text-stone-300">{t.orderedItem}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
