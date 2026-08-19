"use client";

import { useState } from "react";
import { CalendarDays, DollarSign, Package, ShoppingBag, Store, Users } from "lucide-react";
import { AdminAnalyticsBreakdownChart, AdminAnalyticsTrendChart } from "@/components/dashboard/admin/AdminAnalyticsCharts";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/common/error-state";
import { useAdminAnalytics } from "@/hooks/use-admin-analytics";
import type { AdminAnalyticsFilters } from "@/types/admin-analytics";

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDefaultDates(days = 30) {
  const today = new Date();
  const from = new Date(today);
  from.setUTCDate(from.getUTCDate() - (days - 1));
  return { from: formatDateInput(from), to: formatDateInput(today) };
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AdminAnalyticsPage() {
  const defaults = getDefaultDates();
  const [draftFrom, setDraftFrom] = useState(defaults.from);
  const [draftTo, setDraftTo] = useState(defaults.to);
  const [dateError, setDateError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdminAnalyticsFilters>({ ...defaults, timezone: "UTC" });
  const analyticsQuery = useAdminAnalytics(filters);
  const overview = analyticsQuery.data;

  const applyRange = (from: string, to: string) => {
    if (!from || !to || from >= to) {
      setDateError("Start date must be earlier than end date.");
      return;
    }

    setDateError(null);
    setDraftFrom(from);
    setDraftTo(to);
    setFilters({ from, to, timezone: "UTC" });
  };

  const applyPreset = (days: number) => {
    const range = getDefaultDates(days);
    applyRange(range.from, range.to);
  };

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Admin" }, { label: "Analytics" }]} />
      <PageHeader
        title="Analytics"
        description="Real platform business data aggregated from users, stores, products, orders, and payments."
        actions={<span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"><CalendarDays className="h-4 w-4" />UTC reporting</span>}
      />

      <DashboardCard title="Reporting range" description="Dates use an inclusive start and exclusive end boundary in UTC. Revenue uses successful payment time.">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-medium text-stone-700 dark:text-stone-300">
              <span>Start date</span>
              <input type="date" value={draftFrom} onChange={(event) => setDraftFrom(event.target.value)} className="min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900" />
            </label>
            <label className="space-y-1.5 text-sm font-medium text-stone-700 dark:text-stone-300">
              <span>End date</span>
              <input type="date" value={draftTo} onChange={(event) => setDraftTo(event.target.value)} className="min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900" />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => applyPreset(7)}>Last 7 days</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyPreset(30)}>Last 30 days</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyPreset(90)}>Last 90 days</Button>
            <Button type="button" size="sm" onClick={() => applyRange(draftFrom, draftTo)}>Apply range</Button>
          </div>
        </div>
        {dateError ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-300">{dateError}</p> : null}
        {overview ? <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">Showing {formatDate(overview.range.from)} through {formatDate(overview.range.to)} · {overview.range.timezone}</p> : null}
      </DashboardCard>

      {analyticsQuery.isLoading ? <LoadingSkeleton rows={5} /> : null}
      {analyticsQuery.isError ? <ErrorState message={analyticsQuery.error instanceof Error ? analyticsQuery.error.message : "Unable to load analytics."} /> : null}

      {overview && !analyticsQuery.isLoading && !analyticsQuery.isError ? (
        <>
          <section className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Overview</p>
              <h2 className="mt-1 text-lg font-semibold text-stone-900 dark:text-stone-50">Business performance</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <StatCard title="Customers" value={overview.kpis.customers.toLocaleString()} description="Customers created in range" icon={<Users className="h-5 w-5" />} />
              <StatCard title="Stores" value={overview.kpis.stores.toLocaleString()} description="Stores created in range" icon={<Store className="h-5 w-5" />} />
              <StatCard title="Products" value={overview.kpis.products.toLocaleString()} description="Products created in range" icon={<Package className="h-5 w-5" />} />
              <StatCard title="Orders" value={overview.kpis.orders.toLocaleString()} description="Paid orders created in range" icon={<ShoppingBag className="h-5 w-5" />} />
              <StatCard title="Revenue" value={formatCurrency(overview.kpis.revenue)} description="Paid order totals by payment date" icon={<DollarSign className="h-5 w-5" />} />
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Trends</p>
              <h2 className="mt-1 text-lg font-semibold text-stone-900 dark:text-stone-50">Daily movement</h2>
            </div>
            <div className="grid gap-3 xl:grid-cols-2">
              <AdminAnalyticsTrendChart title="Orders" points={overview.trends.orders} color="#059669" />
              <AdminAnalyticsTrendChart title="Revenue" points={overview.trends.revenue} color="#d97706" currency />
              <AdminAnalyticsTrendChart title="New customers" points={overview.trends.newCustomers} color="#0284c7" />
              <AdminAnalyticsTrendChart title="New stores" points={overview.trends.newStores} color="#7c3aed" />
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Breakdowns</p>
              <h2 className="mt-1 text-lg font-semibold text-stone-900 dark:text-stone-50">Operational status</h2>
            </div>
            <div className="grid gap-3 xl:grid-cols-3">
              <AdminAnalyticsBreakdownChart title="Orders by status" points={overview.breakdowns.ordersByStatus} />
              <AdminAnalyticsBreakdownChart title="Stores by status" points={overview.breakdowns.storesByStatus} />
              <AdminAnalyticsBreakdownChart title="Products by status" points={overview.breakdowns.productsByStatus.map((point) => ({ ...point, status: formatStatus(point.status) }))} />
            </div>
          </section>
        </>
      ) : null}

      {!analyticsQuery.isLoading && !analyticsQuery.isError && overview && overview.kpis.customers === 0 && overview.kpis.stores === 0 && overview.kpis.products === 0 && overview.kpis.orders === 0 && overview.kpis.revenue === 0 ? <EmptyState title="No business data for this period" description="Choose a wider reporting range to see available platform activity." /> : null}

    </DashboardContent>
  );
}
