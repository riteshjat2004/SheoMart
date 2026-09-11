import { Crown } from "lucide-react";
import { royalTheme } from "./royalTheme";

export function RoyalSectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return <div><p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${royalTheme.accent}`}><Crown className="h-4 w-4" /> Royal selection</p><h2 className={`mt-2 text-2xl font-semibold ${royalTheme.panelText}`}>{title}</h2><p className="mt-1 text-sm text-stone-400">{subtitle}</p><div className="mt-3 h-px w-24 bg-gradient-to-r from-[#D4AF37] to-transparent" /></div>;
}
