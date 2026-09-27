import { PackageSearch } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";

export function VerifiedEmptyState({
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
    <div
      className={`rounded-3xl border border-dashed p-8 text-center ${verifiedTheme.panelMuted}`}
      role="status"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
        <PackageSearch className="h-6 w-6" />
      </div>
      <h3 className={`mt-4 text-base font-semibold ${verifiedTheme.panelText}`}>{title}</h3>
      <p className={`mx-auto mt-1.5 max-w-md text-sm ${verifiedTheme.panelMutedText}`}>{description}</p>
      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}