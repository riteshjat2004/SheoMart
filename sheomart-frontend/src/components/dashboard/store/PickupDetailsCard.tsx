import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { StoreOrder } from "@/types/store-order";

const display = (value?: string) => value || "To be confirmed";

export function PickupDetailsCard({ order }: { order: StoreOrder }) {
  const address = order.shippingAddress;
  const addressText = order.pickupAddress ?? order.store?.pickupAddress ?? [address?.house, address?.street, address?.city, address?.state, address?.pincode].filter(Boolean).join(", ");
  return (
    <DashboardCard title="Pickup details" description="Collection information for the customer.">
      <dl className="grid gap-4 sm:grid-cols-2">
        <div><dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Pickup store</dt><dd className="mt-1 font-semibold text-stone-900 dark:text-stone-50">{display(order.pickupStore ?? order.storeName ?? order.store?.name ?? order.store?.storeName ?? "SheoMart Store")}</dd></div>
        <div><dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Pickup address</dt><dd className="mt-1 font-semibold text-stone-900 dark:text-stone-50">{display(addressText)}</dd></div>
        <div><dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Pickup hours</dt><dd className="mt-1 font-semibold text-stone-900 dark:text-stone-50">{display(order.pickupHours ?? order.store?.pickupHours ?? "10:00 AM - 8:00 PM")}</dd></div>
        <div><dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Estimated pickup time</dt><dd className="mt-1 font-semibold text-stone-900 dark:text-stone-50">{display(order.estimatedPickupTime ?? [order.deliveryDate, order.deliverySlot].filter(Boolean).join(" · "))}</dd></div>
      </dl>
    </DashboardCard>
  );
}