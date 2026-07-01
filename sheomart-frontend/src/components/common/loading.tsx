export function LoadingState() {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm dark:border-stone-800 dark:bg-stone-950/70">
      <div className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-300">
        <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
        Loading experience…
      </div>
    </div>
  );
}
