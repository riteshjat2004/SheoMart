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
    <section className="print-avoid-break rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 print:border print:p-4 print:shadow-none">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800 print:border-black print:pb-2">
        <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600 print:text-xs print:font-bold print:text-black">
          Order Items ({items.length})
        </h2>
        <span className="text-xs text-stone-400 print:text-stone-600">Items Billed</span>
      </div>

      {/* Screen layout */}
      <div className="mt-4 divide-y divide-stone-100 dark:divide-stone-800/80 print:hidden">
        {items.map((item, idx) => (
          <div key={`${item.name}-${idx}`} className="flex flex-col gap-4 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500" aria-label="Product">
                <Package className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-stone-900 dark:text-stone-50">{item.name}</h3>
                <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">Qty: {item.quantity} × {item.price}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-6 text-sm sm:text-right">
              <div>
                <p className="text-xs text-stone-400">Rate</p>
                <p className="font-medium text-stone-900 dark:text-stone-50">{item.price}</p>
              </div>
              <div className="min-w-[4rem] text-right">
                <p className="text-xs text-stone-400">Total</p>
                <p className="font-bold text-stone-900 dark:text-stone-50">{item.total}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Clean Print-only Table Layout */}
      <table className="hidden w-full text-left text-xs print:table mt-2 border-collapse">
        <thead>
          <tr className="border-b border-stone-300">
            <th className="py-1.5 font-bold text-stone-700">#</th>
            <th className="py-1.5 font-bold text-stone-700">Item Description</th>
            <th className="py-1.5 text-center font-bold text-stone-700">Qty</th>
            <th className="py-1.5 text-right font-bold text-stone-700">Price</th>
            <th className="py-1.5 text-right font-bold text-stone-700">Line Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {items.map((item, idx) => (
            <tr key={`print-${item.name}-${idx}`}>
              <td className="py-1.5 text-stone-500">{idx + 1}</td>
              <td className="py-1.5 font-semibold text-stone-900">{item.name}</td>
              <td className="py-1.5 text-center font-medium">{item.quantity}</td>
              <td className="py-1.5 text-right text-stone-700">{item.price}</td>
              <td className="py-1.5 text-right font-bold text-stone-900">{item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
