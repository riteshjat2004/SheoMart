import { Check, Circle, X } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { StoreOrder } from "@/types/store-order";

const formatTimestamp = (value?: string) =>
  value
    ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "Not updated yet";

export function OrderTimelineCard({ order }: { order: StoreOrder }) {
  const currentStatus =
    (order as StoreOrder & { pickupStatus?: string }).pickupStatus ??
    order.orderStatus ??
    order.status ??
    "ORDER_PLACED";

  const isDelivery =
    order.fulfillmentType === "delivery" || order.deliveryMethod === "delivery";

  const steps = isDelivery
    ? [
        { status: "ORDER_PLACED", label: "Order placed", timestamp: order.createdAt },
        { status: "ACCEPTED", label: "Accepted by store", timestamp: order.acceptedAt },
        { status: "PREPARING", label: "Packing / Preparing", timestamp: order.preparingAt },
        { status: "READY_FOR_DISPATCH", label: "Ready for dispatch", timestamp: order.readyForDispatchAt },
        { status: "OUT_FOR_DELIVERY", label: "Out for delivery", timestamp: order.outForDeliveryAt },
        { status: "DELIVERED", label: "Delivered to customer", timestamp: order.deliveredAt },
      ]
    : [
        { status: "ORDER_PLACED", label: "Order placed", timestamp: order.createdAt },
        { status: "ACCEPTED", label: "Accepted by store", timestamp: order.acceptedAt },
        { status: "PREPARING", label: "Packing / Preparing", timestamp: order.preparingAt },
        { status: "READY_FOR_PICKUP", label: "Ready for pickup", timestamp: order.readyForPickupAt },
        { status: "PICKED_UP", label: "Picked up by customer", timestamp: order.pickedUpAt },
      ];

  const currentIndex = steps.findIndex((step) => step.status === currentStatus);
  const cancelled = currentStatus === "CANCELLED";

  return (
    <DashboardCard title="Order timeline" description="Status history and milestone events.">
      <div aria-label="Order status timeline" className="space-y-0">
        {cancelled ? (
          <div className="flex gap-3 pb-3">
            <div className="flex flex-col items-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                <X className="h-4 w-4" />
              </span>
            </div>
            <div>
              <p className="font-semibold text-rose-700 dark:text-rose-400">Order cancelled</p>
              <p className="mt-1 text-xs text-stone-500">
                {formatTimestamp(order.cancelledAt || order.updatedBySellerAt)}
              </p>
            </div>
          </div>
        ) : null}

        {steps.map((step, index) => {
          const complete = !cancelled && currentIndex >= index;
          const current = !cancelled && currentIndex === index;
          const timestamp = step.timestamp || (current ? order.updatedBySellerAt : undefined);

          return (
            <div key={step.status} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    complete
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                      : "bg-stone-100 text-stone-400 dark:bg-stone-800"
                  }`}
                >
                  {complete ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                </span>
                {index < steps.length - 1 ? (
                  <span
                    className={`h-full min-h-8 w-px ${
                      complete ? "bg-emerald-400 dark:bg-emerald-600" : "bg-stone-200 dark:bg-stone-800"
                    }`}
                  />
                ) : null}
              </div>
              <div className="pb-4">
                <p
                  className={`text-xs font-semibold ${
                    current
                      ? "text-emerald-700 dark:text-emerald-300"
                      : complete
                        ? "text-stone-900 dark:text-stone-100"
                        : "text-stone-400"
                  }`}
                >
                  {step.label}
                  {current ? " (Current)" : ""}
                </p>
                <p className="mt-0.5 text-[11px] text-stone-400">{formatTimestamp(timestamp)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}