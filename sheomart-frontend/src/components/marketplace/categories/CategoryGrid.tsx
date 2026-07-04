import type { CategoryItem } from "@/types/marketplace";
import { CategoryCard } from "@/components/marketplace/CategoryCard";

interface CategoryGridProps {
  categories: CategoryItem[];
  className?: string;
}

export function CategoryGrid({ categories, className }: CategoryGridProps) {
  return (
    <div className={className ?? "grid gap-4 sm:grid-cols-2 xl:grid-cols-4"}>
      {categories.map((category) => (
        <CategoryCard key={category.categoryId ?? category._id ?? category.name} category={category} />
      ))}
    </div>
  );
}
