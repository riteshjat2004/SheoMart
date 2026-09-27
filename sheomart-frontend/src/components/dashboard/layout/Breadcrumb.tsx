import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  // Normalize items to prevent duplicate "Admin"
  const normalizedItems = items.filter(
    (item, index) => !(index === 0 && item.label.toLowerCase() === "admin")
  );

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-medium text-stone-400 dark:text-stone-500">
      <Link
        href="/"
        className="transition-colors hover:text-stone-600 dark:hover:text-stone-300"
      >
        Home
      </Link>
      <span className="text-stone-300 dark:text-stone-700">/</span>
      <Link
        href="/admin"
        className="transition-colors hover:text-stone-600 dark:hover:text-stone-300"
      >
        Admin
      </Link>
      {normalizedItems.map((item, index) => {
        const isLast = index === normalizedItems.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            <span className="text-stone-300 dark:text-stone-700">/</span>
            {isLast || !item.href ? (
              <span className="font-semibold text-stone-700 dark:text-stone-300 truncate max-w-[200px]">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="transition-colors hover:text-stone-600 dark:hover:text-stone-300"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
