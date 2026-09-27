import { CalendarDays, Headset, MessageCircle, Phone, Sparkles, Crown } from "lucide-react";
import { royalTheme } from "./royalTheme";

export function RoyalShoppingConcierge() {
  return (
    <section
      className={`rounded-[2rem] border border-amber-400/40 p-6 sm:p-8 shadow-xl shadow-black/50 ${royalTheme.panel}`}
      aria-labelledby="royal-shopping-concierge-heading"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-0.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
              <Crown className="h-3 w-3" />
              White-Glove Assistance
            </span>
          </div>

          <h2 id="royal-shopping-concierge-heading" className={`mt-3 text-2xl font-bold tracking-tight text-white`}>
            Personal Flagship Shopping Concierge
          </h2>

          <p className="mt-2 text-sm leading-6 text-stone-300">
            Need a bespoke festive hamper, specific organic cut, or special delivery timing? Our personal shopping advisors curate directly with the seller on your behalf.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <a
            href="https://wa.me/?text=Hello%2C%20I%20would%20like%20to%20consult%20the%20SheoMart%20Royal%20Shopping%20Concierge."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-stone-900/90 px-4 py-2.5 text-xs font-bold text-amber-200 transition-colors hover:border-amber-400 hover:bg-amber-400 hover:text-stone-950"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp Advisor
          </a>
          <a
            href="tel:1800123456"
            className="inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-stone-900/90 px-4 py-2.5 text-xs font-bold text-amber-200 transition-colors hover:border-amber-400 hover:bg-amber-400 hover:text-stone-950"
          >
            <Phone className="h-4 w-4" /> Call Specialist
          </a>
        </div>
      </div>
    </section>
  );
}
