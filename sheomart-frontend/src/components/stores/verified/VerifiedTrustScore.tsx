import { CheckCircle2, ShieldCheck } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";

const metrics = [
  "100% Authenticity Verified",
  "High Delivery Reliability",
  "Top Customer Satisfaction",
  "Active Inventory Verification",
];

export function VerifiedTrustScore() {
  return (
    <section
      className={`rounded-[2rem] border p-5 sm:p-6 ${verifiedTheme.panel} ${verifiedTheme.motion}`}
      aria-labelledby="verified-trust-score-heading"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-emerald-300/80 bg-emerald-50 text-emerald-800 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-100">
          <ShieldCheck className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          <span className="mt-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">98/100</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className={`h-4 w-4 ${verifiedTheme.accent}`} />
            <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${verifiedTheme.accent}`}>
              Store Trust &amp; Reliability Index
            </p>
          </div>
          <h2 id="verified-trust-score-heading" className={`mt-1.5 text-2xl font-bold ${verifiedTheme.panelText}`}>
            SheoMart Verified Seller
          </h2>
          <div className="mt-3.5 h-2.5 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950/80">
            <div className="h-full w-[98%] rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-2.5 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric}
            className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-medium ${verifiedTheme.chip}`}
          >
            <span>{metric}</span>
            <span className="ml-2 shrink-0 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              Verified
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}