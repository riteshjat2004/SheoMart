"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Clock3,
  MapPin,
  RefreshCw,
  Store,
  Truck,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  ShoppingBag,
  Printer,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { OrderStatusTimeline } from "@/components/profile/OrderStatusTimeline";
import { useOrders, useCancelCustomerOrder } from "@/hooks/use-orders";
import { useAddCartItem } from "@/hooks/use-cart";
import type { OrderRecord } from "@/services/orders";

const getOrderStatusLabel = (status?: string): string => {
  const labels: Record<string, string> = {
    ORDER_PLACED: "Order Placed",
    ACCEPTED: "Accepted",
    PREPARING: "Packing / Preparing",
    READY_FOR_PICKUP: "Ready for Pickup",
    READY_FOR_DISPATCH: "Ready for Dispatch",
    OUT_FOR_DELIVERY: "Out for Delivery",
    PICKED_UP: "Picked Up",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };
  return labels[status ?? ""] ?? "Order Placed";
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Delivered":
    case "Picked Up":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "Out for Delivery":
    case "Ready for Pickup":
    case "Ready for Dispatch":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300";
    case "Packing / Preparing":
    case "Accepted":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300";
    case "Cancelled":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300";
    default:
      return "border-stone-200 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300";
  }
};

type LiveOrder = OrderRecord & { storeName?: string };

export default function OrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const ordersQuery = useOrders();
  const cancelOrderMutation = useCancelCustomerOrder();
  const addCartItem = useAddCartItem();

  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const orders = (Array.isArray(ordersQuery.data) ? ordersQuery.data : []) as LiveOrder[];

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const st = (o.pickupStatus || o.status || "ORDER_PLACED").toUpperCase();
      const isCancelled = st === "CANCELLED";
      const isCompleted = st === "DELIVERED" || st === "PICKED_UP";
      const isActive = !isCancelled && !isCompleted;

      if (activeTab === "active" && !isActive) return false;
      if (activeTab === "completed" && !isCompleted) return false;
      if (activeTab === "cancelled" && !isCancelled) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesId = o.orderId?.toLowerCase().includes(q);
        const matchesStore = o.storeName?.toLowerCase().includes(q);
        const matchesItem = o.orderItems?.some((i) => i.name?.toLowerCase().includes(q));
        if (!matchesId && !matchesStore && !matchesItem) return false;
      }

      return true;
    });
  }, [orders, activeTab, search]);

  const handleCancelOrder = (orderId?: string) => {
    if (!orderId) return;
    const confirmed = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmed) return;

    setFeedback(null);
    cancelOrderMutation.mutate(
      { orderId, reason: "Cancelled by customer before acceptance" },
      {
        onSuccess: () => {
          setFeedback("Order cancelled successfully.");
        },
        onError: (err) => {
          setFeedback(err instanceof Error ? err.message : "Failed to cancel order.");
        },
      }
    );
  };

  const handleReorder = async (order: LiveOrder) => {
    if (!order.orderItems || order.orderItems.length === 0) return;
    setFeedback(null);

    let addedCount = 0;
    for (const item of order.orderItems) {
      if (item.productId) {
        try {
          await addCartItem.mutateAsync({
            productId: item.productId,
            quantity: item.quantity || 1,
          });
          addedCount++;
        } catch {
          // continue
        }
      }
    }

    if (addedCount > 0) {
      setFeedback(`Reordered ${addedCount} item(s)! View in your cart.`);
      router.push("/cart");
    } else {
      setFeedback("Unable to reorder items. Products may be currently unavailable.");
    }
  };

  const handlePrintSlip = (orderId?: string) => {
    window.print();
  };

  return (
    <PageWrapper>
      <Section className="space-y-6 py-6 sm:py-8 lg:py-10">
        <Container className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
                Purchase History
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-50">
                Your Orders ({orders.length})
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void queryClient.invalidateQueries({ queryKey: ["customer-orders"] })}
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Refresh
              </Button>
              <Button asChild size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">
                <Link href="/explore">Order More</Link>
              </Button>
            </div>
          </div>

          {feedback && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-300">
              {feedback}
            </div>
          )}

          {/* Search & Filter Tabs */}
          <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-stone-800 dark:bg-zinc-900">
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: "All Orders" },
                { id: "active", label: "Active Orders" },
                { id: "completed", label: "Completed" },
                { id: "cancelled", label: "Cancelled" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    activeTab === tab.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-stone-50 text-stone-600 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or item..."
              className="w-full sm:w-64 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
          </div>

          {/* Orders List */}
          {ordersQuery.isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 animate-pulse rounded-[1.75rem] bg-stone-100 dark:bg-stone-800" />
              ))}
            </div>
          ) : ordersQuery.isError ? (
            <ErrorState
              message={
                ordersQuery.error instanceof Error
                  ? ordersQuery.error.message
                  : "Unable to load your orders."
              }
            />
          ) : filteredOrders.length ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const rawStatus = order.pickupStatus || order.status || "ORDER_PLACED";
                const statusLabel = getOrderStatusLabel(rawStatus);
                const isCancellable = rawStatus === "ORDER_PLACED" || rawStatus === "CONFIRMED";
                const isDelivery =
                  order.fulfillmentType === "delivery" || order.deliveryMethod === "delivery";

                return (
                  <article
                    key={order.orderId}
                    className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-stone-800 dark:bg-zinc-900"
                  >
                    {/* Top Row: IDs, Store, Status */}
                    <div className="flex flex-col gap-3 border-b border-stone-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-stone-800">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-bold text-stone-900 dark:text-stone-50">
                          Order #{order.orderId?.slice(-8).toUpperCase() ?? "PENDING"}
                        </span>
                        <span className="text-xs text-stone-400">•</span>
                        <span className="text-xs text-stone-500">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Recently"}
                        </span>
                        <span className="text-xs text-stone-400">•</span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 dark:text-stone-300">
                          <Store className="h-3.5 w-3.5 text-emerald-600" />
                          {order.store?.storeName ?? order.storeName ?? "SheoMart Local Store"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${getStatusBadge(
                            statusLabel
                          )}`}
                        >
                          {statusLabel}
                        </span>
                        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                          {isDelivery ? "Doorstep Delivery" : "Store Pickup"}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Items & Address summary */}
                    <div className="grid gap-4 py-4 sm:grid-cols-[1fr_auto]">
                      {/* Items */}
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                          Items Ordered
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-stone-700 dark:text-stone-300">
                          {(order.orderItems ?? []).map((item, idx) => (
                            <span
                              key={idx}
                              className="rounded-lg bg-stone-50 px-2.5 py-1 border border-stone-100 dark:border-stone-800 dark:bg-stone-950"
                            >
                              {item.name} × {item.quantity} (₹{item.totalPrice ?? (item.price ?? 0) * (item.quantity ?? 1)})
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Total */}
                      <div className="text-right sm:border-l sm:border-stone-100 sm:pl-6 dark:border-stone-800">
                        <p className="text-xs text-stone-500">Grand Total</p>
                        <p className="text-xl font-extrabold text-stone-900 dark:text-stone-50">
                          ₹{order.grandTotal ?? 0}
                        </p>
                        <p className="text-[11px] font-medium text-emerald-600">
                          {order.paymentStatus === "PAID" ? "Payment Received" : "Cash / UPI at Pickup"}
                        </p>
                      </div>
                    </div>

                    {/* Bottom: Action Buttons Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3 dark:border-stone-800">
                      <div className="flex items-center gap-2">
                        {isCancellable && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelOrder(order.orderId)}
                            disabled={cancelOrderMutation.isPending}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950/40"
                          >
                            <XCircle className="mr-1.5 h-3.5 w-3.5" />
                            Cancel Order
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleReorder(order)}
                          className="text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                        >
                          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                          Reorder Items
                        </Button>

                        <button
                          type="button"
                          onClick={() => handlePrintSlip(order.orderId)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          Invoice
                        </button>
                      </div>

                      <Button
                        asChild
                        size="sm"
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <Link href={`/orders/${order.orderId}`}>
                          Track Order Details
                          <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <EmptyState
                title="No orders found"
                description={
                  search || activeTab !== "all"
                    ? "Try adjusting your filters or search keyword."
                    : "You haven't placed any grocery orders yet. Start your first delivery!"
                }
              />
              <div className="flex justify-center">
                <Button asChild className="rounded-full bg-emerald-600 text-white">
                  <Link href="/explore">Shop Groceries</Link>
                </Button>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </PageWrapper>
  );
}
