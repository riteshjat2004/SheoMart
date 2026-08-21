import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { StoreOrder } from "@/types/store-order";

const valueOrPlaceholder = (value?: string) => value || "Not available";

export function CustomerInfoCard({ order }: { order: StoreOrder }) {
  const customerType = order.customerType ?? (order.isPlusCustomer || order.customer?.isPlus ? "PLUS" : "Regular");
  return (
    <DashboardCard title="Customer information" description="Customer details for this pickup order.">
      <dl className="grid gap-4 sm:grid-cols-2">
        <div><dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Name</dt><dd className="mt-1 font-semibold text-stone-900 dark:text-stone-50">{valueOrPlaceholder(order.customerName ?? order.customer?.name ?? order.customer?.fullName)}</dd></div>
        <div><dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Phone</dt><dd className="mt-1 font-semibold text-stone-900 dark:text-stone-50">{valueOrPlaceholder(order.customerMobile ?? order.customerPhone ?? order.customer?.mobile ?? order.customer?.phone)}</dd></div>
        <div><dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Customer type</dt><dd className="mt-1 font-semibold text-stone-900 dark:text-stone-50">{customerType === "PLUS" ? <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-700">PLUS</span> : customerType}</dd></div>
        <div><dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Pickup method</dt><dd className="mt-1 font-semibold text-stone-900 dark:text-stone-50">Pickup</dd></div>
      </dl>
    </DashboardCard>
  );
}