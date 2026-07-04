"use client";

import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function AdminDashboardPage() {
  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Admin" }]} />
      <PageHeader title="Platform admin workspace" description="This shell is prepared for platform-level management modules without implementing business flows yet." />
      <DashboardCard title="Admin modules" description="The navigation and shell are ready for future user, store, product, category, and settings experiences.">
        <EmptyState title="Admin management screens will appear here" description="The foundation is in place; CRUD screens can be mounted in this area next." />
      </DashboardCard>
    </DashboardContent>
  );
}
