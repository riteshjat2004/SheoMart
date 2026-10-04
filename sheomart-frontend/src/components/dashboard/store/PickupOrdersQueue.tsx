"use client";

import { useState } from "react";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Search,
  IndianRupee,
  Phone,
  User,
  ArrowRight,
  PackageCheck,
  Package,
  Printer,
  X,
  AlertTriangle,
  BadgeAlert,
  RefreshCw,
  AlertCircle,
  Calendar,
  CheckSquare,
  Square,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useStoreOrders } from "@/hooks/use-store-orders";
import { useUpdateOrderStatus } from "@/hooks/use-update-order-status";
import { useConfirmOrderPayment } from "@/hooks/use-collect-pickup-payment";
import { ConfirmPaymentModal } from "@/components/dashboard/store/ConfirmPaymentModal";
import type { PaymentReceivedMethod } from "@/services/store-orders";
import type { StoreOrder } from "@/types/store-order";

const money = (val?: number) => `₹${(val ?? 0).toLocaleString("en-IN")}`;

export function PickupOrdersQueue() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "ready" | "pending" | "collected">("all");
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const [paymentOrder, setPaymentOrder] = useState<StoreOrder | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const ordersQuery = useStoreOrders({
    page: 1,
    limit: 100,
    fulfillmentType: "pickup",
  });

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const updateStatusMutation = useUpdateOrderStatus({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["store-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["seller-analytics"] });
      void queryClient.invalidateQueries({ queryKey: ["daily-cash-summary"] });
      showToast("success", "Order status updated successfully.");
    },
    onError: (err) => {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to update order status."
      );
    },
  });

  const confirmPaymentMutation = useConfirmOrderPayment({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["store-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["seller-analytics"] });
      void queryClient.invalidateQueries({ queryKey: ["daily-cash-summary"] });
      showToast("success", "Payment recorded and order handed over to customer.");
      setIsPaymentModalOpen(false);
      setPaymentOrder(null);
      setSelectedOrder(null);
    },
    onError: (err) => {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to record payment."
      );
    },
  });

  const allOrders = ordersQuery.data?.orders ?? [];

  const pickupOrders = allOrders.filter((o) => {
    const isPickup =
      o.fulfillmentType === "pickup" ||
      o.deliveryMethod === "pickup" ||
      o.deliveryMethod === "store_pickup" ||
      Boolean(o.pickupSlot) ||
      Boolean(o.pickupStatus);

    if (!isPickup) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = o.orderId.toLowerCase().includes(q);
      const matchName =
        o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q);
      const matchPhone =
        o.shippingAddress?.mobile?.toLowerCase().includes(q) ||
        o.customerMobile?.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone) return false;
    }

    const currentStatus = o.pickupStatus || o.status;

    if (filter === "ready") return currentStatus === "READY_FOR_PICKUP";
    if (filter === "pending")
      return (
        currentStatus === "CONFIRMED" ||
        currentStatus === "PROCESSING" ||
        currentStatus === "PREPARING" ||
        currentStatus === "ORDER_PLACED" ||
        currentStatus === "ACCEPTED"
      );
    if (filter === "collected")
      return currentStatus === "DELIVERED" || currentStatus === "PICKED_UP";
    return true;
  });

  const handleMarkCollected = async (orderId: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        status: "DELIVERED",
      });
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder(null);
      }
    } catch {
      // handled in mutation onError
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        status: "READY_FOR_PICKUP",
      });
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: "READY_FOR_PICKUP", pickupStatus: "READY_FOR_PICKUP" } : null
        );
      }
    } catch {
      // handled in mutation onError
    }
  };

  const handleHandoverClick = (order: StoreOrder) => {
    if (
      order.paymentStatus !== "PAID" &&
      (order.paymentMethod === "PAY_AT_PICKUP" ||
        order.paymentStatus === "UNPAID" ||
        order.paymentStatus === "PENDING")
    ) {
      setPaymentOrder(order);
      setIsPaymentModalOpen(true);
    } else {
      void handleMarkCollected(order.orderId);
    }
  };

  const toggleItemCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const readyCount = allOrders.filter(
    (o) => (o.pickupStatus || o.status) === "READY_FOR_PICKUP"
  ).length;
  const pendingCount = allOrders.filter((o) => {
    const s = o.pickupStatus || o.status;
    return (
      s === "ORDER_PLACED" ||
      s === "ACCEPTED" ||
      s === "PROCESSING" ||
      s === "PREPARING" ||
      s === "CONFIRMED"
    );
  }).length;

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toast ? (
        <div
          className={`flex items-center justify-between rounded-xl border p-3 text-xs font-medium transition-all ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {/* Search & Quick Filters Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search pickup orders by customer name, phone, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-xs text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => ordersQuery.refetch()}
            disabled={ordersQuery.isFetching}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${ordersQuery.isFetching ? "animate-spin" : ""}`} />
            Sync Orders
          </Button>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filter === "all"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300"
              }`}
            >
              All Pickup ({pickupOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("ready")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${
                filter === "ready"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300"
              }`}
            >
              Ready ({readyCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("pending")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${
                filter === "pending"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300"
              }`}
            >
              Pending Prep ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("collected")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filter === "collected"
                  ? "bg-stone-700 text-white shadow-xs dark:bg-stone-600"
                  : "border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300"
              }`}
            >
              Collected
            </button>
          </div>
        </div>
      </div>

      {/* Orders Queue Cards */}
      <div className="space-y-3">
        {ordersQuery.isLoading ? (
          <div className="p-8 text-center text-xs text-stone-400">Loading pickup orders...</div>
        ) : pickupOrders.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center dark:border-stone-800 dark:bg-stone-900">
            <ShoppingBag className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-700 mb-3" />
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              No pickup orders found
            </h4>
            <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1">
              When shoppers choose &ldquo;Self-Pickup / Pay at Store&rdquo; at checkout, their orders
              will synchronize and queue here for counter preparation &amp; handover.
            </p>
          </div>
        ) : (
          pickupOrders.map((order) => {
            const currentStatus = order.pickupStatus || order.status;
            const isDelivered = currentStatus === "DELIVERED" || currentStatus === "PICKED_UP";
            const isCancelled = currentStatus === "CANCELLED";
            const isReady = currentStatus === "READY_FOR_PICKUP";
            const isUnpaid =
              order.paymentStatus !== "PAID" &&
              (order.paymentMethod === "PAY_AT_PICKUP" ||
                order.paymentStatus === "UNPAID" ||
                order.paymentStatus === "PENDING");

            return (
              <div
                key={order.orderId}
                className={`rounded-2xl border bg-white p-4 shadow-sm dark:bg-stone-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition hover:border-emerald-300 dark:hover:border-emerald-800/60 ${
                  isCancelled
                    ? "border-stone-200/60 opacity-60 dark:border-stone-800"
                    : isReady
                    ? "border-blue-300/80 bg-blue-50/20 dark:border-blue-900/60"
                    : "border-stone-200 dark:border-stone-800"
                }`}
              >
                {/* Left Card Info */}
                <div
                  className="flex items-start gap-3.5 cursor-pointer flex-1"
                  onClick={() => {
                    setSelectedOrder(order);
                    setCheckedItems({});
                  }}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      isCancelled
                        ? "bg-stone-100 text-stone-400 dark:bg-stone-800"
                        : isDelivered
                        ? "bg-stone-100 text-stone-500 dark:bg-stone-800"
                        : isReady
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 ring-2 ring-blue-500/20"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400"
                    }`}
                  >
                    <ShoppingBag className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-stone-900 dark:text-stone-100 text-xs">
                        #{order.orderId.slice(-8).toUpperCase()}
                      </span>
                      <StatusBadge status={currentStatus || "CONFIRMED"} />
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                          order.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}
                      >
                        {order.paymentStatus === "PAID" ? "Paid Online" : "Pay at Shop"}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
                      <span className="flex items-center gap-1 font-semibold text-stone-800 dark:text-stone-200">
                        <User className="h-3 w-3 text-stone-400" />
                        {order.shippingAddress?.fullName || order.customerName || "Customer"}
                      </span>
                      {(order.shippingAddress?.mobile || order.customerMobile) && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-stone-400" />
                          {order.shippingAddress?.mobile || order.customerMobile}
                        </span>
                      )}
                      {(order.pickupSlot || order.deliverySlot) && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Clock className="h-3 w-3" />
                          Slot: {order.pickupSlot || order.deliverySlot}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-stone-100 sm:border-t-0 pt-2 sm:pt-0 dark:border-stone-800">
                  <div
                    className="text-right cursor-pointer"
                    onClick={() => {
                      setSelectedOrder(order);
                      setCheckedItems({});
                    }}
                  >
                    <p className="text-sm font-bold text-stone-900 dark:text-stone-50">
                      {money(order.grandTotal)}
                    </p>
                    <p className="text-[10px] text-stone-400 hover:text-emerald-600 underline">
                      {order.orderItems?.length || 1} items (Packing Details)
                    </p>
                  </div>

                  {/* Actions for Cancelled orders */}
                  {isCancelled && (
                    <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                      Cancelled
                    </span>
                  )}

                  {/* Actions for Active Pickup orders */}
                  {!isDelivered && !isCancelled && (
                    <div className="flex items-center gap-2">
                      {!isReady && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updateStatusMutation.isPending}
                          onClick={() => handleMarkReady(order.orderId)}
                          className="h-8 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-900/60 dark:hover:bg-blue-950/40"
                        >
                          Mark Ready
                        </Button>
                      )}
                      <Button
                        size="sm"
                        disabled={updateStatusMutation.isPending || confirmPaymentMutation.isPending}
                        onClick={() => handleHandoverClick(order)}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <PackageCheck className="mr-1 h-3.5 w-3.5" />
                        {isUnpaid ? "Collect & Hand Over" : "Hand Over"}
                      </Button>
                    </div>
                  )}

                  {isDelivered && !isCancelled && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      Handed Over
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Order Detail & Packing Modal ────────────────────────────────────── */}
      {selectedOrder && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 p-4 sm:px-6 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    Order #{selectedOrder.orderId.slice(-8).toUpperCase()}
                    <StatusBadge
                      status={selectedOrder.pickupStatus || selectedOrder.status || "CONFIRMED"}
                    />
                  </h3>
                  <p className="text-[11px] text-stone-400">Counter Packing &amp; Handover Slip</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:px-6 space-y-4">
              {/* Customer & Slot Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/40">
                  <span className="text-stone-400 block mb-0.5">Customer</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200 block">
                    {selectedOrder.shippingAddress?.fullName ||
                      selectedOrder.customerName ||
                      "Customer"}
                  </span>
                  {(selectedOrder.shippingAddress?.mobile || selectedOrder.customerMobile) && (
                    <span className="text-stone-500 mt-0.5 block">
                      {selectedOrder.shippingAddress?.mobile || selectedOrder.customerMobile}
                    </span>
                  )}
                </div>

                <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/40">
                  <span className="text-stone-400 block mb-0.5">Pickup Slot</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 block">
                    {selectedOrder.pickupSlot || selectedOrder.deliverySlot || "Standard Store Hours"}
                  </span>
                  <span className="text-stone-500 mt-0.5 block">
                    {selectedOrder.createdAt
                      ? new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                </div>
              </div>

              {/* Items Packing Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Items to Pack ({selectedOrder.orderItems?.length || 0})
                  </h4>
                  <span className="text-[10px] text-stone-400">
                    Click item to tick packing checklist
                  </span>
                </div>

                <div className="divide-y divide-stone-100 dark:divide-stone-800 border rounded-xl overflow-hidden dark:border-stone-800">
                  {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                    selectedOrder.orderItems.map((item, idx) => {
                      const isChecked = Boolean(checkedItems[item.orderItemId || String(idx)]);
                      return (
                        <div
                          key={item.orderItemId || idx}
                          onClick={() => toggleItemCheck(item.orderItemId || String(idx))}
                          className={`flex items-center justify-between p-3 text-xs cursor-pointer transition ${
                            isChecked
                              ? "bg-emerald-50/50 dark:bg-emerald-950/20"
                              : "hover:bg-stone-50 dark:hover:bg-stone-800/40"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {isChecked ? (
                              <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Square className="h-4 w-4 text-stone-400 shrink-0" />
                            )}
                            <div>
                              <span
                                className={`font-semibold text-stone-800 dark:text-stone-200 ${
                                  isChecked ? "line-through text-stone-400" : ""
                                }`}
                              >
                                {item.name}
                              </span>
                              {item.sku && (
                                <span className="block text-[10px] text-stone-400">
                                  SKU: {item.sku}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-stone-900 dark:text-stone-100">
                              Qty: {item.quantity}
                            </span>
                            <span className="block text-[10px] text-stone-500">
                              {money((item.price ?? 0) * (item.quantity ?? 1))}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 text-xs text-stone-400 text-center">
                      No order items breakdown available
                    </div>
                  )}
                </div>
              </div>

              {/* Order Bill Summary */}
              <div className="rounded-xl border border-stone-200/60 bg-stone-50/50 p-3 dark:border-stone-800 dark:bg-stone-800/20 text-xs space-y-1.5">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span>
                  <span>{money(selectedOrder.subtotal ?? selectedOrder.grandTotal)}</span>
                </div>
                {selectedOrder.discount ? (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-{money(selectedOrder.discount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between font-bold text-sm text-stone-900 dark:text-stone-100 pt-1 border-t border-stone-200 dark:border-stone-800">
                  <span>Amount to Collect</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-black">
                    {money(selectedOrder.grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-stone-100 p-4 sm:px-6 dark:border-stone-800 flex flex-wrap gap-2.5 bg-stone-50/50 dark:bg-stone-900/50">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs"
              >
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                Print Slip
              </Button>

              {selectedOrder.status !== "DELIVERED" &&
                selectedOrder.status !== "PICKED_UP" &&
                selectedOrder.status !== "CANCELLED" && (
                  <>
                    {(selectedOrder.pickupStatus || selectedOrder.status) !==
                      "READY_FOR_PICKUP" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={updateStatusMutation.isPending}
                        onClick={() => handleMarkReady(selectedOrder.orderId)}
                        className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        Mark Ready
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      disabled={
                        updateStatusMutation.isPending || confirmPaymentMutation.isPending
                      }
                      onClick={() => handleHandoverClick(selectedOrder)}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white ml-auto"
                    >
                      <PackageCheck className="mr-1.5 h-3.5 w-3.5" />
                      {selectedOrder.paymentStatus !== "PAID"
                        ? "Collect Payment & Hand Over"
                        : "Hand Over Order"}
                    </Button>
                  </>
                )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOrder(null)}
                className="text-xs ml-auto sm:ml-0"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Collect Customer Payment Modal */}
      {paymentOrder && (
        <ConfirmPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setPaymentOrder(null);
          }}
          onConfirm={async (method: PaymentReceivedMethod) => {
            await confirmPaymentMutation.mutateAsync({
              orderId: paymentOrder.orderId,
              paymentMethod: method,
            });
          }}
          orderId={paymentOrder.orderId}
          customerName={
            paymentOrder.shippingAddress?.fullName || paymentOrder.customerName || undefined
          }
          grandTotal={paymentOrder.grandTotal ?? 0}
          isPending={confirmPaymentMutation.isPending}
        />
      )}
    </div>
  );
}
