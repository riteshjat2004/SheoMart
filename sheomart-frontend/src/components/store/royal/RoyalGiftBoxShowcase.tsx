import { Crown, Gift, Mail, PackageCheck, Sparkles } from "lucide-react";
import { royalTheme } from "./royalTheme";

export function RoyalGiftBoxShowcase() {
  return (
    <section
      className={`rounded-[2rem] border border-amber-400/40 p-6 sm:p-8 shadow-xl shadow-black/50 ${royalTheme.panel}`}
      aria-labelledby="royal-gift-box-heading"
    >
      <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
        {/* Visual Showcase */}
        <div className="relative flex h-52 items-center justify-center overflow-hidden rounded-3xl border border-amber-400/40 bg-gradient-to-br from-stone-950 via-black to-zinc-950 shadow-inner">
          <div className="relative flex h-28 w-36 items-center justify-center rounded-2xl border-2 border-amber-400 bg-stone-900 shadow-[0_0_36px_rgba(212,175,55,0.4)]">
            {/* Satin Ribbon cross */}
            <div className="absolute inset-y-0 left-1/2 w-4 -translate-x-1/2 bg-gradient-to-b from-amber-300 to-yellow-500 shadow-sm" />
            <div className="absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 bg-gradient-to-r from-amber-300 to-yellow-500 shadow-sm" />
            <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-stone-950 shadow-md">
              <Crown className="h-4 w-4 fill-stone-950" />
            </div>
          </div>

          <Sparkles className="absolute right-6 top-6 h-5 w-5 text-amber-400/80 animate-pulse" />
          <Sparkles className="absolute bottom-6 left-6 h-4 w-4 text-amber-400/60" />
        </div>

        {/* Info */}
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-0.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
            <Sparkles className="h-3 w-3" />
            The Finishing Touch
          </span>

          <h2 id="royal-gift-box-heading" className={`mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl`}>
            Signature Royal Gift Box
          </h2>

          <p className="mt-2 text-sm leading-6 text-stone-300">
            Every gift package is prepared with artisanal precision. Select "Add Royal Gift Box" during checkout for complimentary custom cards and ribbon embellishment.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-xs text-amber-200">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-black/60 px-3 py-1.5">
              <Gift className="h-3.5 w-3.5 text-amber-400" /> Satin Ribbon Wrap
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-black/60 px-3 py-1.5">
              <Mail className="h-3.5 w-3.5 text-amber-400" /> Hand-Embossed Note
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-black/60 px-3 py-1.5">
              <PackageCheck className="h-3.5 w-3.5 text-amber-400" /> Fragrance & Freshness Seal
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
