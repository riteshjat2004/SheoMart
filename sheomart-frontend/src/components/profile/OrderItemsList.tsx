import { Package } from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: string;
  total: string;
}

interface OrderItemsListProps {
  items: OrderItem[];
}

export function OrderItemsList({ items }: OrderItemsListProps) {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Order Items</h2>
      <div className="mt-5 divide-y divide-stone-200 dark:divide-stone-800">
        {items.map((item) => (
          <div key={`${item.name}-${item.quantity}`} className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500" aria-label="Product image placeholder">
                <Package className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-stone-900 dark:text-stone-50">{item.name}</h3>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Quantity: {item.quantity}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-6 text-sm sm:text-right">
              <div>
                <p className="text-stone-500 dark:text-stone-400">Price</p>
                <p className="mt-1 font-medium text-stone-900 dark:text-stone-50">{item.price}</p>
              </div>
              <div>
                <p className="text-stone-500 dark:text-stone-400">Total</p>
                <p className="mt-1 font-semibold text-stone-900 dark:text-stone-50">{item.total}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
