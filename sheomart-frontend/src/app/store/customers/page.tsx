"use client";

import { useState } from "react";
import { Users, UserRoundCheck, WalletCards } from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { CustomerManagementTable } from "@/components/dashboard/store/CustomerManagementTable";
import { Button } from "@/components/ui/button";

export default function StoreCustomersPage() {
  const [customerCount, setCustomerCount] = useState(0);
  const [plusCount, setPlusCount] = useState(0);

  const summaryCards = [
    { title: "Total Customers", value: customerCount.toString(), subtitle: "Customers linked to your store", icon: Users },
    { title: "PLUS Customers", value: plusCount.toString(), subtitle: "Customers with PLUS status", icon: UserRoundCheck },
    { title: "Outstanding Credit Customers", value: "0", subtitle: "Customers with open balances", icon: WalletCards },
    { title: "Total Outstanding Amount", value: "₹0", subtitle: "Amount awaiting collection", icon: WalletCards },
  ];

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Store" }, { label: "Customers" }]} />
      <PageHeader title="Customers" description="Review customers linked to your store and their purchase activity." actions={<Button type="button" onClick={() => window.dispatchEvent(new Event("open-add-plus-member"))}>+ Add PLUS Member</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return <DashboardCard key={card.title} title={card.title} description={card.subtitle}><div className="flex items-center justify-between"><span className="text-2xl font-semibold text-stone-900 dark:text-stone-50">{card.value}</span><Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div></DashboardCard>;
        })}
      </div>
      <CustomerManagementTable onCustomerCountChange={setCustomerCount} onPlusCountChange={setPlusCount} />
    </DashboardContent>
  );
}
