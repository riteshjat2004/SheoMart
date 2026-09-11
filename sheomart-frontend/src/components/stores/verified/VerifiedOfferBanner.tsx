import { ArrowRight, BadgePercent, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifiedTheme } from "@/themes/verifiedTheme";

export function VerifiedOfferBanner() {
  return <section className={`relative isolate overflow-hidden rounded-[2rem] border p-6 sm:p-8 ${verifiedTheme.hero}`} aria-labelledby="verified-weekend-sale-heading"><div className="absolute -right-8 -top-14 -z-10 h-44 w-44 rounded-full border border-[#E7C873]/20 bg-[#E7C873]/10 blur-2xl" /><div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${verifiedTheme.accent}`}><Sparkles className="h-4 w-4" /> Verified exclusive</p><h2 id="verified-weekend-sale-heading" className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Verified Weekend Sale</h2><p className="mt-2 text-sm text-emerald-100">Up to 40% OFF on selected essentials. Offer timing to be announced.</p></div><Button type="button" className={verifiedTheme.primaryButton}><BadgePercent className="h-4 w-4" /> Shop Offers <ArrowRight className="h-4 w-4" /></Button></div></section>;
}
