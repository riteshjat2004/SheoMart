export function PaymentValidationNotice({ isPlusCustomer, method }: { isPlusCustomer: boolean; method: "ONLINE" | "PAY_AT_PICKUP" | "PAY_AT_DELIVERY" }) {
  if (isPlusCustomer || method === "ONLINE") return null;
  return <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">Online payment is required for non-Plus customers.</div>;
}
