interface PaymentSummaryCardProps {
  subtotal?: number;
  discount?: number;
  deliveryCharge?: number;
  platformFee?: number;
  grandTotal?: number;
  amountPaid?: number;
  remainingAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  fulfillmentType?: string;
  paidAt?: string;
  paymentReceivedMethod?: string;
  couponCode?: string;
  couponDiscount?: number;
  festivalDiscount?: number;
}

export function PaymentSummaryCard({
  subtotal = 0,
  discount = 0,
  deliveryCharge = 0,
  platformFee = 0,
  grandTotal = 0,
  amountPaid = 0,
  remainingAmount = 0,
  paymentMethod = "Cash on Handover",
  paymentStatus = "PENDING",
  fulfillmentType = "pickup",
  paidAt,
  paymentReceivedMethod,
  couponCode,
  couponDiscount = 0,
  festivalDiscount = 0,
}: PaymentSummaryCardProps) {
  const isPaid = (paymentStatus ?? "").toUpperCase() === "PAID";
  const isDelivery = fulfillmentType === "delivery";
  const totalSavings = (discount || 0) + (festivalDiscount || 0) + (couponDiscount || 0);

  const displayStatus = isPaid
    ? `Payment Received${paymentReceivedMethod ? ` (${paymentReceivedMethod})` : ""}`
    : isDelivery
    ? "Pending (Pay on Delivery via Cash/UPI)"
    : "Pending (Pay at Shop on Pickup)";

  return (
    <section className="print-avoid-break rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 print:border print:p-4 print:shadow-none">
      <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600 print:text-xs print:font-bold print:text-black">
        Payment Summary
      </h2>
      <div className="mt-5 space-y-3 text-sm text-stone-600 dark:text-stone-300 print:mt-3 print:space-y-1.5 print:text-xs print:text-black">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{(discount > 0 ? (subtotal + discount) : subtotal).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
        </div>
        {discount > 0 ? (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 print:text-black">
            <span>Product Savings</span>
            <span>-₹{discount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
          </div>
        ) : null}
        {festivalDiscount > 0 ? (
          <div className="flex justify-between text-amber-600 dark:text-amber-400 print:text-black">
            <span>Festival Savings</span>
            <span>-₹{festivalDiscount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
          </div>
        ) : null}
        {couponDiscount > 0 ? (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 print:text-black">
            <span>Coupon Savings {couponCode ? `(${couponCode})` : ""}</span>
            <span>-₹{couponDiscount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span>Delivery Charge</span>
          <span>{deliveryCharge > 0 ? `₹${deliveryCharge.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : "FREE"}</span>
        </div>
        {platformFee > 0 ? (
          <div className="flex justify-between">
            <span>Platform Fee</span>
            <span>₹{platformFee.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-stone-200 pt-3 font-semibold text-stone-900 dark:border-stone-800 dark:text-stone-50 print:border-black print:pt-1.5 print:text-black">
          <span>Grand Total</span>
          <span>₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
        </div>
        {totalSavings > 0 ? (
          <div className="rounded-xl bg-emerald-50 py-1.5 px-3 text-center text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 print:hidden">
            🎉 Total savings on this order: ₹{totalSavings.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
        ) : null}
        <div className="flex justify-between">
          <span>Amount Paid</span>
          <span className="font-semibold text-stone-800 dark:text-stone-200 print:text-black">
            ₹{(isPaid ? (amountPaid || grandTotal) : amountPaid).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </span>
        </div>
        {!isPaid ? (
          <div className="flex justify-between text-amber-700 dark:text-amber-400 font-semibold print:text-black">
            <span>Remaining Amount</span>
            <span>₹{(remainingAmount || grandTotal).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-5 space-y-3 rounded-[1.25rem] bg-stone-50 p-4 text-sm dark:bg-stone-950/60">
        <div className="flex justify-between gap-4">
          <span className="text-stone-500 dark:text-stone-400">Payment Method</span>
          <span className="font-medium text-stone-900 dark:text-stone-50">
            {paymentMethod || "Pay on Handover"}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-stone-500 dark:text-stone-400">Payment Status</span>
          <span
            className={`font-semibold ${
              isPaid
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-amber-700 dark:text-amber-300"
            }`}
          >
            {displayStatus}
          </span>
        </div>
        {isPaid && paidAt ? (
          <div className="flex justify-between gap-4 text-xs text-stone-400">
            <span>Received At</span>
            <span>
              {new Date(paidAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
