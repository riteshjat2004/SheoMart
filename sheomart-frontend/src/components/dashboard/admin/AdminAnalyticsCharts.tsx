"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/dashboard/EmptyState";
import type { AdminAnalyticsBreakdownPoint, AdminAnalyticsTrendPoint } from "@/types/admin-analytics";

interface TrendChartProps {
  title: string;
  points: AdminAnalyticsTrendPoint[];
  color: string;
  currency?: boolean;
}

interface BreakdownChartProps {
  title: string;
  points: AdminAnalyticsBreakdownPoint[];
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export function AdminAnalyticsTrendChart({ title, points, color, currency = false }: TrendChartProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white/70 p-4 dark:border-stone-800 dark:bg-stone-900/70">
      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">{title}</h3>
      <div className="mt-4 h-60">
        {points.length === 0 ? (
          <EmptyState title="No data for this period" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" opacity={0.5} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(value) => currency ? formatCurrency(Number(value)) : String(value)} />
              <Tooltip formatter={(value) => currency ? formatCurrency(Number(value)) : Number(value)} />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

export function AdminAnalyticsBreakdownChart({ title, points }: BreakdownChartProps) {
  const chartPoints = points.map((point) => ({ ...point, label: formatStatus(point.status) }));

  return (
    <section className="rounded-lg border border-stone-200 bg-white/70 p-4 dark:border-stone-800 dark:bg-stone-900/70">
      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">{title}</h3>
      <div className="mt-4 h-60">
        {chartPoints.length === 0 ? (
          <EmptyState title="No data for this period" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartPoints} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" opacity={0.5} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
