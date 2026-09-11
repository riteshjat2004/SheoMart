export function PaymentStatusCard({ method }: { method: "ONLINE" | "PAY_AT_PICKUP" | "PAY_AT_DELIVERY" }) {
  const online = method === "ONLINE";
  return <div className="rounded-xl bg-stone-50 p-4 text-sm dark:bg-stone-950/60"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">Payment status preview</p><p className="mt-2 font-semibold">{online ? "Pending Payment" : method === "PAY_AT_PICKUP" ? "Pay on Pickup" : "Pay on Delivery"}</p></div>;
}
