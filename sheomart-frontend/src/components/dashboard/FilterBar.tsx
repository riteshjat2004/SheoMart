import type { ReactNode } from "react";

interface FilterBarProps {
  children: ReactNode;
}

export function FilterBar({ children }: FilterBarProps) {
  return <div className="flex flex-wrap items-center gap-2 rounded-[1.25rem] border border-stone-200 bg-white/80 p-3 shadow-sm dark:border-stone-800 dark:bg-stone-900/80">{children}</div>;
}
