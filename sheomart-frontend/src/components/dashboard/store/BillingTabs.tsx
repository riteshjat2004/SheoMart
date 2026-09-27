"use client";

import { useState } from "react";
import { FileText, Receipt, ShoppingBag, Wallet } from "lucide-react";
import { NewInvoiceWorkspace } from "@/components/dashboard/store/NewInvoiceWorkspace";
import { InvoiceHistoryTable } from "@/components/dashboard/store/InvoiceHistoryTable";
import { PickupOrdersQueue } from "@/components/dashboard/store/PickupOrdersQueue";
import { DailyCashSummaryCard } from "@/components/dashboard/store/DailyCashSummaryCard";

type BillingTabId = "new-invoice" | "pickup-orders" | "invoice-history" | "daily-cash";

const tabs: Array<{
  id: BillingTabId;
  label: string;
  icon: typeof Receipt;
}> = [
  {
    id: "new-invoice",
    label: "POS Terminal (New Bill)",
    icon: Receipt,
  },
  {
    id: "pickup-orders",
    label: "Pickup Orders Queue",
    icon: ShoppingBag,
  },
  {
    id: "invoice-history",
    label: "Invoice History",
    icon: FileText,
  },
  {
    id: "daily-cash",
    label: "Register & Cash Reconciliation",
    icon: Wallet,
  },
];

export function BillingTabs() {
  const [activeTab, setActiveTab] = useState<BillingTabId>("new-invoice");

  return (
    <div className="space-y-6">
      <div
        className="flex flex-wrap gap-2 border-b border-stone-200 dark:border-stone-800"
        role="tablist"
        aria-label="Billing workspace"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-3 py-3 text-xs sm:text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isActive
                  ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300"
                  : "border-transparent text-stone-600 hover:border-stone-300 hover:text-stone-900 dark:text-stone-400 dark:hover:border-stone-700 dark:hover:text-stone-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "new-invoice" && <NewInvoiceWorkspace />}
      {activeTab === "pickup-orders" && <PickupOrdersQueue />}
      {activeTab === "invoice-history" && <InvoiceHistoryTable />}
      {activeTab === "daily-cash" && <DailyCashSummaryCard />}
    </div>
  );
}
