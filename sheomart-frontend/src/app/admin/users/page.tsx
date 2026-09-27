"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  Plus,
  RotateCcw,
  Search,
  Shield,
  Store,
  Trash2,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { AdminUserRow } from "@/components/dashboard/admin/AdminUserRow";
import { ConfirmDialog } from "@/components/dashboard/admin/ConfirmDialog";
import { UserBulkToolbar } from "@/components/dashboard/admin/UserBulkToolbar";
import { UserDetailsModal } from "@/components/dashboard/admin/UserDetailsModal";
import { UserFormModal } from "@/components/dashboard/admin/UserFormModal";
import { UserRoleModal } from "@/components/dashboard/admin/UserRoleModal";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  useAdminUsers,
  useAdminUserStats,
  useBulkUserAction,
  useDeleteAdminUser,
  useRestoreAdminUser,
  useUpdateUserStatus,
  useVerifyCustomer,
} from "@/hooks/use-admin-users";
import { useAuthStore } from "@/store/auth-store";
import type { AdminUser, AdminUserFilters, AdminUserStatus } from "@/types/admin-user";
import type { UserRole } from "@/types/auth";

type ActiveTab = "all" | "customers" | "verified" | "sellers" | "admins" | "suspended" | "trash";

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

export default function AdminUsersPage() {
  const currentAdmin = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [filters, setFilters] = useState<AdminUserFilters>(defaultFilters);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Modals state
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [roleChangingUser, setRoleChangingUser] = useState<AdminUser | null>(null);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    confirmVariant: "danger" | "primary" | "warning";
    action: () => Promise<void>;
  }>({
    open: false,
    title: "",
    description: "",
    confirmLabel: "Confirm",
    confirmVariant: "danger",
    action: async () => {},
  });
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  // Queries
  const statsQuery = useAdminUserStats();
  const stats = statsQuery.data;

  // Build query filters based on active tab + user filters
  const computedFilters = useMemo<AdminUserFilters>(() => {
    const base: AdminUserFilters = { ...filters };

    switch (activeTab) {
      case "customers":
        base.role = "customer";
        base.status = "all";
        break;
      case "verified":
        base.role = "customer";
        base.isVerifiedCustomer = true;
        base.status = "all";
        break;
      case "sellers":
        base.role = "store_owner";
        base.status = "all";
        break;
      case "admins":
        base.role = "platform_admin";
        base.status = "all";
        break;
      case "suspended":
        base.status = "suspended";
        break;
      case "trash":
        base.status = "deleted";
        break;
      default:
        // "all" tab
        if (!base.status) base.status = "all";
        break;
    }

    return base;
  }, [filters, activeTab]);

  const usersQuery = useAdminUsers(computedFilters);
  const users = usersQuery.data?.users ?? [];
  const pagination = usersQuery.data?.pagination;

  // Mutations
  const suspendMutation = useUpdateUserStatus();
  const verifyMutation = useVerifyCustomer();
  const deleteMutation = useDeleteAdminUser();
  const restoreMutation = useRestoreAdminUser();
  const bulkMutation = useBulkUserAction();

  // Tab change
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSelectedUserIds([]);
    setFilters((prev) => ({
      ...prev,
      page: 1,
      role: undefined,
      isVerifiedCustomer: undefined,
      status: undefined,
    }));
  };

  const updateFilters = (updates: Partial<AdminUserFilters>) => {
    setFilters((current) => ({ ...current, ...updates, page: 1 }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setSelectedUserIds([]);
  };

  // Selection handlers
  const handleSelectUser = (userId: string) => {
    setSelectedUserIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map((u) => u.userId));
    }
  };

  // Actions
  const handleToggleSuspend = (user: AdminUser) => {
    const isSuspending = !user.isSuspended;
    setConfirmDialog({
      open: true,
      title: isSuspending ? `Suspend ${user.name}?` : `Reactivate ${user.name}?`,
      description: isSuspending
        ? "Suspending will terminate all active sessions and block login until reactivated."
        : "Reactivating will restore account access immediately.",
      confirmLabel: isSuspending ? "Suspend User" : "Reactivate User",
      confirmVariant: isSuspending ? "warning" : "primary",
      action: async () => {
        await suspendMutation.mutateAsync({
          userId: user.userId,
          isSuspended: isSuspending,
          suspendedReason: isSuspending ? "Suspended by administrator" : undefined,
        });
      },
    });
  };

  const handleToggleVerify = async (user: AdminUser) => {
    await verifyMutation.mutateAsync({
      userId: user.userId,
      isVerifiedCustomer: !user.isVerifiedCustomer,
    });
  };

  const handleDelete = (user: AdminUser) => {
    setConfirmDialog({
      open: true,
      title: `Move ${user.name} to Trash?`,
      description:
        "The account will be deactivated and moved to Trash. It can be restored later from the Trash tab.",
      confirmLabel: "Move to Trash",
      confirmVariant: "danger",
      action: async () => {
        await deleteMutation.mutateAsync(user.userId);
      },
    });
  };

  const handleRestore = async (user: AdminUser) => {
    await restoreMutation.mutateAsync(user.userId);
  };

  // Bulk actions
  const executeBulkAction = (
    action: "verify" | "unverify" | "suspend" | "activate" | "delete" | "restore" | "assign_seller" | "remove_seller",
    title: string,
    description: string,
    variant: "danger" | "primary" | "warning" = "primary"
  ) => {
    if (selectedUserIds.length === 0) return;
    setConfirmDialog({
      open: true,
      title,
      description,
      confirmLabel: title,
      confirmVariant: variant,
      action: async () => {
        await bulkMutation.mutateAsync({ userIds: selectedUserIds, action });
        setSelectedUserIds([]);
      },
    });
  };

  const runConfirmAction = async () => {
    try {
      setIsConfirmLoading(true);
      await confirmDialog.action();
      setConfirmDialog((prev) => ({ ...prev, open: false }));
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setIsConfirmLoading(false);
    }
  };

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Admin" }, { label: "Users" }]} />

      <PageHeader
        category="USER MANAGEMENT"
        title="User Management"
        description="Control customer accounts, seller privileges, verification status, and system roles."
        actions={
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 shrink-0 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Create User
          </Button>
        }
      />

      {/* KPI Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div
          onClick={() => handleTabChange("all")}
          className={`cursor-pointer rounded-2xl border p-4 transition shadow-sm ${
            activeTab === "all"
              ? "border-emerald-600 bg-emerald-50/40 dark:border-emerald-500 dark:bg-emerald-950/30"
              : "border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Total Users</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100">
            {stats?.total ?? "..."}
          </div>
          <span className="text-xs text-stone-500">{stats?.active ?? 0} active accounts</span>
        </div>

        <div
          onClick={() => handleTabChange("verified")}
          className={`cursor-pointer rounded-2xl border p-4 transition shadow-sm ${
            activeTab === "verified"
              ? "border-emerald-600 bg-emerald-50/40 dark:border-emerald-500 dark:bg-emerald-950/30"
              : "border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Verified Customers</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {stats?.verifiedCustomers ?? "..."}
          </div>
          <span className="text-xs text-stone-500">Out of {stats?.customers ?? 0} total customers</span>
        </div>

        <div
          onClick={() => handleTabChange("sellers")}
          className={`cursor-pointer rounded-2xl border p-4 transition shadow-sm ${
            activeTab === "sellers"
              ? "border-emerald-600 bg-emerald-50/40 dark:border-emerald-500 dark:bg-emerald-950/30"
              : "border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Store Owners (Sellers)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-400">
            {stats?.sellers ?? "..."}
          </div>
          <span className="text-xs text-stone-500">Merchant accounts</span>
        </div>

        <div
          onClick={() => handleTabChange("suspended")}
          className={`cursor-pointer rounded-2xl border p-4 transition shadow-sm ${
            activeTab === "suspended"
              ? "border-emerald-600 bg-emerald-50/40 dark:border-emerald-500 dark:bg-emerald-950/30"
              : "border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Suspended Users</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-700 dark:text-rose-400">
            {stats?.suspended ?? "..."}
          </div>
          <span className="text-xs text-stone-500">{stats?.deleted ?? 0} in trash</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 dark:border-stone-800 overflow-x-auto">
        {[
          { key: "all", label: "All Users", count: stats?.total },
          { key: "customers", label: "Customers", count: stats?.customers },
          { key: "verified", label: "Verified Customers", count: stats?.verifiedCustomers },
          { key: "sellers", label: "Sellers", count: stats?.sellers },
          { key: "admins", label: "Admins", count: stats?.admins },
          { key: "suspended", label: "Suspended", count: stats?.suspended },
          { key: "trash", label: "Trash", count: stats?.deleted },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key as ActiveTab)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isActive
                      ? "bg-emerald-700 text-white"
                      : "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Filter & Table Card */}
      <DashboardCard
        title="Account Directory"
        description="Filter by role, verification status, active states, and perform batch operations."
      >
        {/* Search & Filters Grid */}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(14rem,1.5fr)_repeat(3,minmax(9rem,1fr))_minmax(9rem,1fr)_auto]">
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-500 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
            <Search className="h-4 w-4 shrink-0" />
            <input
              value={filters.search ?? ""}
              onChange={(e) => updateFilters({ search: e.target.value || undefined })}
              placeholder="Search by name, email, mobile, or ID"
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-stone-400"
            />
          </label>

          {/* Role Filter (when in all or trash tab) */}
          {activeTab === "all" || activeTab === "trash" || activeTab === "suspended" ? (
            <select
              value={filters.role ?? ""}
              onChange={(e) =>
                updateFilters({ role: (e.target.value || undefined) as UserRole | undefined })
              }
              className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
            >
              <option value="">All roles</option>
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : null}

          {/* Status Filter */}
          {activeTab !== "trash" && activeTab !== "suspended" && (
            <select
              value={filters.status ?? ""}
              onChange={(e) =>
                updateFilters({ status: (e.target.value || undefined) as AdminUserStatus | undefined })
              }
              className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          )}

          {/* Verification Filter */}
          {activeTab !== "verified" && (
            <select
              value={
                filters.isVerifiedCustomer === undefined ? "" : String(filters.isVerifiedCustomer)
              }
              onChange={(e) =>
                updateFilters({
                  isVerifiedCustomer:
                    e.target.value === "true" ? true : e.target.value === "false" ? false : undefined,
                })
              }
              className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
            >
              <option value="">Verification: all</option>
              <option value="true">Verified customers</option>
              <option value="false">Unverified</option>
            </select>
          )}

          {/* Sort By Filter */}
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split("-") as [
                AdminUserFilters["sortBy"],
                "asc" | "desc"
              ];
              updateFilters({ sortBy, sortOrder });
            }}
            className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
          >
            <option value="createdAt-desc">Newest joined first</option>
            <option value="createdAt-asc">Oldest joined first</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="lastLoginAt-desc">Recently active</option>
          </select>

          <Button type="button" variant="outline" size="sm" onClick={clearFilters} className="min-h-11 gap-1.5">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Table Selection Header */}
        {users.length > 0 && (
          <div className="mt-4 flex items-center justify-between border-b border-stone-200/80 pb-2 dark:border-stone-800 text-xs text-stone-500">
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={selectedUserIds.length === users.length && users.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                {selectedUserIds.length > 0
                  ? `${selectedUserIds.length} of ${users.length} selected on this page`
                  : "Select all on page"}
              </span>
            </label>
            <span>Total {pagination?.total ?? users.length} user accounts</span>
          </div>
        )}

        {/* User Rows List */}
        <div className="mt-4">
          {usersQuery.isLoading ? (
            <EmptyState title="Loading users" description="Fetching platform accounts with administrative permissions..." />
          ) : null}

          {usersQuery.isError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300">
              {usersQuery.error instanceof Error ? usersQuery.error.message : "Unable to load users."}
            </div>
          ) : null}

          {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 ? (
            <EmptyState
              title="No users match the criteria"
              description="Try adjusting your search keywords, role filters, or tab selection."
            />
          ) : null}

          {!usersQuery.isLoading && !usersQuery.isError && users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user) => (
                <AdminUserRow
                  key={user.userId}
                  user={user}
                  isSelected={selectedUserIds.includes(user.userId)}
                  onSelect={handleSelectUser}
                  onView={(u) => setViewingUser(u)}
                  onEdit={(u) => setEditingUser(u)}
                  onChangeRole={(u) => setRoleChangingUser(u)}
                  onToggleVerify={handleToggleVerify}
                  onToggleSuspend={handleToggleSuspend}
                  onDelete={handleDelete}
                  onRestore={handleRestore}
                  currentUserId={currentAdmin?.userId}
                  isTrashTab={activeTab === "trash"}
                />
              ))}
            </div>
          ) : null}
        </div>

        {/* Working Pagination Bar */}
        {pagination && pagination.totalPages > 0 ? (
          <div className="mt-6 flex flex-col gap-4 border-t border-stone-200 pt-4 text-sm text-stone-600 dark:border-stone-800 dark:text-stone-300 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={filters.limit}
                onChange={(e) => updateFilters({ limit: Number(e.target.value) })}
                className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs text-stone-700 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>per page</span>
              <span className="text-stone-400">·</span>
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1 || usersQuery.isFetching}
                onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
              >
                Previous
              </Button>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let p = i + 1;
                if (pagination.totalPages > 5 && pagination.page > 3) {
                  p = pagination.page - 2 + i;
                  if (p > pagination.totalPages) p = pagination.totalPages - (4 - i);
                }
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFilters((current) => ({ ...current, page: p }))}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
                      pagination.page === p
                        ? "bg-emerald-600 text-white"
                        : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages || usersQuery.isFetching}
                onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </DashboardCard>

      {/* Floating Bulk Actions Toolbar */}
      <UserBulkToolbar
        selectedCount={selectedUserIds.length}
        isDeletedTab={activeTab === "trash"}
        isProcessing={bulkMutation.isPending}
        onVerify={() =>
          executeBulkAction(
            "verify",
            "Mark as Verified Customers",
            `Verify ${selectedUserIds.length} selected customer accounts with customer trust badge.`
          )
        }
        onUnverify={() =>
          executeBulkAction(
            "unverify",
            "Remove Verification",
            `Remove customer verification badge from ${selectedUserIds.length} selected accounts.`
          )
        }
        onActivate={() =>
          executeBulkAction(
            "activate",
            "Activate Selected Users",
            `Unsuspend and activate ${selectedUserIds.length} selected accounts.`
          )
        }
        onSuspend={() =>
          executeBulkAction(
            "suspend",
            "Suspend Selected Users",
            `Suspend ${selectedUserIds.length} selected accounts and terminate their sessions.`,
            "warning"
          )
        }
        onDelete={() =>
          executeBulkAction(
            "delete",
            "Move Users to Trash",
            `Move ${selectedUserIds.length} selected accounts to trash.`,
            "danger"
          )
        }
        onRestore={() =>
          executeBulkAction(
            "restore",
            "Restore Accounts",
            `Restore ${selectedUserIds.length} selected accounts from trash back to active status.`
          )
        }
        onAssignSeller={() =>
          executeBulkAction(
            "assign_seller",
            "Promote to Store Owner",
            `Upgrade ${selectedUserIds.length} customer accounts to Store Owner role.`
          )
        }
        onRemoveSeller={() =>
          executeBulkAction(
            "remove_seller",
            "Demote to Customer",
            `Change ${selectedUserIds.length} store owners to customer role.`
          )
        }
        onClear={() => setSelectedUserIds([])}
      />

      {/* User Details Modal */}
      {viewingUser && (
        <UserDetailsModal
          userId={viewingUser.userId}
          onClose={() => setViewingUser(null)}
          onEdit={(u) => {
            setViewingUser(null);
            setEditingUser(u);
          }}
        />
      )}

      {/* User Create/Edit Modal */}
      {(isCreateOpen || editingUser) && (
        <UserFormModal
          open={isCreateOpen || Boolean(editingUser)}
          user={editingUser}
          onClose={() => {
            setIsCreateOpen(false);
            setEditingUser(null);
          }}
          onSuccess={() => {
            usersQuery.refetch();
            statsQuery.refetch();
          }}
        />
      )}

      {/* User Role Modal */}
      {roleChangingUser && (
        <UserRoleModal
          open={Boolean(roleChangingUser)}
          user={roleChangingUser}
          currentAdminUserId={currentAdmin?.userId}
          onClose={() => setRoleChangingUser(null)}
          onSuccess={() => {
            usersQuery.refetch();
            statsQuery.refetch();
          }}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        confirmVariant={confirmDialog.confirmVariant}
        isLoading={isConfirmLoading}
        onConfirm={runConfirmAction}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />
    </DashboardContent>
  );
}
