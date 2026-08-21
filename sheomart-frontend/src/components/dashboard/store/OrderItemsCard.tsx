import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { StoreOrder } from "@/types/store-order";

const money = (value?: number) => `₹${(value ?? 0).toLocaleString("en-IN")}`;

export function OrderItemsCard({ order }: { order: StoreOrder }) {
  const items = order.orderItems ?? [];
  return (
    <DashboardCard title="Order items" description={`${items.length} item${items.length === 1 ? "" : "s"} in this order`}>
      <div className="divide-y divide-stone-200 dark:divide-stone-800">
        {items.map((item, index) => {
          const unitPrice = item.discountPrice ?? item.unitPrice ?? item.price ?? 0;
          const lineTotal = item.totalPrice ?? item.lineTotal ?? unitPrice * (item.quantity ?? 0);
          return (
            <div key={item.orderItemId ?? item.productId ?? `${item.name}-${index}`} className="flex gap-4 py-4 first:pt-0 last:pb-0">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-100 bg-cover bg-center text-xs text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                style={item.productImage ?? item.image ? { backgroundImage: `url(${item.productImage ?? item.image})` } : undefined}
                aria-label={item.name ?? item.productName ?? "Product image"}
                role="img"
              >
                {item.productImage ?? item.image ? null : "No image"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-stone-900 dark:text-stone-50">{item.name ?? item.productName ?? "Product"}</p>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">SKU: {item.sku ?? "-"}</p>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Qty {item.quantity ?? 0} · {money(unitPrice)} each</p>
              </div>
              <p className="shrink-0 font-semibold text-stone-900 dark:text-stone-50">{money(lineTotal)}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-5 space-y-2 border-t border-stone-200 pt-4 text-sm dark:border-stone-800">
        <div className="flex justify-between text-stone-600 dark:text-stone-300"><span>Subtotal</span><span>{money(order.subtotal ?? items.reduce((total, item) => total + (item.totalPrice ?? item.lineTotal ?? 0), 0))}</span></div>
        <div className="flex justify-between text-base font-semibold text-stone-900 dark:text-stone-50"><span>Grand total</span><span>{money(order.grandTotal)}</span></div>
      </div>
    </DashboardCard>
  );
}