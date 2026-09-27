import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function DashboardCard({ title, description, actions, children }: DashboardCardProps) {
  return (
    <section className="rounded-2xl border border-stone-200/80 bg-white/90 p-6 shadow-xs backdrop-blur-sm transition-shadow hover:shadow-sm dark:border-stone-800/80 dark:bg-stone-900/80">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">{title}</h3>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-stone-400">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
