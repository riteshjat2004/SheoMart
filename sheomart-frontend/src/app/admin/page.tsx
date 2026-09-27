"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Tag,
  TicketPercent,
  TrendingUp,
  Users,
  Settings,
} from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { useAdminAnalytics } from "@/hooks/use-admin-analytics";
import { useAuthStore } from "@/store/auth-store";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  if (value >= 1_00_000) {
    return `${(value / 1_00_000).toFixed(1)}L`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getToday() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getDefaultDates() {
  const today = new Date();
  const from = new Date(today);
  from.setUTCDate(from.getUTCDate() - 29);
  return {
    from: from.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  };
}

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  iconClass?: string;
  href: string;
  trend?: string;
  trendUp?: boolean;
}

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
  href,
  trend,
  trendUp,
}: KPICardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-stone-200/70 bg-white p-5 transition-all hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/5 dark:border-stone-800/70 dark:bg-stone-900/60 dark:hover:border-emerald-500/40"
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass ?? "bg-stone-100 dark:bg-stone-800"}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-stone-300 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-500 dark:text-stone-600" />
      </div>

      <div>
        <p className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
          {value}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-stone-500 dark:text-stone-400">{title}</p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[11px] text-stone-400 dark:text-stone-500">{subtitle}</p>
        {trend && (
          <span
            className={`flex items-center gap-0.5 text-[11px] font-bold ${
              trendUp
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-stone-500 dark:text-stone-400"
            }`}
          >
            <TrendingUp className="h-3 w-3" />
            {trend}
          </span>
        )}
      </div>
    </Link>
  );
}

interface QuickLinkProps {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeClass?: string;
}

function QuickLink({
  title,
  description,
  href,
  icon: Icon,
  badge,
  badgeClass,
}: QuickLinkProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-stone-200/70 bg-stone-50/50 p-4 transition hover:border-emerald-400/50 hover:bg-white hover:shadow-sm dark:border-stone-800/70 dark:bg-stone-900/40 dark:hover:border-emerald-500/40 dark:hover:bg-stone-900/70"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-500 transition group-hover:bg-emerald-600 group-hover:text-white dark:bg-stone-800 dark:text-stone-400 dark:group-hover:bg-emerald-600 dark:group-hover:text-white">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{title}</p>
          {badge && (
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${badgeClass ?? "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"}`}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-stone-300 transition group-hover:translate-x-1 group-hover:text-emerald-500 dark:text-stone-600" />
    </Link>
  );
}

interface ActionItemProps {
  label: string;
  description: string;
  count?: number;
  href: string;
  icon: React.ElementType;
  variant: "warning" | "danger" | "info";
}

function ActionItem({ label, description, count, href, icon: Icon, variant }: ActionItemProps) {
  const variantStyles = {
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    danger: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
    info: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  };

  return (
    <Link
      href={href}
      className="group flex items-center gap-3.5 rounded-xl border border-stone-200/70 bg-white p-3.5 transition hover:border-emerald-400/50 hover:shadow-sm dark:border-stone-800/70 dark:bg-stone-900/50 dark:hover:border-emerald-500/40"
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${variantStyles[variant]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">{label}</p>
          {count !== undefined && count > 0 && (
            <span className="inline-flex items-center rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
              {count}
            </span>
          )}
        </div>
        <p className="truncate text-[11px] text-stone-400 dark:text-stone-500">{description}</p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-stone-300 transition group-hover:translate-x-1 group-hover:text-emerald-500 dark:text-stone-600" />
    </Link>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const dates = useMemo(() => getDefaultDates(), []);
  const { data, isLoading } = useAdminAnalytics({ from: dates.from, to: dates.to });

  const greeting = getGreeting();
  const todayLabel = getToday();

  // Real KPIs derived from analytics data
  const kpis = {
    revenue: data?.overviewKpis?.marketplace?.totalRevenue ?? data?.kpis?.revenue ?? 0,
    orders: data?.overviewKpis?.marketplace?.totalOrders ?? data?.kpis?.orders ?? 0,
    users: data?.overviewKpis?.marketplace?.totalUsers ?? data?.kpis?.customers ?? 0,
    stores: data?.overviewKpis?.marketplace?.totalStores ?? data?.kpis?.stores ?? 0,
    products: data?.overviewKpis?.business?.totalProducts ?? data?.kpis?.products ?? 0,
    activeProducts: data?.overviewKpis?.business?.activeProducts ?? 0,
    revenueToday: data?.overviewKpis?.growth?.revenueToday ?? 0,
    newCustomersToday: data?.overviewKpis?.growth?.newCustomersToday ?? 0,
  };

  const health = data?.marketplaceHealth;
  const pendingStores =
    data?.sellerAnalytics?.kpis?.pendingSellers ?? 0;
  const pendingReviews = data?.reviewAnalytics?.kpis?.pendingReviews ?? 0;
  const reportedReviews = data?.reviewAnalytics?.kpis?.reportedReviews ?? 0;
  const outOfStock = data?.productInventory?.kpis?.outOfStock ?? 0;
  const lowStock = data?.productInventory?.kpis?.lowStock ?? 0;

  const recentActivity = data?.activityFeed?.slice(0, 6) ?? [];

  const activityIcons: Record<string, React.ElementType> = {
    user_joined: Users,
    store_approved: Store,
    product_added: Package,
    coupon_created: TicketPercent,
    review_submitted: Star,
    order_completed: CheckCircle2,
  };

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Overview" }]} />

      <PageHeader
        category="OVERVIEW"
        title="Marketplace Overview"
        description="Real-time performance, approvals, catalog vitality & platform metrics."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/analytics"
              className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 transition hover:border-emerald-400/60 hover:text-emerald-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:text-emerald-400"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 transition hover:border-emerald-400/60 hover:text-emerald-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:text-emerald-400"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[168px] animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <KPICard
            title="Gross Revenue"
            value={formatCurrency(kpis.revenue)}
            subtitle={`Today: ${formatCurrency(kpis.revenueToday)}`}
            icon={TrendingUp}
            iconClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
            href="/admin/analytics"
          />
          <KPICard
            title="Total Orders"
            value={formatNumber(kpis.orders)}
            subtitle="All marketplace orders"
            icon={ShoppingBag}
            iconClass="bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
            href="/admin/analytics"
          />
          <KPICard
            title="Registered Users"
            value={formatNumber(kpis.users)}
            subtitle={`+${kpis.newCustomersToday} today`}
            icon={Users}
            iconClass="bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400"
            href="/admin/users"
          />
          <KPICard
            title="Active Stores"
            value={formatNumber(kpis.stores)}
            subtitle={`${pendingStores} pending approval`}
            icon={Store}
            iconClass="bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
            href="/admin/stores"
          />
          <KPICard
            title="Product Listings"
            value={formatNumber(kpis.products)}
            subtitle={`${kpis.activeProducts} active listings`}
            icon={Package}
            iconClass="bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
            href="/admin/products"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Access */}
        <div className="lg:col-span-2">
          <DashboardCard
            title="Management Console"
            description="Navigate to any administrative module"
          >
            <div className="grid gap-2.5 sm:grid-cols-2">
              <QuickLink
                title="Store Approvals"
                description="Review merchant applications"
                href="/admin/stores"
                icon={Store}
                badge={pendingStores > 0 ? `${pendingStores} pending` : undefined}
                badgeClass="bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
              />
              <QuickLink
                title="Product Catalog"
                description="Manage global product listings"
                href="/admin/products"
                icon={Package}
              />
              <QuickLink
                title="User Directory"
                description="Manage customers, sellers & admins"
                href="/admin/users"
                icon={Users}
              />
              <QuickLink
                title="Coupon Campaigns"
                description="Discount codes and redemptions"
                href="/admin/coupons"
                icon={TicketPercent}
              />
              <QuickLink
                title="Homepage Offers"
                description="Flash deals and featured banners"
                href="/admin/offers"
                icon={Tag}
              />
              <QuickLink
                title="Category Taxonomy"
                description="Organize marketplace hierarchy"
                href="/admin/categories"
                icon={ShieldCheck}
              />
              <QuickLink
                title="Review Moderation"
                description="Audit and approve customer feedback"
                href="/admin/reviews"
                icon={Star}
                badge={reportedReviews > 0 ? `${reportedReviews} flagged` : undefined}
                badgeClass="bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
              />
              <QuickLink
                title="Analytics & Insights"
                description="Revenue trends and performance data"
                href="/admin/analytics"
                icon={BarChart3}
              />
            </div>
          </DashboardCard>
        </div>

        {/* Pending Actions */}
        <div className="space-y-4">
          <DashboardCard
            title="Pending Actions"
            description="Items requiring your attention"
          >
            <div className="space-y-2">
              <ActionItem
                label="Store Applications"
                description="Pending merchant verification"
                count={pendingStores}
                href="/admin/stores"
                icon={Store}
                variant="warning"
              />
              <ActionItem
                label="Review Moderation"
                description="Reported reviews awaiting action"
                count={reportedReviews}
                href="/admin/reviews"
                icon={Star}
                variant="danger"
              />
              <ActionItem
                label="Pending Reviews"
                description="Unmoderated customer feedback"
                count={pendingReviews}
                href="/admin/reviews"
                icon={Activity}
                variant="info"
              />
              <ActionItem
                label="Low Stock Alerts"
                description="Products below minimum threshold"
                count={lowStock + outOfStock}
                href="/admin/products"
                icon={AlertTriangle}
                variant="warning"
              />
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Marketplace Health + Live Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Marketplace Health Matrix */}
        {health && (
          <DashboardCard
            title="Marketplace Health"
            description="Real-time operational indicators"
          >
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Active Stores",
                  value: formatNumber(health.activeStores),
                  icon: Store,
                  status: "ok",
                },
                {
                  label: "Active Users",
                  value: formatNumber(health.activeUsers),
                  icon: Users,
                  status: "ok",
                },
                {
                  label: "Orders Today",
                  value: formatNumber(health.ordersToday),
                  icon: ShoppingBag,
                  status: "ok",
                },
                {
                  label: "Failed Orders",
                  value: formatNumber(health.failedOrdersToday),
                  icon: AlertTriangle,
                  status: health.failedOrdersToday > 0 ? "warn" : "ok",
                },
                {
                  label: "Inactive Stores",
                  value: formatNumber(health.inactiveStores),
                  icon: Store,
                  status: health.inactiveStores > 5 ? "warn" : "ok",
                },
                {
                  label: "Suspended Stores",
                  value: formatNumber(health.suspendedStores),
                  icon: AlertTriangle,
                  status: health.suspendedStores > 0 ? "danger" : "ok",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-stone-200/60 bg-stone-50/50 p-3.5 dark:border-stone-800/60 dark:bg-stone-900/40"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      item.status === "danger"
                        ? "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                        : item.status === "warn"
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                        : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-900 dark:text-stone-100">{item.value}</p>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-stone-200/60 bg-stone-50/50 p-3.5 dark:border-stone-800/60 dark:bg-stone-900/40">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                    Health Score
                  </p>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500">
                    Overall platform vitality
                  </p>
                </div>
              </div>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {health.healthScore ?? "--"}
                <span className="text-sm font-bold">/100</span>
              </p>
            </div>
          </DashboardCard>
        )}

        {/* Live Activity Feed */}
        <DashboardCard title="Live Activity" description="Recent marketplace events">
          {isLoading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Activity className="mb-3 h-10 w-10 text-stone-300 dark:text-stone-600" />
              <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
                No recent activity
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((item) => {
                const Icon = activityIcons[item.type] ?? Activity;
                const relativeTime = (() => {
                  const diff = Date.now() - new Date(item.timestamp).getTime();
                  const mins = Math.round(diff / 60000);
                  if (mins < 60) return `${mins}m ago`;
                  const hrs = Math.round(mins / 60);
                  if (hrs < 24) return `${hrs}h ago`;
                  return `${Math.round(hrs / 24)}d ago`;
                })();

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-xl border border-stone-200/60 bg-stone-50/50 p-3 dark:border-stone-800/60 dark:bg-stone-900/40"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-stone-400 dark:text-stone-500 truncate">
                        {item.description}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] text-stone-400 dark:text-stone-500">
                      {relativeTime}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <Link
            href="/admin/analytics"
            className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-stone-200/60 py-2.5 text-xs font-semibold text-stone-500 transition hover:border-emerald-400/50 hover:text-emerald-600 dark:border-stone-800/60 dark:text-stone-400 dark:hover:text-emerald-400"
          >
            View full analytics <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </DashboardCard>
      </div>
    </DashboardContent>
  );
}
