"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductItem } from "@/types/marketplace";

export function RestockModal({ product, currentQuantity, isSubmitting, onClose, onSubmit }: { product: ProductItem; currentQuantity: number; isSubmitting: boolean; onClose: () => void; onSubmit: (quantity: number, note?: string) => void }) {
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const parsedQuantity = Number(quantity);
  const isValid = Number.isFinite(parsedQuantity) && parsedQuantity > 0;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4"><div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-950"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Restock {product.name}</h2><p className="mt-1 text-sm text-stone-500">Current quantity: {currentQuantity}</p></div><Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close restock modal"><X className="h-4 w-4" /></Button></div><div className="mt-6 space-y-4"><label className="block text-sm font-medium text-stone-700 dark:text-stone-200">Quantity to add<input type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} disabled={isSubmitting} className="mt-2 h-10 w-full rounded-lg border border-stone-200 bg-white px-3 dark:border-stone-700 dark:bg-stone-900" /></label><label className="block text-sm font-medium text-stone-700 dark:text-stone-200">Optional note<textarea value={note} onChange={(event) => setNote(event.target.value)} disabled={isSubmitting} rows={3} className="mt-2 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-900" /></label></div><div className="mt-6 flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button><Button type="button" onClick={() => onSubmit(parsedQuantity, note.trim() || undefined)} disabled={!isValid || isSubmitting}>{isSubmitting ? "Restocking..." : "Restock"}</Button></div></div></div>;
}