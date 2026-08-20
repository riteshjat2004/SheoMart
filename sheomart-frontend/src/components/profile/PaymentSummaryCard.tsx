interface PaymentSummaryCardProps {
  subtotal?: string;
  discount?: string;
  grandTotal?: string;
  amountPaid?: string;
  remainingAmount?: string;
  paymentMethod?: string;
  paymentStatus?: string;
}

export function PaymentSummaryCard({
  subtotal = "₹0",
  discount = "₹0",
  grandTotal = "₹0",
  amountPaid = "₹0",
  remainingAmount = "₹0",
  paymentMethod = "Cash at Shop",
  paymentStatus = "Pending (Pay at Shop)",
}: PaymentSummaryCardProps) {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Payment Summary</h2>
      <div className="mt-5 space-y-3 text-sm text-stone-600 dark:text-stone-300">
        <div className="flex justify-between"><span>Subtotal</span><span>{subtotal}</span></div>
        <div className="flex justify-between"><span>Discount</span><span>{discount}</span></div>
        <div className="flex justify-between border-t border-stone-200 pt-3 font-semibold text-stone-900 dark:border-stone-800 dark:text-stone-50"><span>Grand Total</span><span>{grandTotal}</span></div>
        <div className="flex justify-between"><span>Amount Paid</span><span>{amountPaid}</span></div>
        <div className="flex justify-between"><span>Remaining Amount</span><span>{remainingAmount}</span></div>
      </div>
      <div className="mt-5 space-y-3 rounded-[1.25rem] bg-stone-50 p-4 text-sm dark:bg-stone-950/60">
        <div className="flex justify-between gap-4"><span className="text-stone-500 dark:text-stone-400">Payment Method</span><span className="font-medium text-stone-900 dark:text-stone-50">{paymentMethod}</span></div>
        <div className="flex justify-between gap-4"><span className="text-stone-500 dark:text-stone-400">Payment Status</span><span className="font-medium text-amber-700 dark:text-amber-300">{paymentStatus}</span></div>
      </div>
    </section>
  );
}
