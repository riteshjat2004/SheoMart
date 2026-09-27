import { Truck, Zap } from "lucide-react";
import type { StoreBadge } from "@/types/marketplace";

export function DeliveryRibbon({ deliveryEnabled, variant }: { deliveryEnabled: boolean; variant: StoreBadge }) {
  if (!deliveryEnabled || variant === "normal") return null;

  const isRoyal = variant === "royal";
  const Icon = isRoyal ? Zap : Truck;

  return (
    <span className={`absolute right-0 top-0 inline-flex animate-[delivery-badge-in_300ms_ease-out_both] items-center gap-1 rounded-bl-xl px-2.5 py-1 text-[9px] font-bold tracking-[0.1em] shadow-sm motion-reduce:animate-none ${isRoyal ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-stone-950 shadow-amber-500/30" : "bg-emerald-300/90 text-emerald-950 shadow-emerald-300/20"}`}>
      <Icon className="h-3 w-3" />
      {isRoyal ? "ROYAL DISPATCH" : "DELIVERS"}
    </span>
  );
}
