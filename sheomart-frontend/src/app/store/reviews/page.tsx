import { StoreSectionPage } from "@/components/dashboard/store/StoreSectionPage";

export default function StoreReviewsPage() {
  return (
    <StoreSectionPage
      title="Reviews"
      description="Monitor customer feedback and review product sentiment."
      sectionTitle="Review overview"
      sectionDescription="This scaffold can host review summaries, visibility management, and respond actions."
      emptyTitle="Review management views are not implemented yet"
      emptyDescription="The store dashboard shell is ready; review workflows can be added here next."
      breadcrumbLabel="Reviews"
    />
  );
}
