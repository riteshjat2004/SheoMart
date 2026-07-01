export function ErrorState({ message = "Something went wrong while loading this view." }: { message?: string }) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
      {message}
    </div>
  );
}
