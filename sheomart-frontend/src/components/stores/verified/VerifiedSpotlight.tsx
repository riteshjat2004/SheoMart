import { ArrowRight, Sparkles } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";
import type { ProductItem } from "@/types/marketplace";

export function VerifiedSpotlight({ product }: { product?: ProductItem }) {
  const image = product?.image?.url || product?.thumbnail || product?.images?.[0];
  return <section className={`relative isolate overflow-hidden rounded-[2rem] border p-5 sm:p-7 ${verifiedTheme.panel}`} aria-labelledby="verified-spotlight-heading">{image ? <img src={image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20" /> : null}<div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-100/80 to-transparent dark:from-emerald-950/70" /><div className="max-w-xl"><p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${verifiedTheme.accent}`}><Sparkles className="h-4 w-4" /> Store spotlight</p><h2 id="verified-spotlight-heading" className={`mt-2 text-2xl font-semibold ${verifiedTheme.panelText}`}>{product?.category ?? "Everyday essentials"}</h2><p className={`mt-2 text-sm leading-6 ${verifiedTheme.panelMutedText}`}>Explore carefully selected products from this verified store, chosen for dependable quality and everyday value.</p><button type="button" className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold ${verifiedTheme.icon}`}>Browse spotlight <ArrowRight className="h-4 w-4" /></button></div></section>;
}
