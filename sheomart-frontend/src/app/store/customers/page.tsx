"use client";

import { useState } from "react";
import {
  Users,
  UserCheck,
  UserPlus,
  Repeat,
  ShieldCheck,
  Crown,
  LayoutList,
  BarChart3,
  Plus,
} from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { CustomerManagementTable } from "@/components/dashboard/store/CustomerManagementTable";
import { SellerCustomerAnalyticsView } from "@/components/dashboard/store/SellerCustomerAnalyticsView";
import { Button } from "@/components/ui/button";
import { useStoreCustomersSummary } from "@/hooks/use-store-customers";
import type { StoreCustomerSummary } from "@/types/store-customer";

export default function StoreCustomersPage() {
  const [activeTab, setActiveTab] = useState<"directory" | "analytics">("directory");
  const summaryQuery = useStoreCustomersSummary();
  const [tableSummary, setTableSummary] = useState<StoreCustomerSummary | null>(null);

  const summary = tableSummary || summaryQuery.data || {
    totalCustomers: 0,
    activeCustomers: 0,
    newCustomersThisMonth: 0,
    repeatCustomers: 0,
    verifiedCustomers: 0,
    vipCustomers: 0,
  };

  const summaryCards = [
    {
      title: "Total Customers",
      value: summary.totalCustomers.toString(),
      subtitle: "Lifetime unique store buyers",
      icon: Users,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      title: "Active Buyers",
      value: summary.activeCustomers.toString(),
      subtitle: "Ordered in last 30 days",
      icon: UserCheck,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      title: "New This Month",
      value: summary.newCustomersThisMonth.toString(),
      subtitle: "First purchase this month",
      icon: UserPlus,
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-50 dark:bg-teal-950/50",
    },
    {
      title: "Repeat Customers",
      value: summary.repeatCustomers.toString(),
      subtitle: "Ordered more than once",
      icon: Repeat,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
    },
    {
      title: "Verified Buyers",
      value: summary.verifiedCustomers.toString(),
      subtitle: "Admin verified identities",
      icon: ShieldCheck,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
    },
    {
      title: "VIP Customers",
      value: summary.vipCustomers.toString(),
      subtitle: "High order count or spend",
      icon: Crown,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/50",
    },
  ];

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Store" }, { label: "Customer Management" }]} />

      <PageHeader
        title="Customer Management"
        description="Monitor, analyze, and manage customer relationships exclusively connected to your store."
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-add-plus-member"))}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add PLUS Member
            </Button>
          </div>
        }
      />

      {/* Summary KPI Cards (6 Live Aggregated Cards) */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  {card.title}
                </span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${card.bgColor} ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-50">
                {card.value}
              </p>
              <p className="mt-0.5 text-[11px] text-stone-400 truncate">
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 dark:border-stone-800">
        <button
          type="button"
          onClick={() => setActiveTab("directory")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "directory"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
          }`}
        >
          <LayoutList className="h-4 w-4" />
          Customer Directory
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "analytics"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Analytics & Growth
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "directory" ? (
        <CustomerManagementTable onSummaryChange={setTableSummary} />
      ) : (
        <SellerCustomerAnalyticsView />
      )}
    </DashboardContent>
  );
}
