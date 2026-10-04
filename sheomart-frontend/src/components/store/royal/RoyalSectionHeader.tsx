import { Crown } from "lucide-react";
import { royalTheme } from "./royalTheme";

export function RoyalSectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${royalTheme.accent}`}>
        <Crown className="h-3.5 w-3.5 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
        Royal Selection
      </p>
      <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">{title}</h2>
      <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{subtitle}</p>
      <div className="mt-3 h-0.5 w-20 bg-gradient-to-r from-amber-500 to-transparent dark:from-amber-400" />
    </div>
  );
}
