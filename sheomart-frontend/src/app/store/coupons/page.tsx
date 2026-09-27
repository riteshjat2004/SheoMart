"use client";

import { useState } from "react";
import {
  Tag,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShoppingBag,
  TrendingUp,
  LayoutList,
  BarChart3,
  Receipt,
  Plus,
} from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { SellerCouponManagementTable } from "@/components/dashboard/store/SellerCouponManagementTable";
import { SellerCouponAnalyticsView } from "@/components/dashboard/store/SellerCouponAnalyticsView";
import { SellerCouponRedemptionsView } from "@/components/dashboard/store/SellerCouponRedemptionsView";
import { SellerCouponFormModal } from "@/components/dashboard/store/SellerCouponFormModal";
import { useSellerCouponSummary } from "@/hooks/use-seller-coupons";
import type { SellerCouponSummary } from "@/types/seller-coupon";

export default function StoreCouponsPage() {
  const [activeTab, setActiveTab] = useState<"directory" | "analytics" | "redemptions">("directory");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const summaryQuery = useSellerCouponSummary();
  const [tableSummary, setTableSummary] = useState<SellerCouponSummary | null>(null);

  const summary = tableSummary || summaryQuery.data || {
    totalCoupons: 0,
    activeCoupons: 0,
    scheduledCoupons: 0,
    expiredCoupons: 0,
    couponsRedeemed: 0,
    revenueGenerated: 0,
  };

  const money = (val?: number) => `₹${(val ?? 0).toLocaleString("en-IN")}`;

  const summaryCards = [
    {
      title: "Total Coupons",
      value: (summary.totalCoupons ?? 0).toString(),
      subtitle: "Lifetime store vouchers",
      icon: Tag,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      title: "Active Coupons",
      value: (summary.activeCoupons ?? 0).toString(),
      subtitle: "Currently usable at checkout",
      icon: CheckCircle2,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      title: "Scheduled",
      value: (summary.scheduledCoupons ?? 0).toString(),
      subtitle: "Starts in the future",
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/50",
    },
    {
      title: "Expired",
      value: (summary.expiredCoupons ?? 0).toString(),
      subtitle: "Ended or limits exhausted",
      icon: AlertCircle,
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-950/50",
    },
    {
      title: "Coupons Redeemed",
      value: (summary.couponsRedeemed ?? 0).toString(),
      subtitle: "Times used by shoppers",
      icon: ShoppingBag,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
    },
    {
      title: "Revenue Generated",
      value: money(summary.revenueGenerated),
      subtitle: "Sales influenced by vouchers",
      icon: TrendingUp,
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-50 dark:bg-teal-950/50",
    },
  ];

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Store" }, { label: "Coupons & Promotions" }]} />

      <PageHeader
        title="Store Coupons & Promotions"
        description="Create, schedule, and track store-exclusive promotional discount vouchers to accelerate sales."
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Create Coupon
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
          All Coupons
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
          Analytics & Insights
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("redemptions")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "redemptions"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
          }`}
        >
          <Receipt className="h-4 w-4" />
          Redemption History
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "directory" && (
        <SellerCouponManagementTable onSummaryChange={setTableSummary} />
      )}

      {activeTab === "analytics" && (
        <SellerCouponAnalyticsView />
      )}

      {activeTab === "redemptions" && (
        <SellerCouponRedemptionsView />
      )}

      {/* Create Coupon Modal */}
      {isCreateModalOpen && (
        <SellerCouponFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </DashboardContent>
  );
}
