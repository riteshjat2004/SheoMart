"use client";

import { useEffect, useState } from "react";

export function LiveDeliveryEtaCard({ estimatedDeliveryAt }: { estimatedDeliveryAt?: string }) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => { const update = () => setRemaining(Math.max(0, Math.ceil((new Date(estimatedDeliveryAt ?? "").getTime() - Date.now()) / 60000))); update(); const timer = window.setInterval(update, 30000); return () => window.clearInterval(timer); }, [estimatedDeliveryAt]);
  if (!estimatedDeliveryAt) return null;
  return <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100"><p className="text-xs font-semibold uppercase tracking-[0.16em]">Estimated Delivery</p><p className="mt-2 text-lg font-semibold">{new Date(estimatedDeliveryAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p><p className="mt-1 text-sm">{remaining > 0 ? `${remaining} minutes remaining.` : "Delivery time is due."}</p></div>;
}
