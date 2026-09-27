import { Crown, Sparkles } from "lucide-react";
import { royalTheme } from "./royalTheme";

export function RoyalIdentityBanner() {
  return (
    <div
      className={`flex items-center gap-2.5 border-b border-amber-400/30 bg-gradient-to-r from-stone-950 via-black to-stone-950 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-300 ${royalTheme.shimmer}`}
    >
      <Crown className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      <span>Exclusive SheoMart Royal Flagship Partner</span>
      <Sparkles className="h-3 w-3 text-amber-400" />
      <span className="h-px flex-1 bg-gradient-to-r from-amber-400/60 via-amber-400/20 to-transparent" />
    </div>
  );
}
