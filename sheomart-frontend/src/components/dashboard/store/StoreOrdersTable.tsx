"use client";

import {
  Check,
  Search,
  Eye,
  XCircle,
  Truck,
  Store,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  Printer,
  RotateCcw,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { Pagination } from "@/components/dashboard/Pagination";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { useUpdateOrderStatus } from "@/hooks/use-update-order-status";
import { useStoreOrders } from "@/hooks/use-store-orders";
import { useConfirmOrderPayment } from "@/hooks/use-collect-pickup-payment";
import { ConfirmPaymentModal } from "@/components/dashboard/store/ConfirmPaymentModal";
import { bulkUpdateOrderStatus, type PaymentReceivedMethod } from "@/services/store-orders";
import {
  STORE_ORDER_STATUSES,
  STORE_PAYMENT_STATUSES,
  type StoreOrder,
  type StoreOrderFilters,
} from "@/types/store-order";

interface StoreOrdersTableProps {
  filters: StoreOrderFilters;
  onFiltersChange: (filters: StoreOrderFilters) => void;
  onViewOrder: (order: StoreOrder) => void;
}

const statusLabels: Record<string, string> = {
  ORDER_PLACED: "Order Placed",
  ACCEPTED: "Accepted",
  PREPARING: "Preparing",
  READY_FOR_PICKUP: "Ready for Pickup",
  READY_FOR_DISPATCH: "Ready for Dispatch",
  OUT_FOR_DELIVERY: "Out for Delivery",
  PICKED_UP: "Picked Up",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const paymentLabels: Record<string, string> = {
  PAID: "Paid",
  PENDING: "Pending",
  PARTIALLY_PAID: "Partially Paid",
  FAILED: "Failed",
};

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

const getStatus = (order: StoreOrder) =>
  (order as StoreOrder & { pickupStatus?: string }).pickupStatus ??
  order.orderStatus ??
  order.status ??
  "ORDER_PLACED";

const isPickupOrder = (order: StoreOrder) =>
  (!order.fulfillmentType && !order.deliveryMethod) ||
  [order.fulfillmentType, order.deliveryMethod].some((val) => val?.toLowerCase().includes("pickup"));

type AllowedOrderStatus =
  | "ACCEPTED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "READY_FOR_DISPATCH"
  | "OUT_FOR_DELIVERY"
  | "PICKED_UP"
  | "DELIVERED"
  | "CANCELLED";

const getNextAction = (
  status: string,
  isPickup: boolean
): { label: string; status: AllowedOrderStatus } | null => {
  switch (status) {
    case "ORDER_PLACED":
      return { label: "Accept", status: "ACCEPTED" };
    case "ACCEPTED":
      return { label: "Start Packing", status: "PREPARING" };
    case "PREPARING":
      return isPickup
        ? { label: "Mark Ready", status: "READY_FOR_PICKUP" }
        : { label: "Mark Ready", status: "READY_FOR_DISPATCH" };
    case "READY_FOR_DISPATCH":
      return { label: "Out for Delivery", status: "OUT_FOR_DELIVERY" };
    case "OUT_FOR_DELIVERY":
      return { label: "Delivered", status: "DELIVERED" };
    case "READY_FOR_PICKUP":
      return { label: "Picked Up", status: "PICKED_UP" };
    default:
      return null;
  }
};

const canCancelOrder = (status: string) =>
  status === "ORDER_PLACED" || status === "ACCEPTED" || status === "PREPARING";

const isPaymentCollectionEligible = (order: StoreOrder) => {
  const status = getStatus(order).toUpperCase();
  const paymentStatus = (order.paymentStatus ?? "").toUpperCase();
  const isCompletedStatus = status === "DELIVERED" || status === "PICKED_UP";
  return isCompletedStatus && (paymentStatus === "PENDING" || paymentStatus === "UNPAID");
};

export function StoreOrdersTable({
  filters,
  onFiltersChange,
  onViewOrder,
}: StoreOrdersTableProps) {
  const ordersQuery = useStoreOrders(filters);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [paymentModalOrder, setPaymentModalOrder] = useState<StoreOrder | null>(null);

  const confirmPaymentMutation = useConfirmOrderPayment({
    onSuccess: (_data, variables) => {
      setToast({
        type: "success",
        message: `Payment confirmed for order #${variables.orderId.slice(-8).toUpperCase()}.`,
      });
      setPaymentModalOrder(null);
      void ordersQuery.refetch();
    },
    onError: (error, variables) => {
      setToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : `Unable to record payment for order #${variables.orderId.slice(-8).toUpperCase()}.`,
      });
    },
  });

  const updateOrderStatusMutation = useUpdateOrderStatus({
    onSuccess: (_data, variables) => {
      setToast({
        type: "success",
        message: `Order #${variables.orderId.slice(-8).toUpperCase()} updated.`,
      });
      void ordersQuery.refetch();
    },
    onError: (error, variables) => {
      setToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : `Unable to update order ${variables.orderId}.`,
      });
    },
  });

  const orders = ordersQuery.data?.orders ?? [];
  const pagination = ordersQuery.data?.pagination;
  const totalPages =
    pagination?.totalPages ??
    (orders.length < filters.limit ? filters.page : filters.page + 1);

  const updateFilter = (changes: Partial<StoreOrderFilters>) =>
    onFiltersChange({ ...filters, ...changes, page: changes.page ?? 1 });

  // Selection helpers
  const allSelected =
    orders.length > 0 && orders.every((o) => selectedOrderIds.includes(o.orderId));
  const someSelected = selectedOrderIds.length > 0 && !allSelected;

  const toggleSelect = (orderId: string) => {
    setSelectedOrderIds((current) =>
      current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId]
    );
  };

  const selectAll = (select: boolean) => {
    if (select) {
      setSelectedOrderIds(orders.map((o) => o.orderId));
    } else {
      setSelectedOrderIds([]);
    }
  };

  // Bulk actions
  const handleBulkStatus = async (status: string, label: string) => {
    if (selectedOrderIds.length === 0) return;
    try {
      setIsBulkProcessing(true);
      await bulkUpdateOrderStatus(selectedOrderIds, status);
      setToast({
        type: "success",
        message: `Successfully updated ${selectedOrderIds.length} orders to ${label}.`,
      });
      setSelectedOrderIds([]);
      await ordersQuery.refetch();
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Bulk status update failed.",
      });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handlePrintSlips = () => {
    window.print();
  };

  const handleStatusAction = (order: StoreOrder) => {
    const status = getStatus(order);
    const next = getNextAction(status, isPickupOrder(order));
    if (!next) return;

    updateOrderStatusMutation.mutate({ orderId: order.orderId, status: next.status });
  };

  const handleCancelOrder = (order: StoreOrder) => {
    const status = getStatus(order);
    if (!canCancelOrder(status)) return;

    const confirmed = window.confirm(`Cancel / Reject order #${order.orderId.slice(-8).toUpperCase()}?`);
    if (!confirmed) return;

    updateOrderStatusMutation.mutate({ orderId: order.orderId, status: "CANCELLED" });
  };

  const resetFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit,
      search: undefined,
      orderStatus: undefined,
      paymentStatus: undefined,
      fulfillmentType: "all",
      sortBy: "newest",
      from: undefined,
      to: undefined,
    });
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.orderStatus) ||
    Boolean(filters.paymentStatus) ||
    (filters.fulfillmentType && filters.fulfillmentType !== "all") ||
    (filters.sortBy && filters.sortBy !== "newest") ||
    Boolean(filters.from) ||
    Boolean(filters.to);

  return (
    <>
      <DashboardCard
        title="Store Orders"
        description="Process incoming customer orders, manage packing, track fulfillment, and view details."
      >
      {toast ? (
        <div
          className={`mb-4 flex items-center justify-between rounded-2xl border p-3.5 text-xs font-semibold ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-[11px] underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {/* Bulk Action Bar */}
      {selectedOrderIds.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 dark:border-emerald-500/20">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              {selectedOrderIds.length}
            </span>
            <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
              orders selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleBulkStatus("ACCEPTED", "Accepted")}
              disabled={isBulkProcessing}
              className="h-8 rounded-xl bg-emerald-600 text-xs text-white hover:bg-emerald-700"
            >
              Accept All
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatus("PREPARING", "Preparing")}
              disabled={isBulkProcessing}
              className="h-8 rounded-xl text-xs"
            >
              Mark Packing
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handlePrintSlips}
              className="h-8 rounded-xl text-xs"
            >
              <Printer className="mr-1 h-3.5 w-3.5" />
              Print Slips
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedOrderIds([])}
              className="h-8 rounded-xl text-xs text-stone-500"
            >
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
              <input
                type="search"
                value={filters.search ?? ""}
                onChange={(e) => updateFilter({ search: e.target.value })}
                placeholder="Search by Order ID, customer, phone, or product..."
                className="h-10 w-full rounded-2xl border border-stone-200 bg-white pl-10 pr-4 text-xs outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={filters.orderStatus ?? ""}
              onChange={(e) =>
                updateFilter({
                  orderStatus: e.target.value
                    ? (e.target.value as StoreOrderFilters["orderStatus"])
                    : undefined,
                })
              }
              className="h-9 rounded-full border border-stone-200 bg-white px-3 text-xs font-medium outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
            >
              <option value="">All Statuses</option>
              {STORE_ORDER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {statusLabels[st] || st}
                </option>
              ))}
            </select>

            {/* Payment Filter */}
            <select
              value={filters.paymentStatus ?? ""}
              onChange={(e) =>
                updateFilter({
                  paymentStatus: e.target.value
                    ? (e.target.value as StoreOrderFilters["paymentStatus"])
                    : undefined,
                })
              }
              className="h-9 rounded-full border border-stone-200 bg-white px-3 text-xs font-medium outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
            >
              <option value="">All Payments</option>
              {STORE_PAYMENT_STATUSES.map((pst) => (
                <option key={pst} value={pst}>
                  {paymentLabels[pst] || pst}
                </option>
              ))}
            </select>

            {/* Fulfillment Filter */}
            <select
              value={filters.fulfillmentType ?? "all"}
              onChange={(e) =>
                updateFilter({
                  fulfillmentType: e.target.value as StoreOrderFilters["fulfillmentType"],
                })
              }
              className="h-9 rounded-full border border-stone-200 bg-white px-3 text-xs font-medium outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
            >
              <option value="all">All Types</option>
              <option value="delivery">Delivery</option>
              <option value="pickup">Store Pickup</option>
            </select>

            {/* Sort Filter */}
            <select
              value={filters.sortBy ?? "newest"}
              onChange={(e) =>
                updateFilter({
                  sortBy: e.target.value as StoreOrderFilters["sortBy"],
                })
              }
              className="h-9 rounded-full border border-stone-200 bg-white px-3 text-xs font-medium outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_desc">Highest Value</option>
              <option value="amount_asc">Lowest Value</option>
            </select>

            {hasActiveFilters ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8 rounded-full text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
              >
                <RotateCcw className="mr-1 h-3.5 w-3.5" />
                Reset
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {ordersQuery.isLoading ? (
        <div className="mt-6">
          <LoadingSkeleton rows={6} />
        </div>
      ) : null}

      {/* Error state */}
      {ordersQuery.isError ? (
        <div className="mt-6 space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
          <p>{ordersQuery.error.message || "Unable to load customer orders."}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => ordersQuery.refetch()}
            className="rounded-xl text-xs"
          >
            Retry
          </Button>
        </div>
      ) : null}

      {/* Table view */}
      {!ordersQuery.isLoading && !ordersQuery.isError && orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No orders found"
            description="When customers place orders from your store, they will appear here with live tracking."
          />
        </div>
      ) : null}

      {!ordersQuery.isLoading && !ordersQuery.isError && orders.length > 0 ? (
        <>
          <div className="mt-5 overflow-x-auto rounded-[1.25rem] border border-stone-200 dark:border-stone-800">
            <table className="min-w-[1000px] w-full text-left text-xs">
              <thead className="sticky top-0 z-10 bg-stone-50 uppercase tracking-wider text-stone-500 dark:bg-stone-900/80 dark:text-stone-400">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all orders"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      onChange={(e) => selectAll(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 dark:border-stone-700"
                    />
                  </th>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Fulfillment</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Placed At</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/80 bg-white dark:divide-stone-800/80 dark:bg-stone-950/40">
                {orders.map((order) => {
                  const status = getStatus(order);
                  const isPickup = isPickupOrder(order);
                  const nextAction = getNextAction(status, isPickup);
                  const paymentEligible = isPaymentCollectionEligible(order);
                  const isSelected = selectedOrderIds.includes(order.orderId);
                  const isPendingThis =
                    updateOrderStatusMutation.isPending &&
                    updateOrderStatusMutation.variables?.orderId === order.orderId;

                  const totalItemsCount = (order.orderItems ?? []).reduce(
                    (sum, item) => sum + (item.quantity ?? 1),
                    0
                  );

                  return (
                    <tr
                      key={order.orderId}
                      className="transition-colors hover:bg-stone-50/70 dark:hover:bg-stone-900/40"
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          aria-label={`Select order ${order.orderId}`}
                          checked={isSelected}
                          onChange={() => toggleSelect(order.orderId)}
                          className="h-3.5 w-3.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 dark:border-stone-700"
                        />
                      </td>

                      {/* Order ID */}
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => onViewOrder(order)}
                          className="text-left font-mono font-bold text-stone-900 hover:text-emerald-600 dark:text-stone-100 dark:hover:text-emerald-400"
                        >
                          #{order.orderId.slice(-8).toUpperCase()}
                        </button>
                        <p className="text-[11px] text-stone-400">
                          {order.invoiceNumber ? `Inv: ${order.invoiceNumber}` : "Inv: Pending"}
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-stone-900 dark:text-stone-100">
                            {order.customerName || order.customer?.name || "Customer"}
                          </p>
                          {order.isPlusCustomer || order.customer?.isPlus ? (
                            <span className="rounded-full bg-purple-500/10 px-1.5 py-0.2 text-[10px] font-bold text-purple-600">
                              PLUS
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[11px] text-stone-400">
                          {order.customerMobile || order.customerPhone || order.customer?.mobile || "—"}
                        </p>
                      </td>

                      {/* Fulfillment */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-full border border-stone-200/80 bg-stone-50 px-2 py-0.5 text-[11px] font-medium text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
                          {isPickup ? (
                            <>
                              <Store className="h-3 w-3 text-blue-600" />
                              Pickup
                            </>
                          ) : (
                            <>
                              <Truck className="h-3 w-3 text-emerald-600" />
                              Delivery
                            </>
                          )}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-stone-700 dark:text-stone-300">
                          {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5 font-bold text-stone-900 dark:text-stone-50">
                        <div>₹{(order.grandTotal ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</div>
                        {((order.festivalDiscount ?? 0) > 0 || (order.couponDiscount ?? 0) > 0) ? (
                          <div className="flex flex-col gap-0.5 pt-0.5 text-[10px] font-normal">
                            {(order.couponDiscount ?? 0) > 0 ? (
                              <span className="text-emerald-600 dark:text-emerald-400">
                                🏷️ {order.couponCode || "Coupon"}: -₹{Number(order.couponDiscount).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                              </span>
                            ) : null}
                            {(order.festivalDiscount ?? 0) > 0 ? (
                              <span className="text-amber-600 dark:text-amber-400">
                                ✨ Festival: -₹{Number(order.festivalDiscount).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-3.5">
                        {(order.paymentStatus ?? "").toUpperCase() === "PAID" ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            Paid {order.paymentReceivedMethod ? `(${order.paymentReceivedMethod})` : ""}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={statusLabels[status] || status} />
                      </td>

                      {/* Placed At */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-stone-500 dark:text-stone-400">
                        {formatDate(order.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Next Workflow Action Button */}
                          {nextAction ? (
                            <Button
                              type="button"
                              size="sm"
                              className="h-7 rounded-xl bg-emerald-600 px-2.5 text-xs text-white hover:bg-emerald-700"
                              onClick={() => handleStatusAction(order)}
                              disabled={isPendingThis}
                            >
                              {isPendingThis ? "Updating..." : nextAction.label}
                            </Button>
                          ) : null}

                          {/* Payment Collection Action Button */}
                          {paymentEligible ? (
                            <Button
                              type="button"
                              size="sm"
                              className="h-7 rounded-xl bg-emerald-600 px-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 flex items-center gap-1 shrink-0"
                              onClick={() => setPaymentModalOrder(order)}
                              disabled={confirmPaymentMutation.isPending}
                              title="Collect customer payment"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Collect ₹{(order.grandTotal ?? 0).toLocaleString("en-IN")}
                            </Button>
                          ) : null}

                          {/* View Details Drawer */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                            onClick={() => onViewOrder(order)}
                            title="View order details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          {/* Cancel if eligible */}
                          {canCancelOrder(status) ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-stone-400 hover:text-rose-600"
                              onClick={() => handleCancelOrder(order)}
                              title="Reject / Cancel Order"
                              disabled={isPendingThis}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4">
            <Pagination
              page={filters.page}
              totalPages={totalPages}
              onPageChange={(page) => updateFilter({ page })}
            />
          </div>
        </>
      ) : null}
    </DashboardCard>

    {paymentModalOrder ? (
      <ConfirmPaymentModal
        isOpen={Boolean(paymentModalOrder)}
        onClose={() => setPaymentModalOrder(null)}
        onConfirm={async (method: PaymentReceivedMethod) => {
          await confirmPaymentMutation.mutateAsync({
            orderId: paymentModalOrder.orderId,
            paymentMethod: method,
          });
        }}
        orderId={paymentModalOrder.orderId}
        customerName={paymentModalOrder.customerName || paymentModalOrder.customer?.name}
        grandTotal={paymentModalOrder.grandTotal ?? 0}
        isPending={confirmPaymentMutation.isPending}
      />
    ) : null}
  </>
  );
}
