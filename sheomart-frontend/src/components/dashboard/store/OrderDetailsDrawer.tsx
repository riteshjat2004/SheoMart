"use client";

import { useState } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Package,
  Calendar,
  Clock,
  Printer,
  FileText,
  Tag,
  CheckCircle2,
  AlertCircle,
  Truck,
  Store,
  ChevronRight,
  Save,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { StoreOrder } from "@/types/store-order";
import { updateSellerNotes } from "@/services/store-orders";

interface OrderDetailsDrawerProps {
  order: StoreOrder | null;
  onClose: () => void;
  onStatusAction?: (order: StoreOrder, nextStatus: string) => void;
  onCancelAction?: (order: StoreOrder) => void;
  isUpdatingStatus?: boolean;
}

const statusLabels: Record<string, string> = {
  ORDER_PLACED: "Order Placed",
  ACCEPTED: "Accepted",
  PREPARING: "Preparing / Packing",
  READY_FOR_PICKUP: "Ready for Pickup",
  READY_FOR_DISPATCH: "Ready for Dispatch",
  OUT_FOR_DELIVERY: "Out for Delivery",
  PICKED_UP: "Picked Up",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const formatCurrency = (val?: number) => `₹${(val ?? 0).toLocaleString("en-IN")}`;
const formatDateTime = (val?: string) =>
  val ? new Date(val).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

export function OrderDetailsDrawer({
  order,
  onClose,
  onStatusAction,
  onCancelAction,
  isUpdatingStatus = false,
}: OrderDetailsDrawerProps) {
  if (!order) return null;

  const currentStatus =
    (order as StoreOrder & { pickupStatus?: string }).pickupStatus ??
    order.orderStatus ??
    order.status ??
    "ORDER_PLACED";

  const isDelivery =
    order.fulfillmentType === "delivery" || order.deliveryMethod === "delivery";
  const isPickup = !isDelivery;

  const [sellerNotes, setSellerNotes] = useState(order.sellerNotes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = useState(false);

  const handleSaveNotes = async () => {
    try {
      setIsSavingNotes(true);
      await updateSellerNotes(order.orderId, sellerNotes);
      setNotesSavedSuccess(true);
      setTimeout(() => setNotesSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save seller notes:", err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  // Next status determination
  let nextAction: { label: string; status: string } | null = null;
  if (currentStatus === "ORDER_PLACED") {
    nextAction = { label: "Accept Order", status: "ACCEPTED" };
  } else if (currentStatus === "ACCEPTED") {
    nextAction = { label: "Start Packing (Preparing)", status: "PREPARING" };
  } else if (currentStatus === "PREPARING") {
    nextAction = isPickup
      ? { label: "Mark Ready for Pickup", status: "READY_FOR_PICKUP" }
      : { label: "Mark Ready for Dispatch", status: "READY_FOR_DISPATCH" };
  } else if (currentStatus === "READY_FOR_DISPATCH") {
    nextAction = { label: "Mark Out for Delivery", status: "OUT_FOR_DELIVERY" };
  } else if (currentStatus === "OUT_FOR_DELIVERY") {
    nextAction = { label: "Confirm Delivered", status: "DELIVERED" };
  } else if (currentStatus === "READY_FOR_PICKUP") {
    nextAction = { label: "Confirm Picked Up", status: "PICKED_UP" };
  }

  const canCancel =
    currentStatus === "ORDER_PLACED" ||
    currentStatus === "ACCEPTED" ||
    currentStatus === "PREPARING";

  // Build timeline events
  const timelineEvents = [
    { label: "Order Placed", date: order.createdAt, done: true },
    { label: "Accepted", date: order.acceptedAt, done: Boolean(order.acceptedAt) },
    { label: "Preparing / Packing", date: order.preparingAt, done: Boolean(order.preparingAt) },
    {
      label: isPickup ? "Ready for Pickup" : "Ready for Dispatch",
      date: isPickup ? order.readyForPickupAt : order.readyForDispatchAt,
      done: Boolean(isPickup ? order.readyForPickupAt : order.readyForDispatchAt),
    },
    ...(isDelivery
      ? [
          {
            label: "Out for Delivery",
            date: order.outForDeliveryAt,
            done: Boolean(order.outForDeliveryAt),
          },
        ]
      : []),
    {
      label: isPickup ? "Picked Up" : "Delivered",
      date: isPickup ? order.pickedUpAt : order.deliveredAt,
      done: Boolean(isPickup ? order.pickedUpAt : order.deliveredAt),
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close drawer"
        className="fixed inset-0 z-40 bg-stone-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-2xl flex-col border-l border-stone-200 bg-white shadow-2xl transition-transform dark:border-stone-800 dark:bg-stone-950"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 p-5 dark:border-stone-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-50">
                  Order #{order.orderId.slice(-8).toUpperCase()}
                </h2>
                <span className="font-mono text-xs text-stone-400">({order.orderId})</span>
              </div>
              <p className="text-xs text-stone-500">
                Placed on {formatDateTime(order.createdAt)} • Invoice:{" "}
                {order.invoiceNumber || "Pending"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintSlip}
              className="rounded-xl text-xs"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5 text-stone-500" />
              Print Slip
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close"
              className="h-8 w-8 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Status & Fulfillment Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-stone-50/70 p-4 dark:border-stone-800/80 dark:bg-stone-900/40">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500">Status:</span>
              <StatusBadge status={statusLabels[currentStatus] || currentStatus} />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500">Fulfillment:</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
                {isDelivery ? (
                  <>
                    <Truck className="h-3.5 w-3.5 text-emerald-600" />
                    Delivery
                  </>
                ) : (
                  <>
                    <Store className="h-3.5 w-3.5 text-blue-600" />
                    Pickup Order
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500">Payment:</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  order.paymentStatus === "PAID"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                }`}
              >
                {order.paymentStatus || "PENDING"} ({order.paymentMethod || "COD"})
              </span>
            </div>
          </div>

          {/* Customer & Address Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Customer Box */}
            <div className="space-y-3 rounded-2xl border border-stone-200/70 p-4 dark:border-stone-800/70">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
                <User className="h-3.5 w-3.5" />
                <span>Customer Information</span>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-stone-900 dark:text-stone-100">
                    {order.customerName || order.customer?.name || "Customer"}
                  </p>
                  {order.isPlusCustomer || order.customer?.isPlus ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                      <ShieldCheck className="h-3 w-3" />
                      Plus Member
                    </span>
                  ) : null}
                </div>
                <p className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300">
                  <Phone className="h-3.5 w-3.5 text-stone-400" />
                  {order.customerMobile || order.customerPhone || order.customer?.mobile || "—"}
                </p>
                {order.customerEmail || order.customer?.email ? (
                  <p className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300">
                    <Mail className="h-3.5 w-3.5 text-stone-400" />
                    {order.customerEmail || order.customer?.email}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Address Box */}
            <div className="space-y-3 rounded-2xl border border-stone-200/70 p-4 dark:border-stone-800/70">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
                <MapPin className="h-3.5 w-3.5" />
                <span>{isDelivery ? "Delivery Address" : "Pickup Location"}</span>
              </div>
              <div className="space-y-1 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {isDelivery ? (
                  order.shippingAddress ? (
                    <>
                      <p className="font-semibold text-stone-900 dark:text-stone-100">
                        {order.shippingAddress.fullName || order.customerName}
                      </p>
                      <p>
                        {[order.shippingAddress.house, order.shippingAddress.street]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      {order.shippingAddress.landmark ? (
                        <p className="text-stone-400">Near {order.shippingAddress.landmark}</p>
                      ) : null}
                      <p>
                        {[
                          order.shippingAddress.city,
                          order.shippingAddress.state,
                          order.shippingAddress.pincode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      {order.deliverySlotLabel ? (
                        <div className="mt-2 rounded-lg bg-stone-100 p-2 font-mono text-[11px] text-stone-700 dark:bg-stone-900 dark:text-stone-300">
                          Slot: {order.deliverySlotLabel}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-stone-400">Address details not recorded.</p>
                  )
                ) : (
                  <>
                    <p className="font-semibold text-stone-900 dark:text-stone-100">
                      Store Pickup: {order.storeName || "My Store"}
                    </p>
                    <p>{order.pickupAddress || "Address on store profile"}</p>
                    <p className="text-stone-400">Hours: {order.pickupHours || "10:00 AM - 8:00 PM"}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Ordered Items List */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Ordered Items ({(order.orderItems ?? []).length})
            </h3>
            <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200/80 bg-white dark:divide-stone-800/80 dark:border-stone-800/80 dark:bg-stone-950">
              {(order.orderItems ?? []).map((item, idx) => (
                <div key={item.orderItemId || idx} className="flex items-center justify-between p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900">
                      {item.productImage || item.image ? (
                        <img
                          src={item.productImage || item.image}
                          alt={item.name || item.productName}
                          className="h-full w-full rounded-xl object-cover"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-stone-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {item.name || item.productName || "Product"}
                      </p>
                      <p className="text-xs text-stone-400">
                        SKU: {item.sku || "—"} • Qty: {item.quantity} ×{" "}
                        {formatCurrency(item.discountPrice || item.price)}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-stone-900 dark:text-stone-50">
                    {formatCurrency((item.discountPrice || item.price || 0) * (item.quantity || 1))}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Breakdown Card */}
          <div className="space-y-2 rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4 dark:border-stone-800/80 dark:bg-stone-900/30">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Financial Summary
            </h3>
            <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>

              {(order.discount ?? 0) > 0 ? (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Product Savings:</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              ) : null}

              {(order.couponDiscount ?? 0) > 0 ? (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Coupon Discount ({order.couponCode || "COUPON"}):</span>
                  <span>-{formatCurrency(order.couponDiscount)}</span>
                </div>
              ) : null}

              <div className="flex justify-between">
                <span>Delivery Charges:</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  {order.freeDeliveryApplied ? (
                    <span className="text-emerald-600">FREE</span>
                  ) : (
                    formatCurrency(order.deliveryFeeCharged ?? order.deliveryCharge ?? 0)
                  )}
                </span>
              </div>

              {(order.platformFee ?? 0) > 0 ? (
                <div className="flex justify-between">
                  <span>Platform Fee:</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {formatCurrency(order.platformFee)}
                  </span>
                </div>
              ) : null}

              <div className="my-2 border-t border-stone-200/70 pt-2 dark:border-stone-800/70" />

              <div className="flex items-baseline justify-between text-sm font-bold text-stone-900 dark:text-stone-50">
                <span>Grand Total:</span>
                <span className="text-base text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(order.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Stepped Order Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Order Timeline & Milestones
            </h3>
            <div className="space-y-3 rounded-2xl border border-stone-200/80 bg-white p-4 dark:border-stone-800/80 dark:bg-stone-950">
              {currentStatus === "CANCELLED" ? (
                <div className="flex items-center gap-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-bold">Order Cancelled</p>
                    <p>Cancelled at: {formatDateTime(order.cancelledAt || order.updatedBySellerAt)}</p>
                  </div>
                </div>
              ) : null}

              <div className="space-y-3">
                {timelineEvents.map((evt, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        evt.done
                          ? "bg-emerald-600 text-white"
                          : "border border-stone-300 text-stone-400 dark:border-stone-700"
                      }`}
                    >
                      {evt.done ? "✓" : idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-semibold ${
                          evt.done
                            ? "text-stone-900 dark:text-stone-100"
                            : "text-stone-400 dark:text-stone-500"
                        }`}
                      >
                        {evt.label}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        {evt.done && evt.date ? formatDateTime(evt.date) : "Pending"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notes: Customer Instructions & Internal Seller Notes */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Notes & Communications
            </h3>

            {/* Customer Instruction */}
            {order.orderNotes || order.notes ? (
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-3.5 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <MessageSquare className="h-3.5 w-3.5 text-amber-600" />
                  Customer Instructions
                </p>
                <p>{order.orderNotes || order.notes}</p>
              </div>
            ) : null}

            {/* Internal Seller Notes with Live Save */}
            <div className="space-y-2 rounded-2xl border border-stone-200/80 p-3.5 dark:border-stone-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Internal Seller Notes (Private)
                </span>
                {notesSavedSuccess ? (
                  <span className="text-[11px] font-semibold text-emerald-600">Saved!</span>
                ) : null}
              </div>
              <textarea
                value={sellerNotes}
                onChange={(e) => setSellerNotes(e.target.value)}
                placeholder="Add private notes for staff (packaging, delivery rider notes, customer requests)..."
                rows={2}
                className="w-full rounded-xl border border-stone-200 bg-white p-2.5 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="h-7 text-xs rounded-lg"
                >
                  <Save className="mr-1 h-3 w-3" />
                  {isSavingNotes ? "Saving..." : "Save Note"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-stone-200/80 p-4 dark:border-stone-800/80">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Close
          </Button>

          <div className="flex items-center gap-2">
            {canCancel && onCancelAction ? (
              <Button
                variant="outline"
                className="border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/40 rounded-xl"
                onClick={() => onCancelAction(order)}
                disabled={isUpdatingStatus}
              >
                Reject / Cancel
              </Button>
            ) : null}

            {nextAction && onStatusAction ? (
              <Button
                className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => onStatusAction(order, nextAction!.status)}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? "Updating..." : nextAction.label}
              </Button>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
}
