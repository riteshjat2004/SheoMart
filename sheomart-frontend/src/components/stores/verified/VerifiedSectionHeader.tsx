import { ArrowRight, type LucideIcon } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";

export function VerifiedSectionHeader({ icon: Icon, title, subtitle, onViewAll }: { icon: LucideIcon; title: string; subtitle: string; onViewAll?: () => void }) {
  return <div className="flex items-end justify-between gap-4"><div><div className="flex items-center gap-2"><Icon className={`h-5 w-5 ${verifiedTheme.icon}`} /><p className={`text-xs font-semibold uppercase tracking-[0.2em] ${verifiedTheme.accent}`}>Verified selection</p></div><h2 className={`mt-2 text-2xl font-semibold ${verifiedTheme.panelText}`}>{title}</h2><p className={`mt-1 text-sm ${verifiedTheme.panelMutedText}`}>{subtitle}</p></div>{onViewAll ? <button type="button" onClick={onViewAll} className={`inline-flex shrink-0 items-center gap-1 text-sm font-semibold ${verifiedTheme.icon}`}>View All <ArrowRight className="h-4 w-4" /></button> : null}</div>;
}
