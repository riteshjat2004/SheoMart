import type { ReactNode } from "react";

interface CategoryHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function CategoryHeader({ eyebrow, title, description, actions }: CategoryHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[1.5rem] border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/80 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">{eyebrow}</p> : null}
        <h1 className="mt-2 text-2xl font-semibold text-stone-900 dark:text-stone-50 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-300">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
