import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: ReactNode;
}

export function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white/90 p-6 shadow-xs backdrop-blur-sm dark:border-stone-800/80 dark:bg-stone-900/80">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
            {title}
          </p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
            {value}
          </p>
          {description ? (
            <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">{description}</p>
          ) : null}
        </div>
        {icon ? (
          <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
