import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

type OrderStatus = "ORDER_PLACED" | "PREPARING" | "READY_FOR_PICKUP" | "PICKED_UP" | "CANCELLED";
type NextStatus = Exclude<OrderStatus, "ORDER_PLACED">;

const actions: Record<"ORDER_PLACED" | "PREPARING" | "READY_FOR_PICKUP", Array<{ status: NextStatus; label: string }>> = {
  ORDER_PLACED: [{ status: "PREPARING", label: "Start Preparing" }, { status: "CANCELLED", label: "Cancel Order" }],
  PREPARING: [{ status: "READY_FOR_PICKUP", label: "Ready For Pickup" }, { status: "CANCELLED", label: "Cancel Order" }],
  READY_FOR_PICKUP: [{ status: "PICKED_UP", label: "Mark Picked Up" }, { status: "CANCELLED", label: "Cancel Order" }],
};

export function OrderActionsCard({ status, isPending, onStatusChange }: { status: OrderStatus; isPending: boolean; onStatusChange: (status: NextStatus) => void }) {
  const [pendingStatus, setPendingStatus] = useState<NextStatus | null>(null);
  const availableActions = actions[status as keyof typeof actions];
  const confirmStatus = () => { if (pendingStatus) { onStatusChange(pendingStatus); setPendingStatus(null); } };

  return <>
    <DashboardCard title="Order actions" description="Update the pickup order lifecycle.">
      {availableActions ? <div className="flex flex-wrap gap-3">{availableActions.map((action) => <Button key={action.status} type="button" variant={action.status === "CANCELLED" ? "outline" : "default"} onClick={() => setPendingStatus(action.status)} disabled={isPending}>{isPending ? "Updating..." : action.label}</Button>)}</div> : <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${status === "PICKED_UP" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{status === "PICKED_UP" ? "Order completed" : "Order cancelled"}</span>}
    </DashboardCard>
    {pendingStatus ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="order-status-confirm-title"><div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-stone-900"><h2 id="order-status-confirm-title" className="text-lg font-semibold text-stone-900 dark:text-stone-50">Confirm status change</h2><p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Change this order to {pendingStatus.replaceAll("_", " ").toLowerCase()}?</p><div className="mt-6 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setPendingStatus(null)} disabled={isPending}>Cancel</Button><Button type="button" onClick={confirmStatus} disabled={isPending}>{isPending ? "Updating..." : "Confirm"}</Button></div></div></div> : null}
  </>;
}
