import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
      <Link href="/" className="transition hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
        Home
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-2">
            <span>/</span>
            {isLast || !item.href ? (
              <span className="font-medium text-stone-900 dark:text-stone-100">{item.label}</span>
            ) : (
              <Link href={item.href} className="transition hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
