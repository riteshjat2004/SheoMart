import { AdminSectionPage } from "@/components/dashboard/admin/AdminSectionPage";

export default function AdminReviewsPage() {
  return (
    <AdminSectionPage
      title="Reviews"
      description="Review marketplace feedback and prepare moderation actions."
      sectionTitle="Review moderation"
      sectionDescription="This scaffold can host review visibility controls, reporting workflows, and moderation history."
      emptyTitle="Review management views are not implemented yet"
      emptyDescription="The admin shell is ready; moderation workflows can be added here next."
      breadcrumbLabel="Reviews"
    />
  );
}
