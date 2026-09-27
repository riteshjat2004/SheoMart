export function StoreSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[1.6rem] border border-stone-200/90 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900"
        >
          <div className="h-32 w-full animate-pulse bg-stone-200/80 dark:bg-stone-800" />
          <div className="p-5 pt-8">
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 animate-pulse rounded-full bg-stone-200 dark:bg-stone-800" />
              <div className="h-4 w-16 animate-pulse rounded-full bg-stone-100 dark:bg-stone-850" />
            </div>
            <div className="mt-3 flex gap-2">
              <div className="h-4 w-20 animate-pulse rounded-full bg-stone-200/60 dark:bg-stone-800/60" />
              <div className="h-4 w-24 animate-pulse rounded-full bg-stone-200/60 dark:bg-stone-800/60" />
            </div>
            <div className="mt-3 h-4 w-40 animate-pulse rounded-full bg-stone-100 dark:bg-stone-850" />
          </div>
        </div>
      ))}
    </div>
  );
}
