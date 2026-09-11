import { MapPin } from "lucide-react";

export function DeliverySummary({ address, fee, isFree, estimatedMinutes }: { address: string; fee: number; isFree: boolean; estimatedMinutes: number }) {
  return <div className="rounded-xl bg-stone-50 p-4 dark:bg-stone-950/60"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">Delivery details</p><p className="mt-2 flex items-center gap-2 text-sm font-medium"><MapPin className="h-4 w-4 text-emerald-600" />{address || "Select a delivery address"}</p><p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{isFree ? "Free delivery" : `Delivery fee ₹${fee.toLocaleString("en-IN")}`} · Estimated in {estimatedMinutes} minutes</p></div>;
}
