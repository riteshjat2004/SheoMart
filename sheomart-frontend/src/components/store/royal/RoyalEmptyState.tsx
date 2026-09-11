import { Crown } from "lucide-react";
import { royalTheme } from "./royalTheme";

export function RoyalEmptyState({ title, description, actionLabel }: { title: string; description: string; actionLabel?: string }) {
  return <div className={`rounded-3xl border border-dashed p-7 text-center ${royalTheme.panel}`} role="status"><Crown className={`mx-auto h-9 w-9 ${royalTheme.icon}`} /><h3 className={`mt-3 font-semibold ${royalTheme.panelText}`}>{title}</h3><p className="mt-1 text-sm text-stone-400">{description}</p>{actionLabel ? <button type="button" className={`mt-4 text-sm font-semibold ${royalTheme.accent} ${royalTheme.focus}`}>{actionLabel}</button> : null}</div>;
}