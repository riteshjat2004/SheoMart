import { CheckCircle2, Store, Truck } from "lucide-react";

interface FulfillmentSelectorProps {
  value: "pickup" | "delivery";
  onChange: (value: "pickup" | "delivery") => void;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  deliveryFee: number;
  freeDeliveryAbove: number;
  preparationTimeMinutes: number;
  subtotal: number;
}

export function FulfillmentSelector({ value, onChange, pickupEnabled, deliveryEnabled, deliveryFee, freeDeliveryAbove, preparationTimeMinutes, subtotal }: FulfillmentSelectorProps) {
  const options = [
    pickupEnabled ? { id: "pickup" as const, icon: Store, title: "Pickup", text: "Collect from Store", detail: `Ready in ${preparationTimeMinutes} minutes`, fee: "No delivery fee" } : null,
    deliveryEnabled ? { id: "delivery" as const, icon: Truck, title: "Delivery", text: "Deliver to my address", detail: "Estimated within 1 hour after preparation", fee: freeDeliveryAbove > 0 && subtotal >= freeDeliveryAbove ? "Free delivery" : `Delivery fee ₹${deliveryFee.toLocaleString("en-IN")}` } : null,
  ].filter(Boolean) as Array<{ id: "pickup" | "delivery"; icon: typeof Store; title: string; text: string; detail: string; fee: string }>;

  return <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900" aria-labelledby="fulfillment-heading"><h2 id="fulfillment-heading" className="text-lg font-semibold">Choose Fulfillment Method</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{options.map(({ id, icon: Icon, title, text, detail, fee }) => <button key={id} type="button" onClick={() => onChange(id)} aria-pressed={value === id} className={`rounded-xl border p-4 text-left transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${value === id ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-500/10" : "border-stone-200 dark:border-stone-800"}`}><div className="flex items-center justify-between gap-3"><span className="flex items-center gap-3 font-semibold"><Icon className="h-5 w-5 text-emerald-600" />{title}</span>{value === id ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : null}</div><p className="mt-3 text-sm text-stone-700 dark:text-stone-200">{text}</p><p className="mt-1 text-xs text-stone-500">{detail}</p><p className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">{fee}</p></button>)}</div></section>;
}
