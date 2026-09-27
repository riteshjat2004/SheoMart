"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Check,
  Copy,
  Eye,
  Filter,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/dashboard/admin/ConfirmDialog";
import { CouponDetailsModal } from "@/components/dashboard/admin/CouponDetailsModal";
import { CouponFormModal } from "@/components/dashboard/admin/CouponFormModal";
import { PromotionBulkToolbar } from "@/components/dashboard/admin/PromotionBulkToolbar";
import { fetchCategories } from "@/services/category";
import { fetchAdminStores } from "@/services/store";
import {
  bulkCouponAction,
  createCoupon,
  deleteCoupon,
  fetchAdminCoupons,
  restoreCoupon,
  updateCoupon,
  updateCouponStatus,
  type CouponItem,
  type PromotionStatus,
} from "@/services/promotions";

type TabStatus = "all" | "active" | "scheduled" | "expired" | "disabled" | "deleted";

function getStatusBadge(status: PromotionStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60";
    case "scheduled":
      return "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60";
    case "expired":
      return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60";
    case "disabled":
    case "inactive":
      return "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border border-stone-200 dark:border-stone-700";
    case "deleted":
      return "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60";
    default:
      return "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400";
  }
}

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [detailsCoupon, setDetailsCoupon] = useState<CouponItem | null>(null);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    variant?: "danger" | "primary" | "warning";
    action: () => Promise<void>;
  }>({
    open: false,
    title: "",
    description: "",
    action: async () => {},
  });

  // Queries
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-coupons", activeTab, searchQuery, scopeFilter],
    queryFn: () =>
      fetchAdminCoupons({
        status: activeTab,
        search: searchQuery || undefined,
        scope: scopeFilter,
      }),
  });

  const { data: stores = [] } = useQuery({
    queryKey: ["admin-stores-list"],
    queryFn: fetchAdminStores,
    staleTime: 300000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories-list"],
    queryFn: fetchCategories,
    staleTime: 300000,
  });

  const coupons = data?.coupons ?? [];
  const stats = data?.stats ?? {
    total: 0,
    active: 0,
    scheduled: 0,
    expired: 0,
    disabled: 0,
    deleted: 0,
    totalRedemptions: 0,
  };

  const invalidatePromotions = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    queryClient.invalidateQueries({ queryKey: ["coupons"] });
  };

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (editingCoupon) {
        return updateCoupon(editingCoupon.couponId, payload);
      }
      return createCoupon(payload);
    },
    onSuccess: () => {
      invalidatePromotions();
      setFormOpen(false);
      setEditingCoupon(null);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return updateCouponStatus(id, isActive);
    },
    onSuccess: () => invalidatePromotions(),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteCoupon(id),
    onSuccess: (_data, id) => {
      invalidatePromotions();
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => restoreCoupon(id),
    onSuccess: (_data, id) => {
      invalidatePromotions();
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async (action: "activate" | "deactivate" | "delete" | "restore") => {
      return bulkCouponAction(selectedIds, action);
    },
    onSuccess: () => {
      invalidatePromotions();
      setSelectedIds([]);
    },
  });

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(coupons.map((c) => c.couponId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Admin" }, { label: "Coupon Management" }]} />

      <PageHeader
        category="MARKETING"
        title="Coupon Management"
        description="Configure promotional discount codes, targeting scopes, redemption rules, and validity."
        actions={
          <Button
            onClick={() => {
              setEditingCoupon(null);
              setFormOpen(true);
            }}
            className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create Coupon
          </Button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <DashboardCard title="Total" description="All registered">
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{stats.total}</p>
        </DashboardCard>
        <DashboardCard title="Active" description="Live now">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</p>
        </DashboardCard>
        <DashboardCard title="Scheduled" description="Upcoming">
          <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{stats.scheduled}</p>
        </DashboardCard>
        <DashboardCard title="Expired" description="Past validity / limit">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.expired}</p>
        </DashboardCard>
        <DashboardCard title="Disabled" description="Turned off">
          <p className="text-2xl font-bold text-stone-500">{stats.disabled}</p>
        </DashboardCard>
        <DashboardCard title="Redemptions" description="Total orders used">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.totalRedemptions}</p>
        </DashboardCard>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-950">
        {/* Status Tabs */}
        <div className="flex border-b border-stone-200 px-4 dark:border-stone-800 overflow-x-auto">
          {(
            [
              { key: "all", label: "All Coupons", count: stats.total },
              { key: "active", label: "Active", count: stats.active },
              { key: "scheduled", label: "Scheduled", count: stats.scheduled },
              { key: "expired", label: "Expired", count: stats.expired },
              { key: "disabled", label: "Disabled", count: stats.disabled },
              { key: "deleted", label: "Trash", count: stats.deleted },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                setSelectedIds([]);
              }}
              className={`flex items-center gap-2 border-b-2 px-4 py-3.5 text-xs font-semibold whitespace-nowrap transition ${
                activeTab === tab.key
                  ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
                  : "border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  activeTab === tab.key
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 dark:border-stone-800/60">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coupons by code or title..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2 pl-9 pr-4 text-xs outline-none transition focus:border-emerald-500 focus:bg-white dark:border-stone-800 dark:bg-stone-900 dark:focus:bg-stone-950"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <Filter className="h-3.5 w-3.5" />
              <span>Scope:</span>
            </div>
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700 outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
            >
              <option value="all">All Scopes</option>
              <option value="marketplace">Marketplace</option>
              <option value="store">Store Specific</option>
              <option value="category">Category Specific</option>
              <option value="product">Product Specific</option>
            </select>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/90 backdrop-blur font-semibold uppercase tracking-wider text-stone-500 dark:border-stone-800 dark:bg-stone-900/90">
              <tr>
                <th className="py-3 pl-4 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={coupons.length > 0 && selectedIds.length === coupons.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="py-3 px-3">Coupon Code</th>
                <th className="py-3 px-3">Title & Scope</th>
                <th className="py-3 px-3">Discount</th>
                <th className="py-3 px-3">Min Order</th>
                <th className="py-3 px-3">Redemptions</th>
                <th className="py-3 px-3">Validity</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Active</th>
                <th className="py-3 pl-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-stone-400">
                    Loading coupons...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-rose-500">
                    {error instanceof Error ? error.message : "Failed to load coupons"}
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-stone-400">
                    No coupons found in this view.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const isSelected = selectedIds.includes(coupon.couponId);
                  return (
                    <tr
                      key={coupon.couponId}
                      className={`transition hover:bg-stone-50/60 dark:hover:bg-stone-900/40 ${
                        isSelected ? "bg-emerald-50/30 dark:bg-emerald-950/20" : ""
                      }`}
                    >
                      <td className="py-3 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectOne(coupon.couponId, e.target.checked)}
                          className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <code className="rounded-md bg-stone-100 px-2 py-0.5 font-mono text-xs font-bold text-stone-900 dark:bg-stone-800 dark:text-stone-100">
                            {coupon.code}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(coupon.code)}
                            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                            title="Copy coupon code"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-3 max-w-[200px]">
                        <p className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {coupon.title}
                        </p>
                        <span className="text-[11px] text-stone-500 capitalize">
                          {coupon.applicableScope === "store"
                            ? coupon.storeName || "Store"
                            : coupon.applicableScope === "category"
                              ? coupon.categoryName || "Category"
                              : coupon.applicableScope}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}%`
                            : `₹${coupon.discountValue}`}
                        </span>
                        {coupon.maximumDiscount && (
                          <span className="block text-[10px] text-stone-400">
                            Cap: ₹{coupon.maximumDiscount}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-stone-700 dark:text-stone-300 font-medium">
                        ₹{coupon.minimumCartValue}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-stone-900 dark:text-stone-100">
                          {coupon.usageCount}
                        </span>
                        <span className="text-stone-400"> / {coupon.usageLimit ?? "∞"}</span>
                      </td>

                      <td className="py-3 px-3 text-stone-500 dark:text-stone-400">
                        <span>{new Date(coupon.startsAt).toLocaleDateString()}</span>
                        <span className="block text-[10px] text-stone-400">
                          to {new Date(coupon.endsAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${getStatusBadge(
                            coupon.status
                          )}`}
                        >
                          {coupon.status}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {!coupon.isDeleted ? (
                          <button
                            type="button"
                            onClick={() =>
                              toggleStatusMutation.mutate({
                                id: coupon.couponId,
                                isActive: !coupon.isActive,
                              })
                            }
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              coupon.isActive ? "bg-emerald-600" : "bg-stone-300 dark:bg-stone-700"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                coupon.isActive ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        ) : (
                          <span className="text-stone-400 text-[10px]">Deleted</span>
                        )}
                      </td>

                      <td className="py-3 pl-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                            onClick={() => setDetailsCoupon(coupon)}
                            title="View details & simulation"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          {!coupon.isDeleted ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                                onClick={() => {
                                  setEditingCoupon(coupon);
                                  setFormOpen(true);
                                }}
                                title="Edit coupon"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                                onClick={() =>
                                  setConfirmDialog({
                                    open: true,
                                    title: "Move Coupon to Trash?",
                                    description: `Are you sure you want to deactivate and remove coupon "${coupon.code}"? It will no longer apply to any orders, but its history is preserved in Trash.`,
                                    confirmLabel: "Move to Trash",
                                    variant: "danger",
                                    action: async () => {
                                      await deleteMutation.mutateAsync(coupon.couponId);
                                      setConfirmDialog((prev) => ({ ...prev, open: false }));
                                    },
                                  })
                                }
                                title="Delete coupon"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40"
                              onClick={() =>
                                setConfirmDialog({
                                  open: true,
                                  title: "Restore Coupon?",
                                  description: `Restore coupon "${coupon.code}" from trash back to active coupon records?`,
                                  confirmLabel: "Restore Coupon",
                                  variant: "primary",
                                  action: async () => {
                                    await restoreMutation.mutateAsync(coupon.couponId);
                                    setConfirmDialog((prev) => ({ ...prev, open: false }));
                                  },
                                })
                              }
                              title="Restore coupon"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CouponFormModal
        open={formOpen}
        coupon={editingCoupon}
        stores={stores}
        categories={categories}
        isSubmitting={saveMutation.isPending}
        onClose={() => {
          setFormOpen(false);
          setEditingCoupon(null);
        }}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />

      <CouponDetailsModal
        open={Boolean(detailsCoupon)}
        coupon={detailsCoupon}
        stores={stores}
        categories={categories}
        onClose={() => setDetailsCoupon(null)}
        onEdit={(coupon) => {
          setDetailsCoupon(null);
          setEditingCoupon(coupon);
          setFormOpen(true);
        }}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        confirmVariant={confirmDialog.variant}
        isLoading={deleteMutation.isPending || restoreMutation.isPending}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />

      {/* Floating Bulk Toolbar */}
      <PromotionBulkToolbar
        selectedCount={selectedIds.length}
        isDeletedTab={activeTab === "deleted"}
        isProcessing={bulkMutation.isPending}
        onActivate={() => bulkMutation.mutate("activate")}
        onDeactivate={() => bulkMutation.mutate("deactivate")}
        onDelete={() =>
          setConfirmDialog({
            open: true,
            title: `Delete ${selectedIds.length} Selected Coupons?`,
            description: "These coupons will be moved to trash and deactivated.",
            confirmLabel: "Delete Selected",
            variant: "danger",
            action: async () => {
              await bulkMutation.mutateAsync("delete");
              setConfirmDialog((prev) => ({ ...prev, open: false }));
            },
          })
        }
        onRestore={() =>
          setConfirmDialog({
            open: true,
            title: `Restore ${selectedIds.length} Selected Coupons?`,
            description: "These coupons will be restored from trash.",
            confirmLabel: "Restore Selected",
            variant: "primary",
            action: async () => {
              await bulkMutation.mutateAsync("restore");
              setConfirmDialog((prev) => ({ ...prev, open: false }));
            },
          })
        }
        onClear={() => setSelectedIds([])}
      />
    </DashboardContent>
  );
}
