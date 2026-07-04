import { StoreSectionPage } from "@/components/dashboard/store/StoreSectionPage";

export default function StoreSettingsPage() {
  return (
    <StoreSectionPage
      title="Settings"
      description="Adjust your store profile and business preferences."
      sectionTitle="Store settings"
      sectionDescription="This workspace can host profile controls, contact details, and business preferences."
      emptyTitle="Settings views are not implemented yet"
      emptyDescription="The store dashboard shell is ready; configuration forms can be added here next."
      breadcrumbLabel="Settings"
    />
  );
}
