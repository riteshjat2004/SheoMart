import { Check, Circle, X } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { StoreOrder } from "@/types/store-order";

const steps = [
  { status: "ORDER_PLACED", label: "Order placed" },
  { status: "PREPARING", label: "Preparing" },
  { status: "READY_FOR_PICKUP", label: "Ready for pickup" },
  { status: "PICKED_UP", label: "Picked up" },
] as const;

const formatTimestamp = (value?: string) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Not updated yet";

const getOrderValue = (order: StoreOrder, key: string): string | undefined => {
  const record = order as StoreOrder & Record<string, unknown>;
  const value = record[key];
  return typeof value === "string" ? value : undefined;
};

export function OrderTimelineCard({ order }: { order: StoreOrder }) {
  const currentStatus = order.orderStatus ?? order.status ?? "ORDER_PLACED";
  const currentIndex = steps.findIndex((step) => step.status === currentStatus);
  const cancelled = currentStatus === "CANCELLED";
  const statusTimestampKeys = ["createdAt", "preparingAt", "readyForPickupAt", "pickedUpAt"];

  return (
    <DashboardCard title="Order timeline" description="Read-only status history for this order.">
      <div aria-label="Order status timeline" className="space-y-0">
        {cancelled ? (
          <div className="flex gap-3">
            <div className="flex flex-col items-center"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-700"><X className="h-4 w-4" /></span></div>
            <div className="pb-4"><p className="font-semibold text-rose-700 dark:text-rose-300">Order cancelled</p><p className="mt-1 text-xs text-stone-500">{formatTimestamp(getOrderValue(order, "cancelledAt") ?? getOrderValue(order, "updatedAt"))}</p></div>
          </div>
        ) : null}
        {steps.map((step, index) => {
          const complete = currentIndex >= index;
          const current = currentIndex === index;
          const timestamp = getOrderValue(order, statusTimestampKeys[index]);
          return (
            <div key={step.status} className="flex gap-3">
              <div className="flex flex-col items-center"><span className={`flex h-8 w-8 items-center justify-center rounded-full ${complete ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-400 dark:bg-stone-800"}`}>{complete ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3" />}</span>{index < steps.length - 1 ? <span className={`h-full min-h-8 w-px ${complete ? "bg-emerald-300" : "bg-stone-200 dark:bg-stone-700"}`} /> : null}</div>
              <div className="pb-4"><p className={`font-semibold ${current ? "text-emerald-700 dark:text-emerald-300" : complete ? "text-stone-900 dark:text-stone-50" : "text-stone-500"}`}>{step.label}{current ? " (Current)" : ""}</p><p className="mt-1 text-xs text-stone-500">{formatTimestamp(timestamp)}</p></div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}