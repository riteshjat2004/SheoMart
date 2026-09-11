import { Crown } from "lucide-react";
import { royalTheme } from "./royalTheme";

export function RoyalDivider() {
  return <div className="flex items-center gap-3 py-1" aria-hidden="true"><span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent" /><Crown className={`h-4 w-4 ${royalTheme.icon}`} /><span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent" /></div>;
}
