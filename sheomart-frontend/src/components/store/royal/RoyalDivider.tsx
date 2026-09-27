import { Crown } from "lucide-react";

export function RoyalDivider() {
  return (
    <div className="flex items-center gap-3 py-3" aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-400/50 bg-stone-950 shadow-[0_0_12px_rgba(212,175,55,0.3)]">
        <Crown className="h-3.5 w-3.5 fill-amber-400/30 text-amber-400" />
      </div>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
    </div>
  );
}
