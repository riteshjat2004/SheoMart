"use client";

import { useRouter } from "next/navigation";
import { Check, Search } from "lucide-react";
import { useState } from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { Pagination } from "@/components/dashboard/Pagination";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { useUpdateOrderStatus } from "@/hooks/use-update-order-status";
import { useStoreOrders } from "@/hooks/use-store-orders";
import { STORE_ORDER_STATUSES, STORE_PAYMENT_STATUSES, type StoreOrder, type StoreOrderFilters } from "@/types/store-order";

interface StoreOrdersTableProps {
  filters: StoreOrderFilters;
  onFiltersChange: (filters: StoreOrderFilters) => void;
}

const statusLabels: Record<string, string> = {
  ORDER_PLACED: "Order Placed",
  PREPARING: "Preparing",
  READY_FOR_PICKUP: "Ready for Pickup",
  PICKED_UP: "Picked Up",
  CANCELLED: "Cancelled",
};
const paymentLabels: Record<string, string> = {
  PAID: "Paid",
  PENDING: "Pending",
  PARTIALLY_PAID: "Partially Paid",
  FAILED: "Failed",
};
const statusClasses: Record<string, string> = {
  ORDER_PLACED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-orange-100 text-orange-700",
  READY_FOR_PICKUP: "bg-green-100 text-green-700",
  PICKED_UP: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};
const paymentClasses: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  PARTIALLY_PAID: "bg-orange-100 text-orange-700",
  FAILED: "bg-red-100 text-red-700",
};

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : "-");
const getStatus = (order: StoreOrder) => (order as StoreOrder & { pickupStatus?: string }).pickupStatus ?? order.orderStatus ?? order.status ?? "ORDER_PLACED";
const getCustomerName = (order: StoreOrder) => order.customerName ?? order.customer?.name ?? order.customer?.fullName ?? "Customer";
const getCustomerPhone = (order: StoreOrder) => order.customerMobile ?? order.customerPhone ?? order.customer?.mobile ?? order.customer?.phone ?? "-";
const isPickupOrder = (order: StoreOrder) => (!order.fulfillmentType && !order.deliveryMethod) || [order.fulfillmentType, order.deliveryMethod].some((value) => value?.toLowerCase().includes("pickup"));
const getNextOrderStatus = (status: string) => {
  switch (status) {
    case "ORDER_PLACED":
      return "PREPARING";
    case "PREPARING":
      return "READY_FOR_PICKUP";
    case "READY_FOR_PICKUP":
      return "PICKED_UP";
    default:
      return null;
  }
};
const canCancelOrder = (status: string) => status === "ORDER_PLACED" || status === "PREPARING";

function ColoredBadge({ value, label, classes }: { value: string; label: string; classes: Record<string, string> }) {
  return (
    <span className={`inline-flex rounded-full p-0.5 ${classes[value] ?? "bg-stone-100 text-stone-700"}`}>
      <StatusBadge status={label} />
    </span>
  );
}

export function StoreOrdersTable({ filters, onFiltersChange }: StoreOrdersTableProps) {
  const router = useRouter();
  const ordersQuery = useStoreOrders(filters);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const updateOrderStatusMutation = useUpdateOrderStatus({
    onSuccess: (_data, variables) => {
      setToast({ type: "success", message: `Order ${variables.orderId} updated successfully.` });
      void ordersQuery.refetch();
    },
    onError: (error, variables) => {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : `Unable to update order ${variables.orderId}.`,
      });
    },
  });

  const orders = ordersQuery.data?.orders ?? [];
  const pagination = ordersQuery.data?.pagination;
  const totalPages = pagination?.totalPages ?? (orders.length < filters.limit ? filters.page : filters.page + 1);
  const updateFilter = (changes: Partial<StoreOrderFilters>) => onFiltersChange({ ...filters, ...changes, page: changes.page ?? 1 });

  const handleStatusAction = (order: StoreOrder) => {
    const status = getStatus(order);
    const nextStatus = getNextOrderStatus(status);
    if (!nextStatus) return;

    const messages: Record<string, string> = { PREPARING: "Start preparing this order?", READY_FOR_PICKUP: "Mark order ready for pickup?", PICKED_UP: "Confirm customer picked up this order?" };
    const confirmed = window.confirm(messages[nextStatus]);
    if (!confirmed) return;

    updateOrderStatusMutation.mutate({ orderId: order.orderId, status: nextStatus });
  };

  const handleCancelOrder = (order: StoreOrder) => {
    const status = getStatus(order);
    if (!canCancelOrder(status)) return;

    const confirmed = window.confirm("Cancel this order?");
    if (!confirmed) return;

    updateOrderStatusMutation.mutate({ orderId: order.orderId, status: "CANCELLED" });
  };

  return (
    <DashboardCard title="Customer orders" description="Review customer pickup orders and their current payment status.">
      {toast ? (
        <div
          className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <div className="sticky top-0 z-10 -mx-5 border-y border-stone-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-stone-800 dark:bg-stone-900/95 lg:top-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_repeat(4,minmax(130px,auto))]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
            <input
              type="search"
              value={filters.search ?? ""}
              onChange={(event) => updateFilter({ search: event.target.value })}
              placeholder="Search order, customer, or phone"
              className="h-10 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
            />
          </label>
          <select
            value={filters.orderStatus ?? ""}
            onChange={(event) => updateFilter({ orderStatus: event.target.value ? (event.target.value as StoreOrderFilters["orderStatus"]) : undefined })}
            aria-label="Filter by order status"
            className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
          >
            <option value="">All order statuses</option>
            {STORE_ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
          <select
            value={filters.paymentStatus ?? ""}
            onChange={(event) => updateFilter({ paymentStatus: event.target.value ? (event.target.value as StoreOrderFilters["paymentStatus"]) : undefined })}
            aria-label="Filter by payment status"
            className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
          >
            <option value="">All payment statuses</option>
            {STORE_PAYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {paymentLabels[status]}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-xs text-stone-500">
            From
            <input
              type="date"
              value={filters.from ?? ""}
              onChange={(event) => updateFilter({ from: event.target.value || undefined })}
              className="h-10 min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-2 text-sm text-stone-700 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-stone-500">
            To
            <input
              type="date"
              value={filters.to ?? ""}
              onChange={(event) => updateFilter({ to: event.target.value || undefined })}
              className="h-10 min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-2 text-sm text-stone-700 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
            />
          </label>
        </div>
      </div>

      {ordersQuery.isLoading ? (
        <div className="mt-4">
          <LoadingSkeleton rows={6} />
        </div>
      ) : null}

      {ordersQuery.isError ? (
        <div className="mt-4 space-y-3">
          <EmptyState title="Unable to load customer orders" description={ordersQuery.error.message} />
          <Button type="button" variant="outline" onClick={() => ordersQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      {!ordersQuery.isLoading && !ordersQuery.isError && orders.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No customer orders found." />
        </div>
      ) : null}

      {!ordersQuery.isLoading && !ordersQuery.isError && orders.length > 0 ? (
        <>
          <div className="mt-4 overflow-x-auto rounded-[1.25rem] border border-stone-200 dark:border-stone-800">
            <table className="min-w-[1100px] w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-[0.12em] text-stone-500 dark:bg-stone-900/70 dark:text-stone-400">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Pickup</th>
                  <th className="px-4 py-3">Order Status</th>
                  <th className="px-4 py-3">Payment Status</th>
                  <th className="px-4 py-3">Grand Total</th>
                  <th className="px-4 py-3">Order Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {orders.map((order) => {
                  const status = getStatus(order);
                  const paymentStatus = order.paymentStatus ?? "PENDING";
                  const nextStatus = getNextOrderStatus(status);
                  const pendingMutation = updateOrderStatusMutation.isPending && updateOrderStatusMutation.variables?.orderId === order.orderId;

                  return (
                    <tr key={order.orderId} className="text-stone-700 dark:text-stone-200">
                      <td className="px-4 py-3 font-semibold text-stone-900 dark:text-stone-50">{order.orderId}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-stone-900 dark:text-stone-50">{getCustomerName(order)}</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">{getCustomerPhone(order)}</p>
                      </td>
                      <td className="px-4 py-3">{isPickupOrder(order) ? <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Pickup</span> : "-"}</td>
                      <td className="px-4 py-3">
                        <ColoredBadge value={status} label={statusLabels[status] ?? status} classes={statusClasses} />
                      </td>
                      <td className="px-4 py-3">
                        <ColoredBadge value={paymentStatus} label={paymentLabels[paymentStatus] ?? paymentStatus} classes={paymentClasses} />
                      </td>
                      <td className="px-4 py-3 font-semibold">₹{order.grandTotal ?? 0}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {nextStatus ? (
                            <Button type="button" size="sm" onClick={() => handleStatusAction(order)} disabled={pendingMutation}>
                              {pendingMutation
                                ? "Updating..."
                                : nextStatus === "PREPARING"
                                  ? "Start Preparing"
                                  : nextStatus === "READY_FOR_PICKUP"
                                    ? "Mark Ready for Pickup"
                                    : <><Check className="mr-1 h-4 w-4" />Order Picked Up</>}
                            </Button>
                          ) : status === "PICKED_UP" || status === "CANCELLED" ? (
                            <span className="text-xs text-stone-500">{status === "PICKED_UP" ? "Completed" : "Cancelled"}</span>
                          ) : null}

                          {canCancelOrder(status) ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                              onClick={() => handleCancelOrder(order)}
                              disabled={pendingMutation}
                            >
                              {pendingMutation ? "Pending..." : "Cancel Order"}
                            </Button>
                          ) : null}

                          <Button type="button" variant="outline" size="sm" onClick={() => router.push(`/store/orders/${encodeURIComponent(order.orderId)}`)}>View</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pagination ? (
            <div className="mt-4">
              <Pagination page={pagination.page} totalPages={totalPages} onPageChange={(page) => updateFilter({ page })} />
            </div>
          ) : null}

          {!pagination && orders.length >= filters.limit ? (
            <div className="mt-4">
              <Pagination page={filters.page} totalPages={totalPages} onPageChange={(page) => updateFilter({ page })} />
            </div>
          ) : null}
        </>
      ) : null}
    </DashboardCard>
  );
}
