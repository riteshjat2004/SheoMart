import { MapPin } from "lucide-react";

export function PickupSummary({ store, preparationTimeMinutes }: { store: { address?: string; city?: string; state?: string; pincode?: string } | null; preparationTimeMinutes: number }) {
  const address = [store?.address, store?.city, store?.state, store?.pincode].filter(Boolean).join(", ");
  return <div className="rounded-xl bg-stone-50 p-4 dark:bg-stone-950/60"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">Pickup details</p><p className="mt-2 flex items-center gap-2 text-sm font-medium"><MapPin className="h-4 w-4 text-emerald-600" />{address || "Store address unavailable"}</p><p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Ready in {preparationTimeMinutes} minutes. No delivery fee.</p></div>;
}
