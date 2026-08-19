interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-white/70 p-6 text-center dark:border-stone-700 dark:bg-stone-950/70">
      <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-stone-600 dark:text-stone-300">{description}</p> : null}
    </div>
  );
}
