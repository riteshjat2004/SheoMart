"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Layers, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductItem, ProductVariant } from "@/types/marketplace";

export interface InventoryFormValues {
  availableQuantity: number;
  reservedQuantity: number;
  soldQuantity: number;
  lowStockThreshold: number;
  status: string;
}

interface InventoryFormProps {
  initialValues?: Partial<InventoryFormValues>;
  product?: ProductItem | null;
  isSubmitting?: boolean;
  onSubmit: (values: InventoryFormValues, variants?: ProductVariant[]) => void;
}

const emptyValues: InventoryFormValues = {
  availableQuantity: 0,
  reservedQuantity: 0,
  soldQuantity: 0,
  lowStockThreshold: 5,
  status: "in_stock",
};

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function InventoryForm({
  initialValues,
  product,
  isSubmitting = false,
  onSubmit,
}: InventoryFormProps) {
  const [values, setValues] = useState<InventoryFormValues>({
    ...emptyValues,
    ...initialValues,
  });

  const hasVariants = Boolean(product?.variants && product.variants.length > 0);
  const isSeparate = product?.stockTrackingMode !== "SHARED" && hasVariants;

  const [variantStocks, setVariantStocks] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    if (product?.variants) {
      product.variants.forEach((v, idx) => {
        const key = v.variantId || v.label || `variant-${idx}`;
        map[key] = v.stock ?? 0;
      });
    }
    return map;
  });

  useEffect(() => {
    setValues({ ...emptyValues, ...initialValues });
    if (product?.variants) {
      const map: Record<string, number> = {};
      product.variants.forEach((v, idx) => {
        const key = v.variantId || v.label || `variant-${idx}`;
        map[key] = v.stock ?? 0;
      });
      setVariantStocks(map);
    }
  }, [initialValues, product]);

  const handleVariantStockChange = (key: string, val: number) => {
    const updated = {
      ...variantStocks,
      [key]: Math.max(0, val),
    };
    setVariantStocks(updated);

    if (isSeparate) {
      const sum = Object.values(updated).reduce((acc, curr) => acc + curr, 0);
      setValues((prev) => ({
        ...prev,
        availableQuantity: sum,
      }));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let updatedVariants: ProductVariant[] | undefined = undefined;
    if (isSeparate && product?.variants) {
      updatedVariants = product.variants.map((v, idx) => {
        const key = v.variantId || v.label || `variant-${idx}`;
        return {
          ...v,
          stock: variantStocks[key] ?? 0,
        };
      });
    }

    onSubmit(
      {
        ...values,
        availableQuantity: toNumber(String(values.availableQuantity)),
        reservedQuantity: toNumber(String(values.reservedQuantity)),
        soldQuantity: toNumber(String(values.soldQuantity)),
        lowStockThreshold: toNumber(String(values.lowStockThreshold)),
      },
      updatedVariants
    );
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Pack Variant Stock Breakdown if separate packs exist */}
      {isSeparate && product?.variants && (
        <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 dark:border-stone-800 dark:bg-stone-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Pack Variant Stocks
              </h4>
            </div>
            <span className="text-[11px] text-stone-400">
              Total sums into Available Stock
            </span>
          </div>

          <div className="space-y-2">
            {product.variants.map((v, idx) => {
              const key = v.variantId || v.label || `variant-${idx}`;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-white px-3 py-2 text-xs dark:border-stone-800 dark:bg-stone-900"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                      {v.label}
                    </p>
                    <p className="text-[10px] text-stone-400">
                      {v.packQuantity ? `Pack size: ${v.packQuantity}` : "Pack size: 1"} • ₹{v.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] text-stone-400 font-medium">Stock:</span>
                    <input
                      type="number"
                      min="0"
                      value={variantStocks[key] ?? 0}
                      onChange={(e) =>
                        handleVariantStockChange(
                          key,
                          Math.max(0, parseInt(e.target.value, 10) || 0)
                        )
                      }
                      className="w-16 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-center font-bold text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
          <div className="flex items-center justify-between">
            <span className="font-medium">Available stock</span>
            {isSeparate && (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Calculator className="h-3 w-3" /> Auto-sum of packs
              </span>
            )}
          </div>
          <input
            type="number"
            min="0"
            disabled={isSeparate}
            value={values.availableQuantity}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                availableQuantity: toNumber(event.target.value),
              }))
            }
            className={`w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950 ${
              isSeparate ? "bg-stone-100 dark:bg-stone-900 cursor-not-allowed font-bold text-emerald-600" : ""
            }`}
          />
        </label>
        <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
          <span className="font-medium">Reserved stock</span>
          <input
            type="number"
            min="0"
            value={values.reservedQuantity}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                reservedQuantity: toNumber(event.target.value),
              }))
            }
            className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
          <span className="font-medium">Sold quantity</span>
          <input
            type="number"
            min="0"
            value={values.soldQuantity}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                soldQuantity: toNumber(event.target.value),
              }))
            }
            className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
          />
        </label>
        <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
          <span className="font-medium">Low stock threshold</span>
          <input
            type="number"
            min="0"
            value={values.lowStockThreshold}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                lowStockThreshold: toNumber(event.target.value),
              }))
            }
            className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm text-stone-700 dark:text-stone-300">
        <span className="font-medium">Inventory status</span>
        <select
          value={values.status}
          onChange={(event) =>
            setValues((current) => ({ ...current, status: event.target.value }))
          }
          className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
        >
          <option value="in_stock">In stock</option>
          <option value="low_stock">Low stock</option>
          <option value="out_of_stock">Out of stock</option>
          <option value="discontinued">Discontinued</option>
        </select>
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save inventory"}
        </Button>
      </div>
    </form>
  );
}
