import { AlertCircle, CheckCircle2, Crown, Info } from "lucide-react";
import { royalTheme } from "./royalTheme";

const icons = { success: CheckCircle2, warning: AlertCircle, info: Info };

export function RoyalBanner({ variant, children }: { variant: keyof typeof icons; children: React.ReactNode }) {
  const Icon = icons[variant];
  return <div className={`flex items-start gap-3 rounded-2xl border p-4 ${royalTheme.panelMuted} ${royalTheme.motionTokens}`} role="status"><Icon className={`mt-0.5 h-5 w-5 ${royalTheme.icon}`} /><Crown className={`mt-0.5 h-4 w-4 ${royalTheme.icon}`} /><p className={`text-sm ${royalTheme.panelText}`}>{children}</p></div>;
}