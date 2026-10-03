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
}: PaymentSummaryCardProps) {
  const isPaid = (paymentStatus ?? "").toUpperCase() === "PAID";
  const isDelivery = fulfillmentType === "delivery";

  const displayStatus = isPaid
    ? `Payment Received${paymentReceivedMethod ? ` (${paymentReceivedMethod})` : ""}`
    : isDelivery
    ? "Pending (Pay on Delivery via Cash/UPI)"
    : "Pending (Pay at Shop on Pickup)";

  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">
        Payment Summary
      </h2>
      <div className="mt-5 space-y-3 text-sm text-stone-600 dark:text-stone-300">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString("en-IN")}</span>
        </div>
        {discount > 0 ? (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>Discount</span>
            <span>-₹{discount.toLocaleString("en-IN")}</span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span>Delivery Charge</span>
          <span>{deliveryCharge > 0 ? `₹${deliveryCharge.toLocaleString("en-IN")}` : "FREE"}</span>
        </div>
        {platformFee > 0 ? (
          <div className="flex justify-between">
            <span>Platform Fee</span>
            <span>₹{platformFee.toLocaleString("en-IN")}</span>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-stone-200 pt-3 font-semibold text-stone-900 dark:border-stone-800 dark:text-stone-50">
          <span>Grand Total</span>
          <span>₹{grandTotal.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between">
          <span>Amount Paid</span>
          <span className="font-semibold text-stone-800 dark:text-stone-200">
            ₹{(isPaid ? (amountPaid || grandTotal) : amountPaid).toLocaleString("en-IN")}
          </span>
        </div>
        {!isPaid ? (
          <div className="flex justify-between text-amber-700 dark:text-amber-400 font-semibold">
            <span>Remaining Amount</span>
            <span>₹{(remainingAmount || grandTotal).toLocaleString("en-IN")}</span>
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
