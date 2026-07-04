import type { ReactNode } from "react";

interface CategoryBannerProps {
  title: string;
  description: string;
  badge?: string;
  actions?: ReactNode;
}

export function CategoryBanner({ title, description, badge, actions }: CategoryBannerProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white shadow-[0_24px_80px_-40px_rgba(16,185,129,0.65)] sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          {badge ? <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-100">{badge}</p> : null}
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h2>
          <p className="mt-3 text-sm leading-7 text-emerald-50 sm:text-base">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
