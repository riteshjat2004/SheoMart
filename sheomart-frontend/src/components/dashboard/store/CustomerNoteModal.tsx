"use client";

import { useState } from "react";
import { X, StickyNote, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateCustomerNotes } from "@/hooks/use-store-customers";
import type { StoreCustomer } from "@/types/store-customer";

interface CustomerNoteModalProps {
  customer: StoreCustomer;
  onClose: () => void;
  onSuccess?: (newNote: string) => void;
}

export function CustomerNoteModal({ customer, onClose, onSuccess }: CustomerNoteModalProps) {
  const [note, setNote] = useState(customer.notes || "");
  const updateNotes = useUpdateCustomerNotes();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateNotes.mutate(
      { customerId: customer.customerId, notes: note.trim() },
      {
        onSuccess: () => {
          setSaved(true);
          onSuccess?.(note.trim());
          setTimeout(() => {
            onClose();
          }, 800);
        },
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <StickyNote className="h-5 w-5" />
            </div>
            <div>
              <h2 id="note-modal-title" className="text-base font-semibold text-stone-900 dark:text-stone-50">
                Internal Customer Note
              </h2>
              <p className="text-xs text-stone-500">
                For {customer.name || customer.customerId} (Visible ONLY to your store)
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close note modal"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-4 space-y-4">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Keep track of customer preferences, delivery instructions, special packaging requests, or payment habits. Admin and the customer cannot see these notes.
          </p>

          <div>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Prefers delivery after 5 PM. Regular buyer of dairy products. Usually pays via UPI."
              className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50 dark:focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-stone-400">
              {note.length} / 500 characters
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={updateNotes.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {saved ? (
                  <span className="flex items-center gap-1">
                    <Check className="h-4 w-4" /> Saved!
                  </span>
                ) : updateNotes.isPending ? (
                  "Saving..."
                ) : (
                  "Save Note"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
