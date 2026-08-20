import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BillingCartItemData {
  productId: string;
  productName: string;
  sku: string;
  image?: string;
  price: number;
  availableQuantity: number;
  quantity: number;
  lineTotal: number;
}

interface BillingCartItemProps {
  item: BillingCartItemData;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export function BillingCartItem({ item, onIncrease, onDecrease, onRemove }: BillingCartItemProps) {
  return (
    <div className="border-b border-stone-200 py-4 last:border-b-0 dark:border-stone-800">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500">
          {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <span className="text-xs">IMG</span>}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-50">{item.productName}</p>
          <p className="mt-1 truncate text-xs text-stone-500 dark:text-stone-400">SKU {item.sku || "-"} · ₹{item.price} each</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button type="button" variant="outline" size="icon" onClick={onDecrease} disabled={item.quantity <= 1} aria-label={`Decrease ${item.productName} quantity`}>
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="min-w-8 text-center text-sm font-semibold text-stone-900 dark:text-stone-50">{item.quantity}</span>
          <Button type="button" variant="outline" size="icon" onClick={onIncrease} disabled={item.quantity >= item.availableQuantity} aria-label={`Increase ${item.productName} quantity`}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label={`Remove ${item.productName}`} className="ml-1 text-stone-500 hover:text-red-600 dark:text-stone-400">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        <span className="shrink-0 text-sm font-semibold text-stone-900 dark:text-stone-50">₹{item.lineTotal}</span>
      </div>
    </div>
  );
}
