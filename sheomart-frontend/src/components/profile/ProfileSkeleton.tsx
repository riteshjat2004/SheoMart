export function ProfileSkeleton() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8" aria-busy="true" aria-live="polite">
      <div className="animate-pulse rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/80">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-stone-200 dark:bg-stone-800" />
            <div className="space-y-2">
              <div className="h-5 w-40 rounded-full bg-stone-200 dark:bg-stone-800" />
              <div className="h-4 w-56 rounded-full bg-stone-200 dark:bg-stone-800" />
            </div>
          </div>
          <div className="h-10 w-32 rounded-full bg-stone-200 dark:bg-stone-800" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="h-48 rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/80" />
          <div className="h-48 rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/80" />
        </div>
        <div className="space-y-6">
          <div className="h-48 rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/80" />
          <div className="h-48 rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/80" />
        </div>
      </div>
    </div>
  );
}
