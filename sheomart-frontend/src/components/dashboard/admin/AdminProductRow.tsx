import { CalendarDays, Circle, Package, Store as StoreIcon } from "lucide-react";
import type { AdminProduct, AdminProductInventoryStatus } from "@/types/admin-product";

interface AdminProductRowProps {
  product: AdminProduct;
}

const inventoryStatusStyles: Record<AdminProductInventoryStatus, string> = {
  in_stock: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  low_stock: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  out_of_stock: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  discontinued: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  unavailable: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);
}

function PriceDisplay({ product }: AdminProductRowProps) {
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

  if (!hasDiscount) {
    return <span className="font-medium text-stone-900 dark:text-stone-50">{formatPrice(product.price)}</span>;
  }

  return (
    <span className="flex flex-col items-start">
      <span className="text-xs text-stone-400 line-through">{formatPrice(product.price)}</span>
      <span className="font-semibold text-emerald-700 dark:text-emerald-300">{formatPrice(product.discountPrice)}</span>
    </span>
  );
}

export function AdminProductRow({ product }: AdminProductRowProps) {
  return (
    <article className="rounded-xl border border-stone-200 bg-white/80 p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/80">
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(16rem,1.5fr)_minmax(9rem,1fr)_minmax(9rem,1fr)_minmax(7rem,0.7fr)_minmax(11rem,1fr)] lg:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-950">
            {product.thumbnail ? <img src={product.thumbnail} alt="" className="h-full w-full object-cover" /> : <Package className="h-5 w-5 text-stone-400" />}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-stone-900 dark:text-stone-50">{product.name}</h3>
            <p className="truncate text-xs text-stone-500 dark:text-stone-400">{product.sku}{product.brand ? ` · ${product.brand}` : ""}</p>
          </div>
        </div>

        <div className="text-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-stone-400">Category</p>
          <p className="mt-1 truncate text-stone-700 dark:text-stone-200">{product.category?.name ?? "Category unavailable"}</p>
        </div>

        <div className="text-sm">
          <p className="flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-stone-400"><StoreIcon className="h-3 w-3" />Store</p>
          <p className="mt-1 truncate text-stone-700 dark:text-stone-200">{product.store?.storeName ?? "Store unavailable"}</p>
        </div>

        <div className="text-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-stone-400">Price</p>
          <div className="mt-1"><PriceDisplay product={product} /></div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${inventoryStatusStyles[product.inventoryStatus]}`}>
            {formatLabel(product.inventoryStatus)} · {product.quantity}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${product.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"}`}>
            {product.isActive ? "Active" : "Inactive"}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${product.isPublished ? "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300" : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300"}`}>
            {product.isPublished ? "Published" : "Draft"}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 border-t border-stone-200/80 pt-3 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
        <CalendarDays className="h-3.5 w-3.5" />
        Added {formatDate(product.createdAt)}
        {product.inventoryStatus === "unavailable" ? <><Circle className="ml-2 h-2.5 w-2.5" /> Inventory record unavailable</> : null}
      </div>
    </article>
  );
}
