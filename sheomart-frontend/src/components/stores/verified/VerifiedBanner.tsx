import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";

const icons = { success: CheckCircle2, warning: AlertCircle, info: Info };

export function VerifiedBanner({ variant, children }: { variant: keyof typeof icons; children: React.ReactNode }) {
  const Icon = icons[variant];
  return <div className={`flex items-start gap-3 rounded-2xl border p-4 ${verifiedTheme.panelMuted} ${verifiedTheme.motion}`} role="status"><Icon className={`mt-0.5 h-5 w-5 shrink-0 ${verifiedTheme.icon}`} /><p className={`text-sm ${verifiedTheme.panelText}`}>{children}</p></div>;
}