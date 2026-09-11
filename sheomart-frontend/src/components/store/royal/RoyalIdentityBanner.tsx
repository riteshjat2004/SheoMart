import { Crown } from "lucide-react";
import { royalTheme } from "./royalTheme";

export function RoyalIdentityBanner() {
  return <div className={`flex items-center gap-2 border-y px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] ${royalTheme.accent} border-[#D4AF37]/30 bg-black/80 ${royalTheme.shimmer}`}><Crown className="h-3.5 w-3.5" /> Exclusive Royal Partner <span className="h-px flex-1 bg-gradient-to-r from-[#D4AF37]/70 to-transparent" /></div>;
}
