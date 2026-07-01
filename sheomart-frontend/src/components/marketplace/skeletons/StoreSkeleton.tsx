export function StoreSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-[1.5rem] border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <div className="h-12 w-12 rounded-2xl bg-stone-200 dark:bg-stone-800" />
          <div className="mt-4 h-4 w-2/3 rounded-full bg-stone-200 dark:bg-stone-800" />
          <div className="mt-2 h-4 w-1/2 rounded-full bg-stone-200 dark:bg-stone-800" />
        </div>
      ))}
    </div>
  );
}
