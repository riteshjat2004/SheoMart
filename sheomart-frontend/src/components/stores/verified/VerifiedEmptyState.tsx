import { PackageSearch } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";

export function VerifiedEmptyState({ title, description, actionLabel }: { title: string; description: string; actionLabel?: string }) {
  return <div className={`rounded-2xl border border-dashed p-6 text-center ${verifiedTheme.panelMuted}`} role="status"><PackageSearch className={`mx-auto h-8 w-8 ${verifiedTheme.icon}`} /><h3 className={`mt-3 font-semibold ${verifiedTheme.panelText}`}>{title}</h3><p className={`mt-1 text-sm ${verifiedTheme.panelMutedText}`}>{description}</p>{actionLabel ? <button type="button" className={`mt-4 text-sm font-semibold ${verifiedTheme.icon}`}>{actionLabel}</button> : null}</div>;
}