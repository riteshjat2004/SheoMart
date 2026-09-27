import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NormalEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-stone-200 bg-stone-50/50 p-8 text-center dark:border-stone-800 dark:bg-stone-900/50">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
        <ShoppingBag className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-bold text-stone-900 dark:text-stone-100">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs text-stone-500 dark:text-stone-400">{description}</p>
      {actionLabel && onAction ? (
        <Button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-full bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
