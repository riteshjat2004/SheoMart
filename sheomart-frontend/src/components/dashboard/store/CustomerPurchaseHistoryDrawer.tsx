"use client";

import { useState } from "react";
import { X, ShoppingBag, Receipt, ArrowUpDown, PackageCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Pagination } from "@/components/dashboard/Pagination";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useStoreCustomerOrders } from "@/hooks/use-store-customers";
import type { StoreCustomer } from "@/types/store-customer";

interface CustomerPurchaseHistoryDrawerProps {
  customer: StoreCustomer;
  onClose: () => void;
}

const money = (val?: number) => `₹${(val ?? 0).toLocaleString("en-IN")}`;
const formatDate = (val?: string | null) =>
  val
    ? new Date(val).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

export function CustomerPurchaseHistoryDrawer({
  customer,
  onClose,
}: CustomerPurchaseHistoryDrawerProps) {
  const [page, setPage] = useState(1);
  const [orderStatus, setOrderStatus] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const ordersQuery = useStoreCustomerOrders(customer.customerId, {
    page,
    limit: 8,
    orderStatus: orderStatus || undefined,
    sortBy: sortBy === "amount_desc" ? "amount_desc" : sortBy === "amount_asc" ? "amount_asc" : undefined,
  });

  const orders = ordersQuery.data?.orders ?? [];
  const pagination = ordersQuery.data?.pagination;

  return (
    <>
      <button
        type="button"
        aria-label="Close purchase history"
        className="fixed inset-0 z-40 bg-stone-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside
        className="fixed inset-x-0 bottom-0 z-50 max-h-[94vh] overflow-y-auto rounded-t-2xl border border-stone-200 bg-stone-50 p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-950 sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:w-[min(100%,44rem)] sm:rounded-none sm:border-y-0 sm:border-r-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-history-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <Receipt className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
                  Seller Store Purchase History
                </p>
                <h2 id="purchase-history-title" className="text-xl font-bold text-stone-900 dark:text-stone-50">
                  {customer.name || "Customer"}&apos;s Orders
                </h2>
              </div>
            </div>
            <p className="mt-1 text-xs text-stone-500">
              Showing orders placed exclusively at your store • {customer.mobile || customer.email}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close drawer">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Filter bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="history-status-filter" className="text-xs font-medium text-stone-500">
              Status:
            </label>
            <select
              id="history-status-filter"
              value={orderStatus}
              onChange={(e) => {
                setOrderStatus(e.target.value);
                setPage(1);
              }}
              aria-label="Filter orders by status"
              className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs text-stone-700 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
            >
              <option value="">All Statuses</option>
              <option value="DELIVERED">Delivered</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="READY_FOR_PICKUP">Ready for Pickup</option>
              <option value="READY_FOR_DISPATCH">Ready for Dispatch</option>
              <option value="PREPARING">Preparing</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="ORDER_PLACED">Order Placed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="history-sort-select" className="text-xs font-medium text-stone-500 flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3" /> Sort:
            </label>
            <select
              id="history-sort-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              aria-label="Sort purchase history"
              className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs text-stone-700 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
            >
              <option value="recent">Newest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4">
          {ordersQuery.isLoading ? <LoadingSkeleton rows={5} /> : null}

          {ordersQuery.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-900/60 dark:bg-red-950/30">
              <AlertCircle className="mx-auto h-6 w-6 text-red-600 dark:text-red-400" />
              <p className="mt-2 text-sm font-semibold text-red-800 dark:text-red-300">
                Failed to load orders
              </p>
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {ordersQuery.error.message}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => ordersQuery.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : null}

          {!ordersQuery.isLoading && !ordersQuery.isError && orders.length === 0 ? (
            <EmptyState
              title="No orders found"
              description={
                orderStatus
                  ? `No orders matching status "${orderStatus}".`
                  : "This customer has not placed any orders at your store yet."
              }
            />
          ) : null}

          {!ordersQuery.isLoading && !ordersQuery.isError && orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3 dark:border-stone-800/80">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        #{order.orderId.slice(-8).toUpperCase()}
                      </span>
                      {order.invoiceNumber ? (
                        <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500 dark:bg-stone-800">
                          Inv: {order.invoiceNumber}
                        </span>
                      ) : null}
                      <span className="rounded bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300 capitalize">
                        {order.fulfillmentType || "Delivery"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={order.status} />
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          order.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Snapshot */}
                  <div className="mt-3 space-y-1.5">
                    {order.orderItems?.map((item) => (
                      <div
                        key={item.orderItemId || item.productId}
                        className="flex items-center justify-between text-xs text-stone-700 dark:text-stone-300"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <ShoppingBag className="h-3.5 w-3.5 flex-shrink-0 text-stone-400" />
                          <span className="truncate font-medium">{item.name}</span>
                          <span className="text-[11px] text-stone-400">×{item.quantity}</span>
                        </div>
                        <span className="font-semibold whitespace-nowrap">
                          {money(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Summary Footer */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 text-xs dark:border-stone-800">
                    <span className="text-stone-400">
                      {formatDate(order.createdAt)} • {order.paymentMethod || "COD"}
                    </span>
                    <div className="flex items-center gap-3">
                      {order.couponDiscount && order.couponDiscount > 0 ? (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          Saved {money(order.couponDiscount)} {order.couponCode ? `(${order.couponCode})` : ""}
                        </span>
                      ) : null}
                      <span className="text-sm font-bold text-stone-900 dark:text-stone-50">
                        Total: {money(order.grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {pagination && pagination.totalPages > 1 ? (
            <div className="pt-2">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}
