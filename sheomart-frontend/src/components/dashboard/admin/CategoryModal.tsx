"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryModalProps {
  open: boolean;
  title: string;
  description?: string;
  submitLabel: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  children: ReactNode;
}

export function CategoryModal({ open, title, description, submitLabel, isSubmitting = false, onClose, onSubmit, children }: CategoryModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4">
      <div className="w-full max-w-2xl rounded-[2rem] border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">{title}</h3>
            {description ? <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{description}</p> : null}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-6">{children}</div>

        {onSubmit ? (
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
