import { AdminSectionPage } from "@/components/dashboard/admin/AdminSectionPage";

export default function AdminSettingsPage() {
  return (
    <AdminSectionPage
      title="Settings"
      description="Configure platform defaults and administrative preferences."
      sectionTitle="Platform settings"
      sectionDescription="This workspace can host defaults, feature toggles, and operational configuration."
      emptyTitle="Settings views are not implemented yet"
      emptyDescription="The admin shell is ready; configuration forms can be added here next."
      breadcrumbLabel="Settings"
    />
  );
}
