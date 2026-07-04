import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: ReactNode;
}

export function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <div className="rounded-[1.5rem] border border-stone-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/80">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{title}</p>
          <p className="mt-3 text-2xl font-semibold text-stone-900 dark:text-stone-50">{value}</p>
          {description ? <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">{description}</p> : null}
        </div>
        {icon ? <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">{icon}</div> : null}
      </div>
    </div>
  );
}
