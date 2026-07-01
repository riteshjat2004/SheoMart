export function HeroSkeleton() {
  return (
    <div className="animate-pulse rounded-[2rem] border border-stone-200 bg-stone-100 p-8 dark:border-stone-800 dark:bg-stone-900">
      <div className="h-5 w-32 rounded-full bg-stone-200 dark:bg-stone-800" />
      <div className="mt-4 h-10 w-3/4 rounded-full bg-stone-200 dark:bg-stone-800" />
      <div className="mt-3 h-5 w-1/2 rounded-full bg-stone-200 dark:bg-stone-800" />
      <div className="mt-6 flex gap-3">
        <div className="h-11 w-32 rounded-full bg-stone-200 dark:bg-stone-800" />
        <div className="h-11 w-32 rounded-full bg-stone-200 dark:bg-stone-800" />
      </div>
    </div>
  );
}
