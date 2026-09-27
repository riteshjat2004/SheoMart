"use client";

import { useMemo, useState } from "react";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  XCircle,
  IndianRupee,
  TrendingUp,
  Percent,
  Layers,
} from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StoreOrdersTable } from "@/components/dashboard/store/StoreOrdersTable";
import { OrderDetailsDrawer } from "@/components/dashboard/store/OrderDetailsDrawer";
import { useStoreOrders } from "@/hooks/use-store-orders";
import { useUpdateOrderStatus } from "@/hooks/use-update-order-status";
import type { StoreOrder, StoreOrderFilters } from "@/types/store-order";

const PAGE_SIZE = 10;

export default function StoreOrdersPage() {
  const [filters, setFilters] = useState<StoreOrderFilters>({
    page: 1,
    limit: PAGE_SIZE,
    fulfillmentType: "all",
    sortBy: "newest",
  });

  const [viewingOrder, setViewingOrder] = useState<StoreOrder | null>(null);

  const ordersQuery = useStoreOrders(filters);
  const orders = ordersQuery.data?.orders ?? [];
  const backendSummary = ordersQuery.data?.summary;

  const updateOrderStatusMutation = useUpdateOrderStatus({
    onSuccess: async (_data, variables) => {
      await ordersQuery.refetch();
      if (viewingOrder && viewingOrder.orderId === variables.orderId) {
        setViewingOrder((prev) =>
          prev ? { ...prev, orderStatus: variables.status, pickupStatus: variables.status } : null
        );
      }
    },
  });

  // Calculate live summary stats (use backendSummary if provided, otherwise compute from loaded orders)
  const summary = useMemo(() => {
    if (backendSummary) {
      return backendSummary;
    }

    const today = new Date().toISOString().slice(0, 10);
    let pending = 0;
    let accepted = 0;
    let packed = 0;
    let outForDelivery = 0;
    let delivered = 0;
    let cancelled = 0;
    let todayRevenue = 0;

    for (const o of orders) {
      const st = (o as StoreOrder & { pickupStatus?: string }).pickupStatus ?? o.orderStatus ?? o.status;
      if (st === "ORDER_PLACED" || st === "CONFIRMED") pending++;
      else if (st === "ACCEPTED") accepted++;
      else if (st === "PREPARING" || st === "READY_FOR_PICKUP" || st === "READY_FOR_DISPATCH") packed++;
      else if (st === "OUT_FOR_DELIVERY") outForDelivery++;
      else if (st === "DELIVERED" || st === "PICKED_UP") {
        delivered++;
        if (o.createdAt && o.createdAt.slice(0, 10) === today) {
          todayRevenue += o.grandTotal ?? 0;
        }
      } else if (st === "CANCELLED") {
        cancelled++;
      }
    }

    return {
      totalOrders: orders.length,
      pending,
      accepted,
      packed,
      outForDelivery,
      delivered,
      cancelled,
      todayRevenue,
    };
  }, [backendSummary, orders]);

  // Financial Analytics Calculations
  const analytics = useMemo(() => {
    let totalRevenue = 0;
    let pickupOrdersCount = 0;
    let deliveryOrdersCount = 0;

    for (const o of orders) {
      totalRevenue += o.grandTotal ?? 0;
      const isDel = o.fulfillmentType === "delivery" || o.deliveryMethod === "delivery";
      if (isDel) deliveryOrdersCount++;
      else pickupOrdersCount++;
    }

    const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

    return {
      totalRevenue,
      avgOrderValue,
      pickupOrdersCount,
      deliveryOrdersCount,
    };
  }, [orders]);

  const handleStatusAction = (order: StoreOrder, nextStatus: string) => {
    updateOrderStatusMutation.mutate({ orderId: order.orderId, status: nextStatus as any });
  };

  const handleCancelAction = (order: StoreOrder) => {
    const confirmed = window.confirm(`Cancel / Reject order #${order.orderId.slice(-8).toUpperCase()}?`);
    if (!confirmed) return;
    updateOrderStatusMutation.mutate({ orderId: order.orderId, status: "CANCELLED" });
  };

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Store" }, { label: "Orders" }]} />

      <PageHeader
        title="Seller Orders Management"
        description="Monitor customer orders, manage processing workflows, update fulfillment statuses, and inspect payment records."
      />

      {/* Summary KPI Cards Grid */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <StatCard
          title="Total Orders"
          value={String(summary.totalOrders)}
          description="All store orders"
          icon={<ClipboardList className="h-4 w-4" />}
        />
        <StatCard
          title="Pending"
          value={String(summary.pending)}
          description="Needs acceptance"
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          title="Accepted"
          value={String(summary.accepted)}
          description="In queue"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatCard
          title="Packing"
          value={String(summary.packed)}
          description="Preparing / Ready"
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          title="Out for Delivery"
          value={String(summary.outForDelivery)}
          description="On the way"
          icon={<Truck className="h-4 w-4" />}
        />
        <StatCard
          title="Delivered"
          value={String(summary.delivered)}
          description="Completed"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
        />
        <StatCard
          title="Cancelled"
          value={String(summary.cancelled)}
          description="Archived / Rejected"
          icon={<XCircle className="h-4 w-4 text-rose-500" />}
        />
        <StatCard
          title="Today Revenue"
          value={`₹${summary.todayRevenue.toLocaleString("en-IN")}`}
          description="Delivered today"
          icon={<IndianRupee className="h-4 w-4 text-emerald-600" />}
        />
      </div>

      {/* Analytics Insights Bar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3.5 rounded-2xl border border-stone-200/80 bg-white/80 p-4 shadow-xs dark:border-stone-800/80 dark:bg-stone-900/80">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Avg Order Value
            </p>
            <p className="text-lg font-bold text-stone-900 dark:text-stone-50">
              ₹{analytics.avgOrderValue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-stone-200/80 bg-white/80 p-4 shadow-xs dark:border-stone-800/80 dark:bg-stone-900/80">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Delivery Fulfillment
            </p>
            <p className="text-lg font-bold text-stone-900 dark:text-stone-50">
              {analytics.deliveryOrdersCount} orders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-stone-200/80 bg-white/80 p-4 shadow-xs dark:border-stone-800/80 dark:bg-stone-900/80">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Store Pickup
            </p>
            <p className="text-lg font-bold text-stone-900 dark:text-stone-50">
              {analytics.pickupOrdersCount} orders
            </p>
          </div>
        </div>
      </div>

      {/* Main Order Table */}
      <StoreOrdersTable
        filters={filters}
        onFiltersChange={setFilters}
        onViewOrder={(order) => setViewingOrder(order)}
      />

      {/* Slide-out Order Details Drawer */}
      {viewingOrder ? (
        <OrderDetailsDrawer
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          onStatusAction={handleStatusAction}
          onCancelAction={handleCancelAction}
          isUpdatingStatus={updateOrderStatusMutation.isPending}
        />
      ) : null}
    </DashboardContent>
  );
}