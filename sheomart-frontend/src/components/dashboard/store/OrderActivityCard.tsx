import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { StoreOrder } from "@/types/store-order";

interface ActivityEvent { label: string; timestamp?: string; }

const formatTimestamp = (value?: string) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Not updated yet";

const getOrderValue = (order: StoreOrder, key: string): string | undefined => {
  const value = (order as StoreOrder & Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
};

export function OrderActivityCard({ order }: { order: StoreOrder }) {
  const status = order.orderStatus ?? order.status ?? "ORDER_PLACED";
  const events: ActivityEvent[] = [
    { label: "Order placed.", timestamp: order.createdAt },
  ];
  if (["PREPARING", "READY_FOR_PICKUP", "PICKED_UP"].includes(status)) events.unshift({ label: "Seller started preparing.", timestamp: getOrderValue(order, "preparingAt") });
  if (["READY_FOR_PICKUP", "PICKED_UP"].includes(status)) events.unshift({ label: "Ready for pickup.", timestamp: getOrderValue(order, "readyForPickupAt") });
  if (order.paymentStatus === "PAID") events.unshift({ label: "Payment collected.", timestamp: getOrderValue(order, "paidAt") ?? getOrderValue(order, "pickedUpAt") });
  if (status === "PICKED_UP") events.unshift({ label: "Picked up.", timestamp: getOrderValue(order, "pickedUpAt") });
  if (status === "CANCELLED") events.unshift({ label: "Order cancelled.", timestamp: getOrderValue(order, "cancelledAt") ?? getOrderValue(order, "updatedAt") });

  return (
    <DashboardCard title="Activity" description="Recent order events, newest first.">
      <ol className="space-y-4">
        {events.map((event, index) => <li key={`${event.label}-${index}`} className="flex gap-3"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" /><div><p className="text-sm font-semibold text-stone-900 dark:text-stone-50">{event.label}</p><p className="mt-1 text-xs text-stone-500">{formatTimestamp(event.timestamp)}</p></div></li>)}
      </ol>
    </DashboardCard>
  );
}