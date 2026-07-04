import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";

interface AdminSectionPageProps {
  title: string;
  description: string;
  sectionTitle: string;
  sectionDescription: string;
  emptyTitle: string;
  emptyDescription: string;
  breadcrumbLabel: string;
}

export function AdminSectionPage({
  title,
  description,
  sectionTitle,
  sectionDescription,
  emptyTitle,
  emptyDescription,
  breadcrumbLabel,
}: AdminSectionPageProps) {
  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Admin" }, { label: breadcrumbLabel }]} />
      <PageHeader title={title} description={description} />
      <DashboardCard title={sectionTitle} description={sectionDescription}>
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </DashboardCard>
    </DashboardContent>
  );
}
