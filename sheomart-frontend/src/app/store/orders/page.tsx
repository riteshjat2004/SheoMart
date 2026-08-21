"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, ClipboardList, PackageCheck } from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StoreOrdersTable } from "@/components/dashboard/store/StoreOrdersTable";
import { useStoreOrders } from "@/hooks/use-store-orders";
import type { StoreOrderFilters } from "@/types/store-order";

const PAGE_SIZE = 10;

export default function StoreOrdersPage() {
  const [filters, setFilters] = useState<StoreOrderFilters>({ page: 1, limit: PAGE_SIZE });
  const ordersQuery = useStoreOrders(filters);
  const summary = useMemo(() => {
    const orders = ordersQuery.data?.orders ?? [];
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: orders.length,
      preparing: orders.filter((order) => (order.orderStatus ?? order.status) === "PREPARING").length,
      ready: orders.filter((order) => (order.orderStatus ?? order.status) === "READY_FOR_PICKUP").length,
      completed: orders.filter((order) => (order.orderStatus ?? order.status) === "PICKED_UP" && order.createdAt?.slice(0, 10) === today).length,
    };
  }, [ordersQuery.data?.orders]);
  return <DashboardContent className="space-y-6"><Breadcrumb items={[{ label: "Store" }, { label: "Orders" }]} /><PageHeader title="Orders" description="Review customer pickup orders and their current payment status." /><p className="text-xs text-stone-500">Summary cards show current-page metrics.</p><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{ title: "Total Orders", value: summary.total, icon: ClipboardList }, { title: "Preparing Orders", value: summary.preparing, icon: Clock3 }, { title: "Ready for Pickup", value: summary.ready, icon: PackageCheck }, { title: "Completed Today", value: summary.completed, icon: CheckCircle2 }].map((card) => { const Icon = card.icon; return <DashboardCard key={card.title} title={card.title}><div className="flex items-center justify-between"><span className="text-2xl font-semibold text-stone-900 dark:text-stone-50">{card.value}</span><Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div></DashboardCard>; })}</div><StoreOrdersTable filters={filters} onFiltersChange={setFilters} /></DashboardContent>;
}