export function ProductSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="animate-pulse overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
          <div className="h-40 bg-stone-200 dark:bg-stone-800" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 rounded-full bg-stone-200 dark:bg-stone-800" />
            <div className="h-4 w-1/2 rounded-full bg-stone-200 dark:bg-stone-800" />
            <div className="h-10 rounded-full bg-stone-200 dark:bg-stone-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
