"use client";

import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import Link from "next/link";
import { ArrowRight, Boxes, Package, Receipt, ShoppingBag } from "lucide-react";

const stats = [
  { label: "Today's Revenue", value: "$0.00", subtitle: "Revenue generated today", icon: Receipt },
  { label: "Pending Pickup Orders", value: "0", subtitle: "Orders awaiting pickup completion", icon: ShoppingBag },
  { label: "Low Stock Items", value: "0", subtitle: "Products that need replenishment", icon: Boxes },
  { label: "Active Products", value: "0", subtitle: "Products currently available", icon: Package },
];

const quickActions = [
  { label: "Create invoice", description: "Record an offline sale", href: "/store/billing", icon: Receipt },
  { label: "Manage products", description: "Review your product catalog", href: "/store/products", icon: Package },
  { label: "Check inventory", description: "Review stock levels", href: "/store/inventory", icon: Boxes },
  { label: "View orders", description: "Track pickup orders", href: "/store/orders", icon: ShoppingBag },
];

export default function StoreDashboardPage() {
  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Store" }]} />
      <PageHeader title="Store operations" description="Monitor your catalog, inventory, orders, and customer activity from one workspace." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <DashboardCard key={item.label} title={item.label} description={item.subtitle}>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-semibold text-stone-900 dark:text-stone-50">{item.value}</div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                Live data coming soon
              </p>
            </DashboardCard>
          );
        })}
      </div>

      <DashboardCard title="Quick actions" description="Jump into the workflows you use most often.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-lg border border-stone-200 bg-stone-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-stone-800 dark:bg-stone-950/50 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="mt-3 font-semibold text-stone-900 dark:text-stone-50">{action.label}</h3>
                    <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">{action.description}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-stone-400 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
                </div>
              </Link>
            );
          })}
        </div>
      </DashboardCard>

      <DashboardCard title="Recent Activity" description="Stay aware of the latest activity across your store.">
        <EmptyState
          title="No recent activity yet"
          description="Billing activity, pickup orders, and inventory events will appear here as your store workflows become active."
        />
      </DashboardCard>
    </DashboardContent>
  );
}
