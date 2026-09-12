import { Truck, Zap } from "lucide-react";
import type { StoreBadge } from "@/types/marketplace";

export function StoreDeliveryInfo({ deliveryEnabled, variant, eta, city }: { deliveryEnabled: boolean; variant: StoreBadge; eta?: string; city?: string }) {
  if (!deliveryEnabled) return null;

  const isRoyal = variant === "royal";
  const Icon = isRoyal ? Zap : Truck;
  const label = isRoyal ? "Same-Day Delivery Available" : `Delivery Available${city ? ` in ${city}` : ""}`;

  return (
    <div className={`mt-2 ${isRoyal ? "text-amber-100" : "text-emerald-100"}`}>
      <p className="flex items-center gap-1.5 text-sm font-medium"><Icon className="h-4 w-4 shrink-0" />{label}</p>
      {eta ? <p className="mt-1 pl-5.5 text-xs text-white/65">Delivery ETA: {eta}</p> : null}
    </div>
  );
}
