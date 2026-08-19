"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function AdminDashboardPage() {
  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Admin" }]} />
      <PageHeader title="Platform admin workspace" description="Manage the parts of SheoMart that keep the marketplace organized and trustworthy." />
      <DashboardCard title="Workspace foundation" description="Use the navigation to review the operational areas currently available to platform administrators.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/admin/stores" className="group rounded-lg border border-stone-200 bg-stone-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-stone-800 dark:bg-stone-950/50 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em]">Operations</span>
                </div>
                <h3 className="mt-2 font-semibold text-stone-900 dark:text-stone-50">Review stores</h3>
                <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">Manage store approval states and marketplace access.</p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-stone-400 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
            </div>
          </Link>
          <Link href="/admin/categories" className="group rounded-lg border border-stone-200 bg-stone-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-stone-800 dark:bg-stone-950/50 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em]">Catalog</span>
                </div>
                <h3 className="mt-2 font-semibold text-stone-900 dark:text-stone-50">Organize categories</h3>
                <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">Maintain the taxonomy used across the marketplace.</p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-stone-400 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
            </div>
          </Link>
        </div>
      </DashboardCard>
      <DashboardCard title="More platform areas" description="Additional management areas will be added as their workflows are implemented.">
        <EmptyState title="No operational summary yet" description="Analytics and other platform modules are intentionally not part of this foundation view." />
      </DashboardCard>
    </DashboardContent>
  );
}
