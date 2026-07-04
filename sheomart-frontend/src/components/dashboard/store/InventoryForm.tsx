"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

export interface InventoryFormValues {
  availableQuantity: number;
  reservedQuantity: number;
  soldQuantity: number;
  lowStockThreshold: number;
  status: string;
}

interface InventoryFormProps {
  initialValues?: Partial<InventoryFormValues>;
  isSubmitting?: boolean;
  onSubmit: (values: InventoryFormValues) => void;
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

export function InventoryForm({ initialValues, isSubmitting = false, onSubmit }: InventoryFormProps) {
  const [values, setValues] = useState<InventoryFormValues>({ ...emptyValues, ...initialValues });

  useEffect(() => {
    setValues({ ...emptyValues, ...initialValues });
  }, [initialValues]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      ...values,
      availableQuantity: toNumber(String(values.availableQuantity)),
      reservedQuantity: toNumber(String(values.reservedQuantity)),
      soldQuantity: toNumber(String(values.soldQuantity)),
      lowStockThreshold: toNumber(String(values.lowStockThreshold)),
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
          <span className="font-medium">Available stock</span>
          <input type="number" min="0" value={values.availableQuantity} onChange={(event) => setValues((current) => ({ ...current, availableQuantity: toNumber(event.target.value) }))} className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950" />
        </label>
        <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
          <span className="font-medium">Reserved stock</span>
          <input type="number" min="0" value={values.reservedQuantity} onChange={(event) => setValues((current) => ({ ...current, reservedQuantity: toNumber(event.target.value) }))} className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
          <span className="font-medium">Sold quantity</span>
          <input type="number" min="0" value={values.soldQuantity} onChange={(event) => setValues((current) => ({ ...current, soldQuantity: toNumber(event.target.value) }))} className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950" />
        </label>
        <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
          <span className="font-medium">Low stock threshold</span>
          <input type="number" min="0" value={values.lowStockThreshold} onChange={(event) => setValues((current) => ({ ...current, lowStockThreshold: toNumber(event.target.value) }))} className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950" />
        </label>
      </div>
      <label className="block space-y-2 text-sm text-stone-700 dark:text-stone-300">
        <span className="font-medium">Inventory status</span>
        <select value={values.status} onChange={(event) => setValues((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950">
          <option value="in_stock">In stock</option>
          <option value="low_stock">Low stock</option>
          <option value="out_of_stock">Out of stock</option>
          <option value="discontinued">Discontinued</option>
        </select>
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>Save inventory</Button>
      </div>
    </form>
  );
}
