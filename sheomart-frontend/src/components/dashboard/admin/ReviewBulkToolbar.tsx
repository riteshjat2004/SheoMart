"use client";

import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  RotateCcw,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewBulkToolbarProps {
  selectedCount: number;
  isDeletedTab?: boolean;
  isProcessing?: boolean;
  onApprove: () => void;
  onReject: () => void;
  onHide: () => void;
  onUnhide: () => void;
  onMarkSpam: () => void;
  onMarkAbuse: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onClear: () => void;
}

export function ReviewBulkToolbar({
  selectedCount,
  isDeletedTab = false,
  isProcessing = false,
  onApprove,
  onReject,
  onHide,
  onUnhide,
  onMarkSpam,
  onMarkAbuse,
  onDelete,
  onRestore,
  onClear,
}: ReviewBulkToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 flex items-center gap-2.5 rounded-2xl border border-stone-200 bg-white/95 px-5 py-3 shadow-2xl backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/95 animate-in slide-in-from-bottom-5 duration-200 max-w-[95vw] overflow-x-auto">
      <div className="flex items-center gap-2 border-r border-stone-200 pr-3 dark:border-stone-700 shrink-0">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
          {selectedCount}
        </span>
        <span className="text-xs font-medium text-stone-700 dark:text-stone-300 hidden sm:inline">
          reviews selected
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!isDeletedTab ? (
          <>
            <Button
              size="sm"
              variant="outline"
              disabled={isProcessing}
              onClick={onApprove}
              className="h-8 gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
              title="Approve Reviews"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approve
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={isProcessing}
              onClick={onReject}
              className="h-8 gap-1.5 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
              title="Reject Reviews"
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={isProcessing}
              onClick={onHide}
              className="h-8 gap-1.5 text-xs text-stone-700 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800"
              title="Hide Reviews from Storefront"
            >
              <EyeOff className="h-3.5 w-3.5" />
              Hide
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={isProcessing}
              onClick={onUnhide}
              className="h-8 gap-1.5 text-xs text-stone-700 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800"
              title="Unhide Reviews"
            >
              <Eye className="h-3.5 w-3.5" />
              Unhide
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={isProcessing}
              onClick={onMarkSpam}
              className="h-8 gap-1.5 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/40"
              title="Mark as Spam"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Spam
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={isProcessing}
              onClick={onMarkAbuse}
              className="h-8 gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
              title="Mark as Abuse"
            >
              <AlertOctagon className="h-3.5 w-3.5" />
              Abuse
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={isProcessing}
              onClick={onDelete}
              className="h-8 gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
              title="Move reviews to trash"
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
