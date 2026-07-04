import { AdminSectionPage } from "@/components/dashboard/admin/AdminSectionPage";

export default function AdminUsersPage() {
  return (
    <AdminSectionPage
      title="Users"
      description="Manage platform users and review account activity from this workspace."
      sectionTitle="User management"
      sectionDescription="This section is scaffolded for future user listing, status updates, and profile actions."
      emptyTitle="User management views are not implemented yet"
      emptyDescription="The admin shell is ready; the CRUD experience can be mounted here next."
      breadcrumbLabel="Users"
    />
  );
}
