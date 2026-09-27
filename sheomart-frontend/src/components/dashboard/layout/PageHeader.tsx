import type { ReactNode } from "react";

interface PageHeaderProps {
  category?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ category, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div>
        {category && (
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            {category}
          </span>
        )}
        <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-2xl leading-tight">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-stone-500 dark:text-stone-400">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
