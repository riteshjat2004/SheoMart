import { AdminSectionPage } from "@/components/dashboard/admin/AdminSectionPage";

export default function AdminProductsPage() {
  return (
    <AdminSectionPage
      title="Products"
      description="Monitor the product catalog and prepare moderation workflows."
      sectionTitle="Product management"
      sectionDescription="This space can host product approvals, inventory visibility, and catalog review views."
      emptyTitle="Product management views are not implemented yet"
      emptyDescription="The admin shell is ready; product moderation flows can be added here next."
      breadcrumbLabel="Products"
    />
  );
}
