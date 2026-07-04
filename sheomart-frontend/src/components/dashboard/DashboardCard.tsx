import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function DashboardCard({ title, description, actions, children }: DashboardCardProps) {
  return (
    <section className="rounded-[1.5rem] border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/80">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">{title}</h3>
          {description ? <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-300">{description}</p> : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
