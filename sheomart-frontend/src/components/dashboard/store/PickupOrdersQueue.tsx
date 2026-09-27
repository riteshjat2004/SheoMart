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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useStoreOrders } from "@/hooks/use-store-orders";
import { useUpdateOrderStatus } from "@/hooks/use-update-order-status";
import type { StoreOrder } from "@/types/store-order";

const money = (val?: number) => `₹${(val ?? 0).toLocaleString("en-IN")}`;

export function PickupOrdersQueue() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "ready" | "pending" | "collected">("all");

  const ordersQuery = useStoreOrders({
    page: 1,
    limit: 50,
    fulfillmentType: "pickup",
  });

  const updateStatusMutation = useUpdateOrderStatus();
  const allOrders = ordersQuery.data?.orders ?? [];

  const pickupOrders = allOrders.filter((o) => {
    const isPickup =
      o.fulfillmentType === "pickup" ||
      o.deliveryMethod === "pickup" ||
      Boolean(o.deliverySlot);

    if (!isPickup) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = o.orderId.toLowerCase().includes(q);
      const matchName = o.shippingAddress?.fullName?.toLowerCase().includes(q);
      const matchPhone = o.shippingAddress?.mobile?.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone) return false;
    }

    if (filter === "ready") return o.status === "READY_FOR_PICKUP";
    if (filter === "pending") return o.status === "CONFIRMED" || o.status === "PROCESSING" || o.status === "PREPARING";
    if (filter === "collected") return o.status === "DELIVERED" || o.status === "PICKED_UP";
    return true;
  });

  const handleMarkCollected = async (orderId: string) => {
    await updateStatusMutation.mutateAsync({
      orderId,
      status: "DELIVERED",
    });
  };

  const handleMarkReady = async (orderId: string) => {
    await updateStatusMutation.mutateAsync({
      orderId,
      status: "READY_FOR_PICKUP",
    });
  };

  return (
    <div className="space-y-4">
      {/* Search & Quick Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search pickup orders by customer name, phone, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              filter === "all"
                ? "bg-emerald-600 text-white shadow-xs"
                : "border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300"
            }`}
          >
            All Pickup ({allOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("ready")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              filter === "ready"
                ? "bg-emerald-600 text-white shadow-xs"
                : "border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300"
            }`}
          >
            Ready for Pickup
          </button>
          <button
            type="button"
            onClick={() => setFilter("pending")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              filter === "pending"
                ? "bg-emerald-600 text-white shadow-xs"
                : "border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300"
            }`}
          >
            Pending Prep
          </button>
          <button
            type="button"
            onClick={() => setFilter("collected")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              filter === "collected"
                ? "bg-emerald-600 text-white shadow-xs"
                : "border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300"
            }`}
          >
            Collected
          </button>
        </div>
      </div>

      {/* Orders Queue Cards */}
      <div className="space-y-3">
        {pickupOrders.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center dark:border-stone-800 dark:bg-stone-900">
            <ShoppingBag className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-700 mb-3" />
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">No pickup orders</h4>
            <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1">
              When shoppers choose "Self-Pickup / Pay at Store", their orders will queue here for counter fulfillment.
            </p>
          </div>
        ) : (
          pickupOrders.map((order) => {
            const isDelivered = order.status === "DELIVERED" || order.status === "PICKED_UP";
            const isReady = order.status === "READY_FOR_PICKUP";

            return (
              <div
                key={order.orderId}
                className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    isDelivered
                      ? "bg-stone-100 text-stone-500 dark:bg-stone-800"
                      : isReady
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 ring-2 ring-blue-500/20"
                      : "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                  }`}>
                    <ShoppingBag className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-stone-900 dark:text-stone-100 text-xs">
                        #{order.orderId.slice(-8).toUpperCase()}
                      </span>
                      <StatusBadge status={order.status || "CONFIRMED"} />
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                        order.paymentStatus === "PAID"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}>
                        {order.paymentStatus === "PAID" ? "Paid Online" : "Pay at Shop"}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
                      <span className="flex items-center gap-1 font-semibold text-stone-800 dark:text-stone-200">
                        <User className="h-3 w-3 text-stone-400" />
                        {order.shippingAddress?.fullName || "Customer"}
                      </span>
                      {order.shippingAddress?.mobile && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-stone-400" />
                          {order.shippingAddress.mobile}
                        </span>
                      )}
                      {order.deliverySlot && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Clock className="h-3 w-3" />
                          Slot: {order.deliverySlot}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-stone-100 sm:border-t-0 pt-2 sm:pt-0 dark:border-stone-800">
                  <div className="text-right">
                    <p className="text-sm font-bold text-stone-900 dark:text-stone-50">
                      {money(order.grandTotal)}
                    </p>
                    <p className="text-[10px] text-stone-400">
                      {order.orderItems?.length || 1} items
                    </p>
                  </div>

                  {!isDelivered && (
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
                        disabled={updateStatusMutation.isPending}
                        onClick={() => handleMarkCollected(order.orderId)}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <PackageCheck className="mr-1 h-3.5 w-3.5" />
                        Collected
                      </Button>
                    </div>
                  )}

                  {isDelivered && (
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
    </div>
  );
}
