"use client";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  RotateCcw,
  Store,
  Trash2,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserBulkToolbarProps {
  selectedCount: number;
  isDeletedTab?: boolean;
  isProcessing?: boolean;
  onVerify: () => void;
  onUnverify: () => void;
  onActivate: () => void;
  onSuspend: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onAssignSeller: () => void;
  onRemoveSeller: () => void;
  onClear: () => void;
}

export function UserBulkToolbar({
  selectedCount,
  isDeletedTab = false,
  isProcessing = false,
  onVerify,
  onUnverify,
  onActivate,
  onSuspend,
  onDelete,
  onRestore,
  onAssignSeller,
  onRemoveSeller,
  onClear,
}: UserBulkToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 flex items-center gap-2.5 rounded-2xl border border-stone-200 bg-white/95 px-5 py-3 shadow-2xl backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/95 animate-in slide-in-from-bottom-5 duration-200 max-w-[95vw] overflow-x-auto">
      <div className="flex items-center gap-2 border-r border-stone-200 pr-3 dark:border-stone-700 shrink-0">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
          {selectedCount}
        </span>
        <span className="text-xs font-medium text-stone-700 dark:text-stone-300 hidden sm:inline">
          users selected
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!isDeletedTab ? (
          <>
            <Button
              size="sm"
              variant="outline"
              disabled={isProcessing}
              onClick={onVerify}
              className="h-8 gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
              title="Mark as Verified Customers"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verify
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={isProcessing}
              onClick={onActivate}
              className="h-8 gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
              title="Activate Users"
            >
              <Check className="h-3.5 w-3.5" />
              Activate
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={isProcessing}
              onClick={onSuspend}
              className="h-8 gap-1.5 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
              title="Suspend Users"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Suspend
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={isProcessing}
              onClick={onAssignSeller}
              className="h-8 gap-1.5 text-xs text-stone-700 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800"
              title="Assign Store Owner Role"
            >
              <Store className="h-3.5 w-3.5" />
              Make Seller
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={isProcessing}
              onClick={onDelete}
              className="h-8 gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
              title="Move users to trash"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Trash
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
            Restore All Selected
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
