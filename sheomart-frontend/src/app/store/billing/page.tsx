import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { BillingSummaryCard } from "@/components/dashboard/store/BillingSummaryCard";
import { BillingTabs } from "@/components/dashboard/store/BillingTabs";
import { Clock3, FileText, Receipt, Wallet } from "lucide-react";

const summaryCards = [
  {
    title: "Today's Revenue",
    value: "$0.00",
    subtitle: "Revenue recorded today",
    icon: Wallet,
  },
  {
    title: "Offline Invoices Today",
    value: "0",
    subtitle: "Invoices created today",
    icon: Receipt,
  },
  {
    title: "Pending Pickup Payments",
    value: "0",
    subtitle: "Pay-at-Shop orders awaiting payment",
    icon: Clock3,
  },
  {
    title: "Pending Amount Collection",
    value: "$0.00",
    subtitle: "Amount due from open payments",
    icon: FileText,
  },
];

export default function BillingPage() {
  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Store", href: "/store" }, { label: "Billing" }]} />
      <PageHeader title="Billing" description="Manage offline invoices, pickup payments, and billing history." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <BillingSummaryCard key={card.title} {...card} />
        ))}
      </div>

      <BillingTabs />
    </DashboardContent>
  );
}
