import { CheckCircle2, CreditCard, Landmark, Smartphone, WalletCards } from "lucide-react";

type PaymentOption = "online" | "cash" | "upi" | "credit";

export function PaymentMethodCard({ value, onChange, isPlusCustomer, membershipFailed }: { value: PaymentOption; onChange: (value: PaymentOption) => void; isPlusCustomer: boolean; membershipFailed: boolean }) {
  const options = [
    { id: "online" as const, label: "Online Payment", icon: CreditCard, helper: "Pay securely online.", disabled: isPlusCustomer },
    { id: "cash" as const, label: "Cash at Shop", icon: WalletCards, helper: "Pay when you collect your order.", disabled: !isPlusCustomer },
    { id: "upi" as const, label: "UPI at Shop", icon: Smartphone, helper: "Pay by UPI at the store.", disabled: !isPlusCustomer },
    { id: "credit" as const, label: "Credit", icon: Landmark, helper: "Use your approved store credit.", disabled: !isPlusCustomer },
  ];
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Payment Method</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {options.map((option) => { const Icon = option.icon; return <button key={option.id} type="button" disabled={option.disabled} onClick={() => onChange(option.id)} className={`rounded-xl border p-4 text-left ${option.disabled ? "cursor-not-allowed border-stone-200 bg-stone-50 opacity-70 dark:border-stone-800 dark:bg-stone-950/60" : value === option.id ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-500/10" : "border-stone-200 dark:border-stone-800"}`}><div className="flex items-center justify-between gap-3"><span className="flex items-center gap-3 font-semibold"><Icon className="h-5 w-5 text-emerald-600" />{option.label}</span>{value === option.id ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : null}</div><p className="mt-3 text-sm text-stone-600 dark:text-stone-300">{option.helper}</p>{option.disabled ? <span className="mt-3 inline-flex rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">PLUS MEMBERS ONLY</span> : null}</button>; })}
      </div>
      {isPlusCustomer ? <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">PLUS benefits are active for this store.</div> : membershipFailed ? <p className="mt-4 text-xs text-amber-700 dark:text-amber-300">PLUS membership could not be checked. Online Payment is enabled.</p> : null}
    </section>
  );
}