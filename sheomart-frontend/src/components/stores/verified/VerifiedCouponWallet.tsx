import { Copy, TicketPercent } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";
import { VerifiedSectionHeader } from "./VerifiedSectionHeader";

const coupons = [{ code: "WELCOME10", discount: "10% off", eligibility: "New customers" }, { code: "SAVE200", discount: "₹200 off", eligibility: "Orders above ₹999" }, { code: "FREESHIP", discount: "Free delivery", eligibility: "Eligible locations" }, { code: "BUY2GET1", discount: "Buy 2, get 1", eligibility: "Selected products" }];

export function VerifiedCouponWallet() {
  return <section className="space-y-4" aria-labelledby="verified-coupons-heading"><VerifiedSectionHeader icon={TicketPercent} title="Verified Coupon Wallet" subtitle="Keep these offers handy for your next basket." /><h2 id="verified-coupons-heading" className="sr-only">Verified coupon wallet</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{coupons.map((coupon) => <article key={coupon.code} className={`rounded-2xl border border-dashed p-4 ${verifiedTheme.panelMuted}`}><p className={`text-lg font-bold tracking-wider ${verifiedTheme.panelText}`}>{coupon.code}</p><p className={`mt-2 text-sm font-semibold ${verifiedTheme.accent}`}>{coupon.discount}</p><p className={`mt-1 text-xs ${verifiedTheme.panelMutedText}`}>{coupon.eligibility} · Expiry to be announced</p><button type="button" title={`Copy ${coupon.code}`} className={`mt-4 inline-flex items-center gap-2 text-xs font-semibold ${verifiedTheme.icon}`}><Copy className="h-4 w-4" /> Copy code</button></article>)}</div></section>;
}
