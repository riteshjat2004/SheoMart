"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Receipt, ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NewInvoiceWorkspace } from "@/components/dashboard/store/NewInvoiceWorkspace";
import { InvoiceHistoryTable } from "@/components/dashboard/store/InvoiceHistoryTable";

type BillingTabId = "new-invoice" | "pickup-orders" | "invoice-history";

const tabs: Array<{
  id: BillingTabId;
  label: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  href: string;
  icon: typeof Receipt;
  actionLabel: string;
}> = [
  {
    id: "new-invoice",
    label: "New Invoice",
    description: "Create an offline invoice for a customer at your store.",
    emptyTitle: "Billing terminal will appear here.",
    emptyDescription: "The offline billing workspace is ready for the invoice workflow.",
    href: "#billing-terminal",
    icon: Receipt,
    actionLabel: "Start Billing",
  },
  {
    id: "pickup-orders",
    label: "Pickup Orders",
    description: "Review Pay-at-Shop orders and complete pickup payments.",
    emptyTitle: "No pickup orders loaded yet.",
    emptyDescription: "Pickup orders will appear here when the billing data is connected.",
    href: "#pickup-orders",
    icon: ShoppingBag,
    actionLabel: "View Pickup Orders",
  },
  {
    id: "invoice-history",
    label: "Invoice History",
    description: "Review completed offline invoices and payment records.",
    emptyTitle: "Invoice history will appear here.",
    emptyDescription: "Completed invoices will appear here when the history data is connected.",
    href: "#invoice-history",
    icon: FileText,
    actionLabel: "View Invoice History",
  },
];

export function BillingTabs() {
  const [activeTab, setActiveTab] = useState<BillingTabId>("new-invoice");
  const activeTabDetails = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const ActiveIcon = activeTabDetails.icon;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-stone-200 dark:border-stone-800" role="tablist" aria-label="Billing workspace">
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
              className={`flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${isActive ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300" : "border-transparent text-stone-600 hover:border-stone-300 hover:text-stone-900 dark:text-stone-300 dark:hover:border-stone-700 dark:hover:text-stone-50"}`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "new-invoice" ? (
        <NewInvoiceWorkspace />
      ) : activeTab === "invoice-history" ? (
        <InvoiceHistoryTable />
      ) : (
        <>
          <DashboardCard title={activeTabDetails.label} description={activeTabDetails.description}>
            <div className="flex flex-col gap-5 rounded-lg border border-stone-200 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-950/50 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <ActiveIcon className="h-5 w-5" />
                </div>
                <p className="max-w-xl text-sm leading-6 text-stone-600 dark:text-stone-300">{activeTabDetails.description}</p>
              </div>
              <Link
                href={activeTabDetails.href}
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {activeTabDetails.actionLabel}
              </Link>
            </div>
          </DashboardCard>

          <EmptyState title={activeTabDetails.emptyTitle} description={activeTabDetails.emptyDescription} />
        </>
      )}
    </div>
  );
}
