"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  portal?: "admin" | "seller" | "customer";
}

export function Breadcrumb({ items, portal }: BreadcrumbProps) {
  const pathname = usePathname();
  const isSeller =
    portal === "seller" ||
    pathname?.startsWith("/store") ||
    items[0]?.label.toLowerCase() === "store" ||
    items[0]?.label.toLowerCase() === "seller";

  // Filter out duplicate root item (e.g., if page passes { label: "Store" } or { label: "Admin" })
  const normalizedItems = items.filter(
    (item, index) =>
      !(
        index === 0 &&
        (item.label.toLowerCase() === "admin" ||
          item.label.toLowerCase() === "store" ||
          item.label.toLowerCase() === "seller")
      )
  );

  const rootHref = isSeller ? "/store" : "/admin";
  const rootLabel = isSeller ? "Seller" : "Admin";

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-[11px] font-medium text-stone-400 dark:text-stone-500"
    >
      <Link
        href="/"
        className="transition-colors hover:text-stone-600 dark:hover:text-stone-300"
      >
        Home
      </Link>
      <span className="text-stone-300 dark:text-stone-700">/</span>
      <Link
        href={rootHref}
        className="transition-colors hover:text-stone-600 dark:hover:text-stone-300"
      >
        {rootLabel}
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
