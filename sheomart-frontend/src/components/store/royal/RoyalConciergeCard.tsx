import { Headset, MessageCircle, Phone, Sparkles } from "lucide-react";
import { royalTheme } from "./royalTheme";

export function RoyalConciergeCard() {
  return (
    <section
      className={`rounded-[2rem] border border-amber-300/80 p-6 sm:p-7 shadow-lg shadow-amber-500/10 dark:border-amber-400/40 dark:shadow-black/40 transition-all duration-300 ${royalTheme.panel} ${royalTheme.hover}`}
      aria-labelledby="royal-concierge-heading"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-400/60 bg-amber-500/10 text-amber-600 dark:text-amber-300 shadow-[0_0_20px_rgba(212,175,55,0.25)]">
          <Headset className="h-7 w-7" />
        </div>
        <div>
          <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${royalTheme.accent}`}>
            <Sparkles className="h-4 w-4" />
            24/7 Dedicated Support
          </p>
          <h2 id="royal-concierge-heading" className="mt-1.5 text-xl font-bold tracking-tight text-stone-900 dark:text-white">
            Royal Concierge Service
          </h2>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-stone-600 dark:text-stone-300">
        Direct white-glove assistance, bespoke ordering, and priority order dispatch tailored specifically for Royal patrons.
      </p>

      <div className="mt-6 flex flex-wrap gap-2.5">
        <a
          href="https://wa.me/?text=Hello%20SheoMart%20Royal%20Concierge%2C%20I%20would%20like%20assistance%20with%20my%20order."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-950 transition-colors hover:border-amber-400 hover:bg-amber-100 dark:border-amber-400/50 dark:bg-stone-900/80 dark:text-amber-200 dark:hover:border-amber-400 dark:hover:bg-amber-400 dark:hover:text-stone-950"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp Concierge
        </a>
        <a
          href="tel:1800123456"
          className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-950 transition-colors hover:border-amber-400 hover:bg-amber-100 dark:border-amber-400/50 dark:bg-stone-900/80 dark:text-amber-200 dark:hover:border-amber-400 dark:hover:bg-amber-400 dark:hover:text-stone-950"
        >
          <Phone className="h-4 w-4" /> Call Hotline
        </a>
      </div>
    </section>
  );
}
