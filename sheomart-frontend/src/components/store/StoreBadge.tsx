import { Crown, ShieldCheck, Sparkles, Store } from "lucide-react";

export type StoreBadgeProps = {
  type: "normal" | "verified" | "royal";
  size?: "sm" | "md";
};

export function StoreBadge({ type, size = "sm" }: StoreBadgeProps) {
  const isMd = size === "md";

  if (type === "normal") {
    return (
      <span
        title="Local Neighborhood Merchant on SheoMart"
        className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-200/90 bg-emerald-50/80 font-medium tracking-wide text-emerald-800 shadow-xs transition-colors dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300 ${
          isMd ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[10.5px]"
        }`}
      >
        <Store className={`${isMd ? "h-3.5 w-3.5" : "h-3 w-3"} text-emerald-600 dark:text-emerald-400 shrink-0`} />
        <span>Local Store</span>
      </span>
    );
  }

  if (type === "verified") {
    return (
      <span
        title="Verified by SheoMart — Authenticity & Quality Guaranteed"
        className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 font-bold tracking-wide text-emerald-800 shadow-sm transition-colors hover:border-emerald-500/60 dark:border-emerald-600/50 dark:bg-emerald-950/60 dark:text-emerald-300 ${
          isMd ? "px-3 py-1 text-xs" : "px-2.5 py-0.5 text-[10.5px]"
        }`}
      >
        <ShieldCheck className={`${isMd ? "h-3.5 w-3.5" : "h-3 w-3"} text-emerald-600 dark:text-emerald-400 shrink-0`} />
        <span>Verified Store</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 font-bold tracking-wide text-amber-900 shadow-[0_0_12px_rgba(212,175,55,0.25)] dark:border-amber-400/50 dark:from-amber-950/70 dark:via-yellow-950/50 dark:to-amber-950/70 dark:text-amber-200 ${
        isMd ? "px-3 py-1 text-xs" : "px-2.5 py-0.5 text-[10px]"
      }`}
    >
      <Crown className="h-3 w-3 text-amber-600 dark:text-amber-300 fill-amber-500/30" />
      <span>Royal Store</span>
      <Sparkles className="h-2.5 w-2.5 text-amber-500 dark:text-amber-300" />
    </span>
  );
}
