import { ShieldCheck, Sparkles } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";

const metrics = ["Authenticity", "Delivery Reliability", "Customer Satisfaction", "Store Activity"];

export function VerifiedTrustScore() {
  return (
    <section className={`rounded-[2rem] border p-5 sm:p-6 ${verifiedTheme.panel} ${verifiedTheme.motion}`} aria-labelledby="verified-trust-score-heading">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-4 border-emerald-300/70 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
          <ShieldCheck className="h-7 w-7" />
          <span className="text-[10px] font-bold">98/100</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2"><Sparkles className={`h-4 w-4 ${verifiedTheme.accent}`} /><p className={`text-sm font-semibold uppercase tracking-[0.2em] ${verifiedTheme.accent}`}>Store Intelligence</p></div>
          <h2 id="verified-trust-score-heading" className={`mt-2 text-2xl font-semibold ${verifiedTheme.panelText}`}>Trusted Verified Seller</h2>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950"><div className="h-full w-[98%] rounded-full bg-emerald-500" /></div>
        </div>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-4">
        {metrics.map((metric) => <div key={metric} className={`rounded-xl border px-3 py-2 text-xs font-medium ${verifiedTheme.chip}`}>{metric}<span className="mt-1 block text-[10px] opacity-70">Strong signal</span></div>)}
      </div>
    </section>
  );
}