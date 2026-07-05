import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CategoryItem } from "@/types/marketplace";

interface CategoryCardProps {
  category: CategoryItem;
}

function getCategoryHref(category: CategoryItem) {
  return `/category/${category.categoryId ?? category._id ?? encodeURIComponent(category.name)}`;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={getCategoryHref(category)} className="group overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-stone-800 dark:bg-zinc-900">
      <div className="relative h-36 overflow-hidden">
        <img src={category.image} alt={category.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-stone-900 shadow-sm dark:bg-zinc-950/80 dark:text-stone-100">
          <span className="text-lg">{category.icon}</span>
          {category.name}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-4 text-sm text-stone-600 dark:text-stone-300">
        <span className="line-clamp-2">{category.description}</span>
        <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
