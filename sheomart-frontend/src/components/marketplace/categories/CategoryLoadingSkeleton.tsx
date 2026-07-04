export function CategoryLoadingSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="h-20 animate-pulse rounded-[1.5rem] bg-stone-200 dark:bg-stone-800" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-64 animate-pulse rounded-[1.5rem] bg-stone-200 dark:bg-stone-800" />
        ))}
      </div>
    </div>
  );
}
