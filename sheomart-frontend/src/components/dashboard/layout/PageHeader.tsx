import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/80 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-50 sm:text-2xl">{title}</h2>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600 dark:text-stone-300">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
