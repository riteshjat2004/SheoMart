export function SocialDivider() {
  return (
    <div className="my-6 flex items-center gap-3" aria-hidden="true">
      <div className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
      <span className="text-sm text-stone-500 dark:text-stone-400">or continue with</span>
      <div className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
    </div>
  );
}
