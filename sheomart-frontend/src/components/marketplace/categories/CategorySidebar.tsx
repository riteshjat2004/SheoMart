import Link from "next/link";
import type { CategoryItem } from "@/types/marketplace";

interface CategorySidebarProps {
  categories: CategoryItem[];
  currentCategoryId?: string;
}

function getCategoryHref(category: CategoryItem) {
  return `/category/${category.categoryId ?? category._id ?? category.slug ?? encodeURIComponent(category.name)}`;
}

export function CategorySidebar({ categories, currentCategoryId }: CategorySidebarProps) {
  return (
    <aside className="rounded-[1.5rem] border border-stone-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/80">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Browse</h2>
        <span className="text-sm text-stone-500 dark:text-stone-400">{categories.length} categories</span>
      </div>
      <nav aria-label="Category sidebar" className="mt-4 space-y-2">
        <Link
          href="/categories"
          className={`flex items-center justify-between rounded-2xl px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${!currentCategoryId ? "bg-emerald-600 text-white" : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"}`}
        >
          <span>All categories</span>
          <span className="text-xs opacity-80">↗</span>
        </Link>
        {categories.map((category) => {
          const categoryId = category.categoryId ?? category._id;
          const isActive = currentCategoryId ? categoryId === currentCategoryId : false;

          return (
            <Link
              key={categoryId ?? category.name}
              href={getCategoryHref(category)}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center justify-between rounded-2xl px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${isActive ? "bg-emerald-600 text-white" : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"}`}
            >
              <span>{category.name}</span>
              <span className="text-xs opacity-80">→</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
