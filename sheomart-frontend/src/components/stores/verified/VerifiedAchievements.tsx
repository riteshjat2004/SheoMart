import { Award, CheckCircle2, PackageCheck, Star, Zap } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";

const achievements = [{ label: "Top Rated Seller", icon: Star }, { label: "Fast Dispatch", icon: Zap }, { label: "Authentic Products", icon: CheckCircle2 }, { label: "Customer Favorite", icon: Award }, { label: "Premium Packaging", icon: PackageCheck }];

export function VerifiedAchievements() {
  return <section aria-labelledby="verified-achievements-heading"><h2 id="verified-achievements-heading" className="sr-only">Verified achievements</h2><div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{achievements.map(({ label, icon: Icon }) => <span key={label} title={label} className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition hover:bg-emerald-100 dark:hover:bg-emerald-900/60 ${verifiedTheme.chip}`}><Icon className={`h-4 w-4 ${verifiedTheme.icon}`} />{label}</span>)}</div></section>;
}