interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-stone-200 bg-white/80 p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/80">
      <p className="text-sm text-stone-600 dark:text-stone-300">Page {page} of {totalPages}</p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onPageChange?.(Math.max(1, page - 1))} className="rounded-full border border-stone-200 px-3 py-2 text-sm text-stone-700 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-stone-800 dark:text-stone-300">
          Prev
        </button>
        <button type="button" onClick={() => onPageChange?.(Math.min(totalPages, page + 1))} className="rounded-full border border-stone-200 px-3 py-2 text-sm text-stone-700 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-stone-800 dark:text-stone-300">
          Next
        </button>
      </div>
    </div>
  );
}
