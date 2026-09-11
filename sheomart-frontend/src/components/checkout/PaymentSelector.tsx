import { CheckCircle2, CreditCard, Truck, WalletCards } from "lucide-react";

export type CheckoutPaymentMethod = "ONLINE" | "PAY_AT_PICKUP" | "PAY_AT_DELIVERY";

export function PaymentSelector({ value, onChange, isPlusCustomer, fulfillmentType }: { value: CheckoutPaymentMethod; onChange: (value: CheckoutPaymentMethod) => void; isPlusCustomer: boolean; fulfillmentType: "pickup" | "delivery" }) {
  const options = [
    { id: "ONLINE" as const, title: "Pay Online", description: "UPI / Card / Wallet", helper: "Instant confirmation.", icon: CreditCard, visible: true },
    { id: "PAY_AT_PICKUP" as const, title: "Pay During Pickup", description: "Pay when you collect your order.", helper: "Available to Plus members.", icon: WalletCards, visible: isPlusCustomer && fulfillmentType === "pickup" },
    { id: "PAY_AT_DELIVERY" as const, title: "Pay During Delivery", description: "Pay when your order arrives.", helper: "Available to Plus members.", icon: Truck, visible: isPlusCustomer && fulfillmentType === "delivery" },
  ];
  return <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900" aria-labelledby="payment-heading"><h2 id="payment-heading" className="text-lg font-semibold">Choose Payment Method</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{options.filter((option) => option.visible).map((option) => { const Icon = option.icon; return <button key={option.id} type="button" onClick={() => onChange(option.id)} aria-pressed={value === option.id} className={`rounded-xl border p-4 text-left transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${value === option.id ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-500/10" : "border-stone-200 dark:border-stone-800"}`}><div className="flex items-center justify-between gap-3"><span className="flex items-center gap-3 font-semibold"><Icon className="h-5 w-5 text-emerald-600" />{option.title}</span>{value === option.id ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : null}</div><p className="mt-3 text-sm text-stone-700 dark:text-stone-200">{option.description}</p><p className="mt-1 text-xs text-stone-500">{option.helper}</p></button>; })}</div></section>;
}
