import { Crown, ShieldCheck } from "lucide-react";

export type StoreBadgeProps = {
  type: "verified" | "royal";
};

export function StoreBadge({ type }: StoreBadgeProps) {
  if (type === "verified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300">
        <ShieldCheck className="h-3 w-3" />
        Verified
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300">
      <Crown className="h-3 w-3" />
      Royal
    </span>
  );
}
