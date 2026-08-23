import { CheckCircle2, Store, Truck } from "lucide-react";

interface DeliveryMethodCardProps {
  value: "pickup" | "delivery";
  onChange: (value: "pickup" | "delivery") => void;
}

export function DeliveryMethodCard({ value, onChange }: DeliveryMethodCardProps) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Delivery Method</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => onChange("pickup")} className={`rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${value === "pickup" ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-500/10" : "border-stone-200 dark:border-stone-800"}`}>
          <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-3 font-semibold"><Store className="h-5 w-5 text-emerald-600" />Pickup</span>{value === "pickup" ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : null}</div>
          <p className="mt-3 text-sm text-stone-600 dark:text-stone-300">Collect your order from the store.</p>
        </button>
        <button type="button" onClick={() => onChange("delivery")} className={`rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${value === "delivery" ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-500/10" : "border-stone-200 dark:border-stone-800"}`}>
          <span className="flex items-center gap-3 font-semibold text-stone-700 dark:text-stone-200"><Truck className="h-5 w-5 text-stone-500" />Delivery</span>
          <p className="mt-3 text-sm text-stone-600 dark:text-stone-300">Have your order delivered to your selected address.</p>
        </button>
      </div>
    </section>
  );
}