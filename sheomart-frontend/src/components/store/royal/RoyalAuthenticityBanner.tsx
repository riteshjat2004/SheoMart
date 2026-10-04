import { Crown, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { royalTheme } from "./royalTheme";

export function RoyalAuthenticityBanner() {
  return (
    <section
      className={`rounded-[2rem] border border-amber-300/80 p-6 sm:p-7 shadow-lg shadow-amber-500/10 dark:border-amber-400/40 dark:shadow-black/40 transition-all duration-300 ${royalTheme.panel} ${royalTheme.hover}`}
      aria-labelledby="royal-authenticity-heading"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-400/60 bg-amber-500/10 text-amber-600 dark:text-amber-300 shadow-[0_0_20px_rgba(212,175,55,0.25)]">
          <Crown className="h-7 w-7 fill-amber-500/20 text-amber-600 dark:fill-amber-400/30 dark:text-amber-400" />
        </div>
        <div>
          <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${royalTheme.accent}`}>
            <Sparkles className="h-4 w-4" />
            Provenance Verified
          </p>
          <h2 id="royal-authenticity-heading" className="mt-1.5 text-xl font-bold tracking-tight text-stone-900 dark:text-white">
            100% Royal Authenticity Guarantee
          </h2>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-stone-600 dark:text-stone-300">
        Direct from verified origin producers. Each item carries our guarantee of peak freshness, unadulterated provenance, and pristine packaging.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-amber-300/60 dark:border-amber-400/20 pt-4 text-xs">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-semibold uppercase tracking-[0.14em]">
          <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" /> SheoMart Seal of Excellence
        </div>
        <span className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Hand-Inspected
        </span>
      </div>
    </section>
  );
}
