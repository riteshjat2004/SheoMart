"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function ProductModal({ open, title, description, onClose, children, footer }: ProductModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-950">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-stone-200 px-6 py-5 dark:border-stone-800">
          <div>
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">{title}</h3>
            {description ? <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{description}</p> : null}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 pb-8">{children}</div>
        {footer ? <div className="flex shrink-0 justify-end gap-2 border-t border-stone-200 bg-white px-6 py-4 dark:border-stone-800 dark:bg-stone-950">{footer}</div> : null}
      </div>
    </div>
  );
}
