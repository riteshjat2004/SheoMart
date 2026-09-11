import { Crown, ShieldCheck } from "lucide-react";
import { royalTheme } from "./royalTheme";

export function RoyalAuthenticityBanner() {
  return <section className={`rounded-[2rem] border p-5 sm:p-6 ${royalTheme.panel} ${royalTheme.hover}`} aria-labelledby="royal-authenticity-heading"><div className="flex items-start gap-4"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${royalTheme.badge}`}><Crown className="h-6 w-6" /></div><div><h2 id="royal-authenticity-heading" className={`text-xl font-semibold ${royalTheme.panelText}`}>100% Royal Authenticity Guarantee</h2><p className={`mt-2 text-sm leading-6 ${royalTheme.panelMutedText}`}>Genuine luxury products, hand-verified sellers, and a premium packaging guarantee.</p></div></div><div className="mt-5 border-t border-[#D4AF37]/30 pt-3 text-xs uppercase tracking-[0.16em] text-[#E7C873]"><ShieldCheck className="mr-2 inline h-4 w-4" /> SheoMart certificate of confidence</div></section>;
}
