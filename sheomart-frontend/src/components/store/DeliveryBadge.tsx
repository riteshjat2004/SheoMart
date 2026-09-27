import { Truck, Zap } from "lucide-react";
import type { StoreBadge } from "@/types/marketplace";

export type DeliveryBadgeProps = {
  deliveryEnabled: boolean;
  variant: StoreBadge;
  compact?: boolean;
};

const badgeStyles: Record<StoreBadge, string> = {
  normal: "border-stone-200/90 bg-emerald-50/80 text-emerald-800 dark:border-stone-700 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-xs",
  verified: "border-emerald-300/70 bg-gradient-to-r from-emerald-500/20 to-teal-400/15 text-emerald-700 shadow-[0_0_16px_rgba(16,185,129,0.25)] dark:border-emerald-700/70 dark:from-emerald-950/70 dark:to-teal-950/50 dark:text-emerald-300",
  royal: "border-amber-400/60 bg-gradient-to-r from-amber-500/20 via-yellow-400/25 to-amber-500/20 text-amber-900 shadow-[0_0_14px_rgba(212,175,55,0.25)] dark:border-amber-400/50 dark:from-amber-950/70 dark:via-yellow-950/50 dark:to-amber-950/70 dark:text-amber-200",
};

export function DeliveryBadge({ deliveryEnabled, variant, compact = false }: DeliveryBadgeProps) {
  if (!deliveryEnabled) return null;

  const Icon = variant === "royal" ? Zap : Truck;
  const label = variant === "royal" ? "Royal Express Delivery" : variant === "verified" ? "Delivery Available" : "Local Delivery";


  return (
    <span className={`inline-flex animate-[delivery-badge-in_300ms_ease-out_both] items-center gap-1 rounded-full border font-semibold transition duration-200 hover:-translate-y-0.5 motion-reduce:animate-none motion-reduce:transform-none motion-reduce:transition-none ${compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"} ${badgeStyles[variant]}`}>
      <Icon className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {label}
    </span>
  );
}
