import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 bg-stone-50/50 py-12 text-center dark:border-stone-800 dark:bg-stone-900/30">
      {icon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">{title}</h3>
      {description ? (
        <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-stone-400 dark:text-stone-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}
