import type { LucideIcon } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

interface BillingSummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
}

export function BillingSummaryCard({ title, value, subtitle, icon: Icon }: BillingSummaryCardProps) {
  return (
    <DashboardCard title={title} description={subtitle}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-2xl font-semibold text-stone-900 dark:text-stone-50">{value}</span>
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
        Live data coming soon
      </p>
    </DashboardCard>
  );
}
