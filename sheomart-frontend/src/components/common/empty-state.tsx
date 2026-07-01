export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 p-8 text-center shadow-sm dark:border-stone-700 dark:bg-stone-950/70">
      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{description}</p>
      ) : null}
    </div>
  );
}
