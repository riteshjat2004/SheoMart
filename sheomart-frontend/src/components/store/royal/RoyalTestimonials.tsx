import { Crown, Quote, Star } from "lucide-react";
import { royalTheme } from "./royalTheme";

const testimonials = [
  {
    name: "Aarav Mehta",
    title: "Connoisseur Member",
    quote: "The packaging and presentation feel like an unboxing from a high-end boutique. Freshness and care are evident in every single order.",
  },
  {
    name: "Dr. Mira Sharma",
    title: "VIP Collector",
    quote: "The concierge team coordinated our festival delivery seamlessly. Delivered with signature packaging and temperature preservation.",
  },
  {
    name: "Kabir Rawat",
    title: "Verified Patron",
    quote: "Exceptional organic reserves and luxury imported provisions you cannot find elsewhere in Sheopur. Truly a flagship experience.",
  },
];

export function RoyalTestimonials() {
  return (
    <section className="space-y-4" aria-labelledby="royal-testimonials-heading">
      <div className="flex items-center justify-between">
        <div>
          <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${royalTheme.accent}`}>
            <Crown className="h-3.5 w-3.5" />
            Connoisseur Reviews
          </p>
          <h2 id="royal-testimonials-heading" className={`mt-1 text-2xl font-bold tracking-tight ${royalTheme.panelText}`}>
            Trusted by Discerning Buyers
          </h2>
        </div>
        <div className="flex items-center gap-1 text-xs text-amber-300 font-semibold hidden sm:flex">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span>4.9 / 5.0 Average Rating</span>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {testimonials.map(({ name, title, quote }) => (
          <article
            key={name}
            className={`min-w-[290px] max-w-[340px] flex-1 rounded-3xl border border-amber-400/35 p-6 shadow-md shadow-black/40 transition-all duration-300 ${royalTheme.panel} ${royalTheme.hover}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-1" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star key={index} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <Quote className="h-5 w-5 text-amber-400/40" />
            </div>

            <p className="mt-4 text-sm leading-6 text-stone-200 italic">“{quote}”</p>

            <div className="mt-6 flex items-center gap-3 border-t border-amber-400/15 pt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-400/60 bg-stone-900 font-bold text-amber-300">
                {name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{name}</p>
                <p className="text-[11px] text-amber-300/80">{title}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
