import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifiedTheme } from "@/themes/verifiedTheme";

export function VerifiedTrustBanner() {
  return <section className={`flex flex-col gap-4 rounded-[2rem] border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${verifiedTheme.hero}`} aria-label="Verified store review policy"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-emerald-300" /><p className="max-w-2xl text-sm leading-6 text-emerald-50">Every Verified Store is reviewed by the SheoMart team for authenticity, reliability and customer service.</p></div><Button type="button" variant="outline" className={verifiedTheme.secondaryButton}>Learn More <ArrowRight className="h-4 w-4" /></Button></section>;
}