import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

const presets = [15, 30, 45, 60];

export function DeliveryManagementCard({ estimatedDeliveryAt, isPending, onUpdateEta }: { estimatedDeliveryAt?: string; isPending: boolean; onUpdateEta: (value: string) => void }) {
  const [custom, setCustom] = useState(estimatedDeliveryAt ? new Date(estimatedDeliveryAt).toISOString().slice(0, 16) : "");
  return <DashboardCard title="Delivery timing" description="Set the live delivery ETA after the order is ready for dispatch."><div className="flex flex-wrap gap-2">{presets.map((minutes) => <Button key={minutes} type="button" variant="outline" disabled={isPending} onClick={() => onUpdateEta(new Date(Date.now() + minutes * 60000).toISOString())}>Deliver in {minutes < 60 ? `${minutes} mins` : "1 hour"}</Button>)}</div><div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"><label className="flex-1 text-sm font-medium">Custom delivery time<input type="datetime-local" value={custom} onChange={(event) => setCustom(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm dark:border-stone-700 dark:bg-stone-950" /></label><Button type="button" disabled={!custom || isPending} onClick={() => onUpdateEta(new Date(custom).toISOString())}>Save ETA</Button></div>{estimatedDeliveryAt ? <p className="mt-3 text-sm text-stone-500">Current ETA: {new Date(estimatedDeliveryAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p> : null}</DashboardCard>;
}
