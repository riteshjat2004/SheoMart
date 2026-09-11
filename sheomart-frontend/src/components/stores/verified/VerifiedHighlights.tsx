import { CheckCircle2 } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";

export function VerifiedHighlights() {
  return <section className={`rounded-[2rem] border p-5 sm:p-6 ${verifiedTheme.panelMuted}`} aria-labelledby="verified-highlights-heading"><h2 id="verified-highlights-heading" className={`text-xl font-semibold ${verifiedTheme.panelText}`}>Why Customers Choose This Store</h2><div className="mt-4 flex flex-wrap gap-2">{["Genuine Products", "Trusted by 10,000+ Customers", "Fast Customer Support", "Easy Returns", "Secure Payments"].map((label) => <span key={label} className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium ${verifiedTheme.chip}`}><CheckCircle2 className={`h-4 w-4 ${verifiedTheme.icon}`} />{label}</span>)}</div></section>;
}