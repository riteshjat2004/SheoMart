import { Crown, Sparkles } from "lucide-react";
import { royalTheme } from "./royalTheme";

export function RoyalBadge() {
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${royalTheme.badge} ${royalTheme.shimmer} ${royalTheme.hoverGlow}` }><Crown className="h-4 w-4" /> Royal Store <Sparkles className="h-3 w-3" /></span>;
}
