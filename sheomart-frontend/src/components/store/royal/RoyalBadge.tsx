import { Crown, Sparkles } from "lucide-react";
import { royalTheme } from "./royalTheme";

export function RoyalBadge() {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide text-amber-200 ${royalTheme.badge} ${royalTheme.shimmer} ${royalTheme.hoverGlow}`}
    >
      <Crown className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      <span>SheoMart Royal</span>
      <Sparkles className="h-3 w-3 text-amber-300" />
    </span>
  );
}
