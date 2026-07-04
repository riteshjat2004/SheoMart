"use client";

import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { StatCard } from "@/components/dashboard/StatCard";
import { BarChart3, Boxes, Package, ShoppingBag } from "lucide-react";

export default function DashboardHomePage() {
  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard" }]} />
      <PageHeader title="Dashboard overview" description="A shared shell for admin and store operations is now mounted and ready for future business modules." actions={<Button variant="outline">Create report</Button>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Active inventory" value="1,284" description="Products in stock across live stores" icon={<Boxes className="h-5 w-5" />} />
        <StatCard title="Orders today" value="84" description="Pending and completed orders" icon={<ShoppingBag className="h-5 w-5" />} />
        <StatCard title="Published products" value="320" description="Ready for shoppers" icon={<Package className="h-5 w-5" />} />
        <StatCard title="Performance" value="94%" description="Operational health score" icon={<BarChart3 className="h-5 w-5" />} />
      </div>
      <DashboardCard title="Workspace overview" description="This area is intentionally scaffolded as a reusable foundation for future CRUD and analytics modules.">
        <div className="space-y-4">
          <SearchBar placeholder="Search this workspace" />
          <div className="rounded-[1.25rem] border border-dashed border-stone-300 p-6 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-300">
            Future dashboard modules such as listings, analytics, and orders can render here using the shared layout primitives.
          </div>
        </div>
      </DashboardCard>
    </DashboardContent>
  );
}
