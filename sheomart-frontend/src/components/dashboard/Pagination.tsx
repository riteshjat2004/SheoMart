interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-1 pt-4">
      <p className="text-xs text-stone-400 dark:text-stone-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange?.(Math.max(1, page - 1))}
          className="rounded-lg border border-stone-200 dark:border-stone-800 px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 hover:border-emerald-400/60 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
          className="rounded-lg border border-stone-200 dark:border-stone-800 px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 hover:border-emerald-400/60 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
