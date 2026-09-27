import { Crown, Sparkles } from "lucide-react";
import { royalTheme } from "./royalTheme";

export function RoyalEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-dashed border-amber-400/40 bg-gradient-to-b from-stone-950 via-zinc-950 to-stone-900 p-8 text-center shadow-lg shadow-black/50"
      role="status"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/50 bg-amber-500/10 text-amber-300 shadow-[0_0_20px_rgba(212,175,55,0.25)]">
        <Crown className="h-7 w-7 fill-amber-400/30 text-amber-400" />
      </div>

      <h3 className="mt-4 text-lg font-bold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-stone-300">{description}</p>

      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-5 py-2.5 text-xs font-bold text-stone-950 shadow-md shadow-amber-500/25 transition-transform hover:scale-105 active:scale-95"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}