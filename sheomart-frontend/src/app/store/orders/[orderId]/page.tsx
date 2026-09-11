"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { CustomerInfoCard } from "@/components/dashboard/store/CustomerInfoCard";
import { OrderItemsCard } from "@/components/dashboard/store/OrderItemsCard";
import { PickupDetailsCard } from "@/components/dashboard/store/PickupDetailsCard";
import { OrderActivityCard } from "@/components/dashboard/store/OrderActivityCard";
import { OrderTimelineCard } from "@/components/dashboard/store/OrderTimelineCard";
import { OrderActionsCard } from "@/components/dashboard/store/OrderActionsCard";
import { DeliveryManagementCard } from "@/components/dashboard/store/DeliveryManagementCard";
import { updateDeliveryEta } from "@/services/store-orders";
import { useStoreOrder } from "@/hooks/use-store-order";
import { useCollectPickupPayment } from "@/hooks/use-collect-pickup-payment";
import { useUpdateOrderStatus } from "@/hooks/use-update-order-status";
import type { PickupPaymentMethod } from "@/services/store-orders";

const labels: Record<string, string> = { ORDER_PLACED: "Order Placed", ACCEPTED: "Accepted", PREPARING: "Preparing", READY_FOR_PICKUP: "Ready for Pickup", READY_FOR_DISPATCH: "Ready for Dispatch", OUT_FOR_DELIVERY: "Out for Delivery", PICKED_UP: "Picked Up", DELIVERED: "Delivered", CANCELLED: "Cancelled", DRAFT: "Draft", CONFIRMED: "Confirmed", PROCESSING: "Processing", PACKED: "Packed" };
const money = (value?: number) => `₹${(value ?? 0).toLocaleString("en-IN")}`;
const date = (value?: string) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Not available";
const getPickupStatus = (order: NonNullable<ReturnType<typeof useStoreOrder>["data"]>) => (order as typeof order & { pickupStatus?: string }).pickupStatus ?? order.orderStatus ?? order.status ?? "ORDER_PLACED";

export default function StoreOrderDetailsPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;
  const orderQuery = useStoreOrder(orderId);
  const order = orderQuery.data;
  const [paymentMethod, setPaymentMethod] = useState<PickupPaymentMethod>("CASH");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const collectPaymentMutation = useCollectPickupPayment({
    onSuccess: async () => {
      setIsPaymentDialogOpen(false);
      setToast({ type: "success", message: "Pickup payment collected successfully." });
      await orderQuery.refetch();
    },
    onError: (error) => setToast({ type: "error", message: error instanceof Error ? error.message : "Unable to collect pickup payment." }),
  });
  const updateStatusMutation = useUpdateOrderStatus({
    onSuccess: async () => {
      setToast({ type: "success", message: "Order status updated successfully." });
      await orderQuery.refetch();
    },
    onError: (error) => setToast({ type: "error", message: error instanceof Error ? error.message : "Unable to update order status." }),
  });
  const paymentEligible = Boolean(order && getPickupStatus(order) === "PICKED_UP" && (order.paymentStatus ?? "").toUpperCase() === "PENDING");
  const etaMutation = { isPending: false, mutate: async (value: string) => { try { await updateDeliveryEta(orderId, value); await orderQuery.refetch(); setToast({ type: "success", message: "Delivery ETA updated." }); } catch (error) { setToast({ type: "error", message: error instanceof Error ? error.message : "Unable to update delivery ETA." }); } } };

  return <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
    <Button asChild variant="outline"><Link href="/store/orders"><ArrowLeft className="mr-2 h-4 w-4" />Back to Orders</Link></Button>
    {orderQuery.isLoading ? <LoadingSkeleton rows={7} /> : null}
    {orderQuery.isError ? <div className="space-y-3"><EmptyState title="Unable to load order details" description={orderQuery.error.message} /><Button type="button" variant="outline" onClick={() => orderQuery.refetch()}>Retry</Button></div> : null}
    {!orderQuery.isLoading && !orderQuery.isError && !order ? <EmptyState title="Order not found" description="This order could not be found or is no longer available." /> : null}
    {toast ? <div className={`rounded-lg border px-3 py-2 text-sm ${toast.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{toast.message}</div> : null}
    {order ? <>
      <section className="rounded-xl border border-stone-200 bg-white/80 p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/80">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Seller order details</p><h1 className="mt-2 text-2xl font-semibold text-stone-900 dark:text-stone-50">Order {order.orderId}</h1><p className="mt-2 text-sm text-stone-500">{order.customerName ?? order.customer?.name ?? order.customer?.fullName ?? "Customer"}</p>{order.customerEmail ? <p className="mt-1 text-sm text-stone-500">{order.customerEmail}</p> : null}</div><div className="flex flex-wrap gap-2"><StatusBadge status={labels[getPickupStatus(order)] ?? getPickupStatus(order)} /><span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Payment: {labels[order.paymentStatus ?? ""] ?? order.paymentStatus ?? "Unknown"}</span></div></div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><div><dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Invoice number</dt><dd className="mt-1 font-semibold">{order.invoiceNumber ?? "Pending assignment"}</dd></div><div><dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Customer phone</dt><dd className="mt-1 font-semibold">{order.customerMobile ?? order.customerPhone ?? order.customer?.mobile ?? order.customer?.phone ?? "Not available"}</dd></div><div><dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Store name</dt><dd className="mt-1 font-semibold">{order.storeName ?? order.store?.name ?? order.store?.storeName ?? "Store details unavailable"}</dd></div><div><dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Order date</dt><dd className="mt-1 font-semibold">{date(order.createdAt)}</dd></div><div><dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Grand total</dt><dd className="mt-1 font-semibold">{money(order.grandTotal)}</dd></div></dl>
      </section>
      <OrderItemsCard order={order} />
      <div className="grid gap-6 lg:grid-cols-2"><CustomerInfoCard order={order} /><PickupDetailsCard order={order} /></div>
      {order.fulfillmentType === "delivery" || order.deliveryMethod === "delivery" ? <DashboardCard title="Customer delivery selection" description="The customer's selected delivery slot is fixed for this order."><dl className="grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Delivery slot</dt><dd className="mt-1 font-semibold">{order.deliverySlotLabel ?? order.deliverySlot ?? "Not available"}{order.deliveryWindowStart ? ` (${order.deliveryWindowStart} - ${order.deliveryWindowEnd})` : ""}</dd></div><div><dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Delivery fee collected</dt><dd className="mt-1 font-semibold">₹{(order.deliveryFeeCharged ?? order.deliveryCharge ?? 0).toLocaleString("en-IN")}</dd></div><div><dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Preparation time</dt><dd className="mt-1 font-semibold">{order.preparationTimeMinutes ?? order.store?.preparationTimeMinutes ?? 30} minutes</dd></div><div><dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Delivery address</dt><dd className="mt-1 font-semibold">{[order.shippingAddress?.house, order.shippingAddress?.street, order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.pincode].filter(Boolean).join(", ") || "Not available"}</dd></div></dl></DashboardCard> : null}
      <div className="grid gap-6 lg:grid-cols-2"><OrderTimelineCard order={order} /><OrderActivityCard order={order} /></div>
      <OrderActionsCard status={getPickupStatus(order) as "ORDER_PLACED" | "ACCEPTED" | "PREPARING" | "READY_FOR_PICKUP" | "READY_FOR_DISPATCH" | "OUT_FOR_DELIVERY" | "PICKED_UP" | "DELIVERED" | "CANCELLED"} fulfillmentType={order.fulfillmentType ?? order.deliveryMethod} isPending={updateStatusMutation.isPending} onStatusChange={(status) => updateStatusMutation.mutate({ orderId, status })} />
      {order.fulfillmentType === "delivery" || order.deliveryMethod === "delivery" ? <DeliveryManagementCard estimatedDeliveryAt={order.estimatedDeliveryAt} isPending={etaMutation.isPending} onUpdateEta={(value) => void etaMutation.mutate(value)} /> : null}
      {paymentEligible ? <DashboardCard title="Payment collection" description="Record the payment received for this picked-up order."><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm text-stone-600 dark:text-stone-300">Collect {money(order.grandTotal)} in full.</p><p className="mt-1 text-xs text-stone-500">Payment can only be recorded once.</p></div><Button type="button" onClick={() => setIsPaymentDialogOpen(true)} disabled={collectPaymentMutation.isPending}>{collectPaymentMutation.isPending ? "Updating..." : "Mark Payment Received"}</Button></div></DashboardCard> : null}
      <DashboardCard title="Order summary" description="Payment and additional order information."><dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div><dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Payment method</dt><dd className="mt-1 font-semibold">{order.paymentMethod ?? "Not available"}</dd></div><div><dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Payment status</dt><dd className="mt-1 font-semibold">{labels[order.paymentStatus ?? ""] ?? order.paymentStatus ?? "Not available"}</dd></div><div><dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Total items</dt><dd className="mt-1 font-semibold">{(order.orderItems ?? []).reduce((total, item) => total + (item.quantity ?? 0), 0)}</dd></div><div className="sm:col-span-2 lg:col-span-1"><dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Order notes</dt><dd className="mt-1 font-semibold">{order.orderNotes ?? order.notes ?? "None"}</dd></div></dl></DashboardCard>
      {isPaymentDialogOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="collect-payment-title"><div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-stone-900"><h2 id="collect-payment-title" className="text-lg font-semibold text-stone-900 dark:text-stone-50">Mark payment received</h2><p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Confirm receipt of {money(order.grandTotal)}. This cannot be reverted.</p><label className="mt-5 block text-sm font-medium text-stone-700 dark:text-stone-200">Payment method<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PickupPaymentMethod)} disabled={collectPaymentMutation.isPending} className="mt-2 h-10 w-full rounded-lg border border-stone-200 bg-white px-3 dark:border-stone-700 dark:bg-stone-950"><option value="CASH">Cash</option><option value="UPI">UPI</option><option value="CARD">Card</option></select></label><div className="mt-6 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)} disabled={collectPaymentMutation.isPending}>Cancel</Button><Button type="button" onClick={() => collectPaymentMutation.mutate({ orderId, paymentMethod })} disabled={collectPaymentMutation.isPending}>{collectPaymentMutation.isPending ? "Updating..." : "Confirm Payment"}</Button></div></div></div> : null}
    </> : null}
  </main>;
}