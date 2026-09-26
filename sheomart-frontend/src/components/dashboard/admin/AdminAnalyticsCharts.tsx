"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Package,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  User,
  XCircle,
} from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";
import type {
  ActivityFeedItem,
  AnalyticsBreakdownPoint,
  AnalyticsTrendPoint,
  MarketplaceHealthData,
} from "@/types/admin-analytics";

interface TrendChartProps {
  title: string;
  points: AnalyticsTrendPoint[];
  color: string;
  currency?: boolean;
}

interface BreakdownChartProps {
  title: string;
  points: AnalyticsBreakdownPoint[];
}

interface CategoryPieProps {
  title: string;
  data: Array<{ name: string; value: number }>;
  currency?: boolean;
}

const PIE_COLORS = ["#059669", "#10b981", "#34d399", "#0284c7", "#38bdf8", "#8b5cf6", "#f59e0b", "#f97316"];

function formatStatus(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function AdminAnalyticsTrendChart({ title, points, color, currency = false }: TrendChartProps) {
  const gradientId = `colorGradient-${title.replace(/\s+/g, "")}`;

  return (
    <section className="rounded-2xl border border-stone-200 bg-white/80 p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">{title}</h3>
        {points.length > 0 && (
          <span className="text-xs text-stone-500">
            {points.length} data {points.length === 1 ? "point" : "points"}
          </span>
        )}
      </div>
      <div className="h-64">
        {points.length === 0 ? (
          <EmptyState title="No data for this period" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => (currency ? formatCurrency(Number(value)) : String(value))}
              />
              <Tooltip
                formatter={(value) => [currency ? formatCurrency(Number(value)) : Number(value), title]}
                contentStyle={{
                  backgroundColor: "rgba(23, 23, 23, 0.95)",
                  borderColor: "rgba(68, 68, 68, 0.6)",
                  borderRadius: "0.75rem",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                dot={{ r: 2.5 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

export function AdminAnalyticsBreakdownChart({ title, points }: BreakdownChartProps) {
  const chartPoints = points.map((point) => ({ ...point, label: formatStatus(point.status) }));

  return (
    <section className="rounded-2xl border border-stone-200 bg-white/80 p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/80">
      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-4">{title}</h3>
      <div className="h-64">
        {chartPoints.length === 0 ? (
          <EmptyState title="No data for this period" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartPoints} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={45}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(23, 23, 23, 0.95)",
                  borderColor: "rgba(68, 68, 68, 0.6)",
                  borderRadius: "0.75rem",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

export function AdminAnalyticsDonutChart({ title, data, currency = false }: CategoryPieProps) {
  const hasData = data.length > 0 && data.some((d) => d.value > 0);

  return (
    <section className="rounded-2xl border border-stone-200 bg-white/80 p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/80">
      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-4">{title}</h3>
      <div className="h-64">
        {!hasData ? (
          <EmptyState title="No distribution data" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val) => (currency ? formatCurrency(Number(val)) : Number(val))}
                contentStyle={{
                  backgroundColor: "rgba(23, 23, 23, 0.95)",
                  borderColor: "rgba(68, 68, 68, 0.6)",
                  borderRadius: "0.75rem",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

export function TopLeaderboardCard({
  title,
  description,
  items,
  isCurrency = false,
  emptyText = "No items ranked yet.",
}: {
  title: string;
  description?: string;
  items: Array<{ id: string; name: string; value: number; secondary?: string }>;
  isCurrency?: boolean;
  emptyText?: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white/80 p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/80">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">{title}</h3>
        {description && <p className="text-xs text-stone-500">{description}</p>}
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-stone-400 py-4 text-center">{emptyText}</p>
      ) : (
        <ol className="divide-y divide-stone-100 dark:divide-stone-800">
          {items.slice(0, 5).map((item, index) => (
            <li key={item.id || index} className="flex items-center justify-between py-2.5 text-xs">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    index === 0
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : index === 1
                      ? "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                      : index === 2
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300"
                      : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                  }`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-stone-900 dark:text-stone-100">{item.name}</p>
                  {item.secondary && <p className="text-[11px] text-stone-500 truncate">{item.secondary}</p>}
                </div>
              </div>
              <div className="shrink-0 font-bold text-stone-800 dark:text-stone-200">
                {isCurrency ? formatCurrency(item.value) : item.value.toLocaleString()}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function MarketplaceHealthWidget({ health }: { health: MarketplaceHealthData }) {
  const statusColor =
    health.status === "healthy"
      ? "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800"
      : health.status === "attention"
      ? "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800"
      : "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800";

  return (
    <div className="rounded-2xl border border-stone-200 bg-white/80 p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/80">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Marketplace Health</h3>
          <p className="text-xs text-stone-500">Live operational vitality indicators</p>
        </div>
        <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusColor}`}>
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{health.status} ({health.healthScore}/100)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3 dark:border-stone-800 dark:bg-stone-900/40">
          <span className="text-xs text-stone-500">Active Stores</span>
          <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">{health.activeStores}</p>
        </div>

        <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3 dark:border-stone-800 dark:bg-stone-900/40">
          <span className="text-xs text-stone-500">Suspended Stores</span>
          <p className={`text-base font-bold mt-1 ${health.suspendedStores > 0 ? "text-amber-600" : "text-stone-700 dark:text-stone-300"}`}>
            {health.suspendedStores}
          </p>
        </div>

        <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3 dark:border-stone-800 dark:bg-stone-900/40">
          <span className="text-xs text-stone-500">Orders Today</span>
          <p className="text-base font-bold text-stone-900 dark:text-stone-100 mt-1">{health.ordersToday}</p>
        </div>

        <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3 dark:border-stone-800 dark:bg-stone-900/40">
          <span className="text-xs text-stone-500">Failed Orders Today</span>
          <p className={`text-base font-bold mt-1 ${health.failedOrdersToday > 0 ? "text-rose-600" : "text-stone-700 dark:text-stone-300"}`}>
            {health.failedOrdersToday}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ActivityFeedWidget({ items }: { items: ActivityFeedItem[] }) {
  const getIcon = (type: ActivityFeedItem["type"]) => {
    switch (type) {
      case "user_joined":
        return <User className="h-3.5 w-3.5 text-blue-500" />;
      case "store_approved":
        return <Store className="h-3.5 w-3.5 text-amber-500" />;
      case "product_added":
        return <Package className="h-3.5 w-3.5 text-emerald-500" />;
      case "order_completed":
        return <ShoppingBag className="h-3.5 w-3.5 text-purple-500" />;
      case "review_submitted":
        return <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />;
      case "coupon_created":
        return <Tag className="h-3.5 w-3.5 text-orange-500" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-stone-500" />;
    }
  };

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return Number.isNaN(d.getTime())
      ? ts
      : d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white/80 p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/80">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Activity Stream</h3>
          <p className="text-xs text-stone-500">Real-time marketplace operational transactions</p>
        </div>
        <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-stone-400 py-6 text-center">No recent platform activities recorded.</p>
      ) : (
        <div className="flow-root max-h-[420px] overflow-y-auto pr-1">
          <ul className="-mb-8">
            {items.map((item, itemIdx) => (
              <li key={item.id || itemIdx}>
                <div className="relative pb-5">
                  {itemIdx !== items.length - 1 ? (
                    <span
                      className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-stone-200 dark:bg-stone-800"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 ring-4 ring-white dark:ring-stone-950">
                      {getIcon(item.type)}
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">{item.title}</p>
                        <p className="text-xs text-stone-500">{item.description}</p>
                      </div>
                      <div className="whitespace-nowrap text-right text-[11px] text-stone-400">
                        {formatTimestamp(item.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
