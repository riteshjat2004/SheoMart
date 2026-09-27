interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  const variantClass =
    normalized === "active" ||
    normalized === "approved" ||
    normalized === "published" ||
    normalized === "plus" ||
    normalized === "verified" ||
    normalized === "royal"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
      : normalized === "inactive" ||
          normalized === "suspended" ||
          normalized === "rejected" ||
          normalized === "hidden"
        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
        : normalized === "pending" ||
            normalized.startsWith("pending ") ||
            normalized === "draft" ||
            normalized === "processing"
          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
          : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400";

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${variantClass}`}
    >
      {status}
    </span>
  );
}
