import { Clock3, MapPin, Phone, Store, Truck } from "lucide-react";
import type { OrderRecord } from "@/services/orders";

type PickupOrder = OrderRecord & {
  storeName?: string;
  pickupHours?: string;
  deliverySlot?: string;
  deliverySlotLabel?: string;
  storePhone?: string;
};

export function PickupInfoCard({ order }: { order?: PickupOrder }) {
  const isDelivery = order?.fulfillmentType === "delivery";
  const address = order?.shippingAddress;
  const addressText =
    address && typeof address === "object"
      ? [
          address.fullName,
          address.mobile ? `Ph: ${address.mobile}` : undefined,
          address.house,
          address.street,
          address.landmark ? `Near ${address.landmark}` : undefined,
          address.city,
          address.state,
          address.pincode,
        ]
          .filter((value): value is string => typeof value === "string" && value.length > 0)
          .join(", ")
      : "Address details unavailable";

  return (
    <section className="print-avoid-break rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 print:border print:p-4 print:shadow-none">
      <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600 print:text-xs print:font-bold print:text-black">
        {isDelivery ? "Delivery Information" : "Pickup Information"}
      </h2>
      <div className="mt-5 space-y-4 text-sm print:mt-3 print:space-y-2 print:text-xs">
        <div className="flex gap-3">
          <Store className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 print:text-black" />
          <div>
            <p className="font-semibold text-stone-900 dark:text-stone-50 print:text-black">Store Partner</p>
            <p className="mt-0.5 text-stone-600 dark:text-stone-300 print:text-black">
              {order?.storeName ?? "SheoMart Neighborhood Store"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 print:text-black" />
          <div>
            <p className="font-semibold text-stone-900 dark:text-stone-50 print:text-black">
              {isDelivery ? "Delivery Destination" : "Pickup Address"}
            </p>
            <p className="mt-0.5 text-stone-600 dark:text-stone-300 print:text-black">
              {isDelivery ? addressText : (order?.pickupAddress ?? "Store Profile")}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {isDelivery ? (
            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 print:text-black" />
          ) : (
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 print:text-black" />
          )}
          <div>
            <p className="font-semibold text-stone-900 dark:text-stone-50 print:text-black">
              {isDelivery ? "Delivery Schedule" : "Pickup Hours"}
            </p>
            <p className="mt-0.5 text-stone-600 dark:text-stone-300 print:text-black">
              {isDelivery
                ? (order?.deliverySlotLabel ?? order?.deliverySlot ?? "Standard Doorstep Delivery")
                : (order?.pickupHours ?? "Store Hours (10:00 AM - 8:00 PM)")}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 print:text-black" />
          <div>
            <p className="font-semibold text-stone-900 dark:text-stone-50 print:text-black">Store Contact</p>
            <p className="mt-0.5 text-stone-600 dark:text-stone-300 print:text-black">
              {order?.storePhone ?? "Available via Order Support"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
