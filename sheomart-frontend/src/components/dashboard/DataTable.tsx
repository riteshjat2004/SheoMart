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
        <thead className="sticky top-0 z-10 bg-stone-50 dark:bg-stone-900/70">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-900/70"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200 bg-white dark:divide-stone-800 dark:bg-stone-950/40">
          {rows.length ? (
            rows.map((row, index) => (
              <tr
                key={index}
                className="group hover:bg-stone-50/70 dark:hover:bg-stone-800/30 transition-colors"
              >
                {renderRow(row, index)}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="py-10 text-center text-xs text-stone-400 dark:text-stone-500"
              >
                No records yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
