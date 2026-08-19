"use client";

import { useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import { AdminUserRow } from "@/components/dashboard/admin/AdminUserRow";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useAdminUsers } from "@/hooks/use-admin-users";
import type { AdminUserFilters } from "@/types/admin-user";
import type { UserRole } from "@/types/auth";

const defaultFilters: AdminUserFilters = {
  page: 1,
  limit: 25,
  sortBy: "createdAt",
  sortOrder: "desc",
};

const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: "customer", label: "Customer" },
  { value: "store_owner", label: "Store owner" },
  { value: "platform_admin", label: "Platform admin" },
];

function parseBooleanFilter(value: string) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export default function AdminUsersPage() {
  const [filters, setFilters] = useState<AdminUserFilters>(defaultFilters);
  const usersQuery = useAdminUsers(filters);
  const users = usersQuery.data?.users ?? [];
  const pagination = usersQuery.data?.pagination;

  const updateFilters = (updates: Partial<AdminUserFilters>) => {
    setFilters((current) => ({ ...current, ...updates, page: 1 }));
  };

  const clearFilters = () => setFilters(defaultFilters);

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Admin" }, { label: "Users" }]} />
      <PageHeader title="User management" description="Review platform accounts and account details from a read-only administrative view." />

      <DashboardCard title="Platform users" description="Search and filter users by account role, activity, and verification state.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(16rem,1.5fr)_repeat(4,minmax(9rem,1fr))_auto]">
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-500 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
            <Search className="h-4 w-4 shrink-0" />
            <input value={filters.search ?? ""} onChange={(event) => updateFilters({ search: event.target.value || undefined })} placeholder="Search name, email, mobile, or ID" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-stone-400" />
          </label>

          <select value={filters.role ?? ""} onChange={(event) => updateFilters({ role: (event.target.value || undefined) as UserRole | undefined })} className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
            <option value="">All roles</option>
            {roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>

          <select value={filters.isActive === undefined ? "" : String(filters.isActive)} onChange={(event) => updateFilters({ isActive: parseBooleanFilter(event.target.value) })} className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
            <option value="">All activity</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <select value={filters.emailVerified === undefined ? "" : String(filters.emailVerified)} onChange={(event) => updateFilters({ emailVerified: parseBooleanFilter(event.target.value) })} className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
            <option value="">Email: all</option>
            <option value="true">Email verified</option>
            <option value="false">Email unverified</option>
          </select>

          <select value={filters.phoneVerified === undefined ? "" : String(filters.phoneVerified)} onChange={(event) => updateFilters({ phoneVerified: parseBooleanFilter(event.target.value) })} className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
            <option value="">Phone: all</option>
            <option value="true">Phone verified</option>
            <option value="false">Phone unverified</option>
          </select>

          <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
            <RotateCcw className="h-4 w-4" />
            Clear
          </Button>
        </div>

        <div className="mt-5">
          {usersQuery.isLoading ? <EmptyState title="Loading users" description="Fetching the latest platform accounts." /> : null}
          {usersQuery.isError ? <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300">{usersQuery.error instanceof Error ? usersQuery.error.message : "Unable to load users."}</div> : null}
          {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 ? <EmptyState title="No users found" description="No accounts match the current search and filters." /> : null}
          {!usersQuery.isLoading && !usersQuery.isError && users.length > 0 ? <div className="space-y-3">{users.map((user) => <AdminUserRow key={user.userId} user={user} />)}</div> : null}
        </div>

        {pagination && pagination.totalPages > 0 ? (
          <div className="mt-5 flex flex-col gap-3 border-t border-stone-200 pt-4 text-sm text-stone-600 dark:border-stone-800 dark:text-stone-300 sm:flex-row sm:items-center sm:justify-between">
            <span>Page {pagination.page} of {pagination.totalPages} - {pagination.total} users</span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" disabled={pagination.page <= 1 || usersQuery.isFetching} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}>Previous</Button>
              <Button type="button" variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages || usersQuery.isFetching} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}>Next</Button>
            </div>
          </div>
        ) : null}
      </DashboardCard>
    </DashboardContent>
  );
}
