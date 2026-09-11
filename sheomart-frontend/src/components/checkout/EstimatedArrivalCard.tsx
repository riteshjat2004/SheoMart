import { Clock3 } from "lucide-react";

export function EstimatedArrivalCard({ type, text }: { type: "pickup" | "delivery"; text: string }) {
  return <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"><Clock3 className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-semibold">Estimated {type === "pickup" ? "pickup" : "delivery"}</p><p className="mt-1">{text}</p></div></div>;
}
