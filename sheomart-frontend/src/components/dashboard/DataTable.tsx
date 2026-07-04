import type { ReactNode } from "react";

interface DataTableProps<T> {
  columns: Array<{ key: string; label: string }>;
  rows: T[];
  renderRow: (row: T, index: number) => ReactNode;
}

export function DataTable<T>({ columns, rows, renderRow }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-stone-200 dark:border-stone-800">
      <table className="min-w-full divide-y divide-stone-200 text-sm dark:divide-stone-800">
        <thead className="bg-stone-50 dark:bg-stone-900/70">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 text-left font-semibold text-stone-700 dark:text-stone-200">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200 bg-white dark:divide-stone-800 dark:bg-stone-950/40">
          {rows.length ? rows.map((row, index) => <tr key={index}>{renderRow(row, index)}</tr>) : <tr><td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-stone-500 dark:text-stone-400">No records yet</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
