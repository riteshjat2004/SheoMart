"use client";

import { Check, Power, RotateCcw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PromotionBulkToolbarProps {
  selectedCount: number;
  isDeletedTab?: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onClear: () => void;
  isProcessing?: boolean;
}

export function PromotionBulkToolbar({
  selectedCount,
  isDeletedTab = false,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
  onClear,
  isProcessing = false,
}: PromotionBulkToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 flex items-center gap-3 rounded-2xl border border-stone-200 bg-white/95 px-5 py-3 shadow-2xl backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/95 animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center gap-2 border-r border-stone-200 pr-3 dark:border-stone-700">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
          {selectedCount}
        </span>
        <span className="text-xs font-medium text-stone-700 dark:text-stone-300 hidden sm:inline">
          selected
        </span>
      </div>

      <div className="flex items-center gap-2">
        {!isDeletedTab ? (
          <>
            <Button
              size="sm"
              variant="outline"
              disabled={isProcessing}
              onClick={onActivate}
              className="h-8 gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
            >
              <Check className="h-3.5 w-3.5" />
              Activate
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isProcessing}
              onClick={onDeactivate}
              className="h-8 gap-1.5 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
            >
              <Power className="h-3.5 w-3.5" />
              Deactivate
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isProcessing}
              onClick={onDelete}
              className="h-8 gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={isProcessing}
            onClick={onRestore}
            className="h-8 gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restore
          </Button>
        )}

        <button
          type="button"
          onClick={onClear}
          disabled={isProcessing}
          className="ml-1 rounded-lg p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          title="Clear selection"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
