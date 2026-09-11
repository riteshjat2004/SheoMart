interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  const variantClass =
    normalized === "active" || normalized === "approved" || normalized === "published" || normalized === "plus"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
      : normalized === "pending" || normalized.startsWith("pending ") || normalized === "draft"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
        : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300";

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${variantClass}`}>{status}</span>;
}
