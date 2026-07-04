import { EmptyState } from "@/components/common/empty-state";

interface CategoryEmptyStateProps {
  title?: string;
  description?: string;
}

export function CategoryEmptyState({ title = "No products found", description = "Try another category or check back soon." }: CategoryEmptyStateProps) {
  return <EmptyState title={title} description={description} />;
}
