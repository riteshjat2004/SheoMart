"use client";

import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Package, Boxes, MessageSquareQuote, TrendingUp, AlertTriangle } from "lucide-react";

const stats = [
  { label: "Today's Sales", value: "$0.00", description: "Placeholder for sales summary", icon: TrendingUp },
  { label: "Inventory Summary", value: "0 items", description: "Placeholder for stock overview", icon: Boxes },
  { label: "Product Count", value: "0", description: "Placeholder for catalog volume", icon: Package },
  { label: "Review Summary", value: "0 reviews", description: "Placeholder for customer feedback", icon: MessageSquareQuote },
];

export default function StoreDashboardPage() {
  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Store" }]} />
      <PageHeader title="Store owner workspace" description="A layout-only dashboard shell for your store operations and future business modules." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <DashboardCard key={item.label} title={item.label} description={item.description}>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-semibold text-stone-900 dark:text-stone-50">{item.value}</div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </DashboardCard>
          );
        })}
      </div>

      <DashboardCard title="Low Stock" description="Placeholder for inventory alerts and restock planning.">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>No low-stock items yet. This section will surface restock reminders as your catalog grows.</span>
        </div>
      </DashboardCard>
    </DashboardContent>
  );
}
