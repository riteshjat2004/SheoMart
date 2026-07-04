import { AdminSectionPage } from "@/components/dashboard/admin/AdminSectionPage";

export default function AdminAnalyticsPage() {
  return (
    <AdminSectionPage
      title="Analytics"
      description="Open the reporting workspace for platform insights and performance summaries."
      sectionTitle="Platform analytics"
      sectionDescription="This page is ready for charts, KPI summaries, and operational reporting widgets."
      emptyTitle="Analytics views are not implemented yet"
      emptyDescription="The admin shell is ready; reporting widgets can be added here next."
      breadcrumbLabel="Analytics"
    />
  );
}
