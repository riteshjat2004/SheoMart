"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Tag,
  Copy,
  Check,
  Edit2,
  Trash2,
  Eye,
  Power,
  Layers,
  ArrowUpDown,
  MoreVertical,
  Clock,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Pagination } from "@/components/dashboard/Pagination";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  useSellerCoupons,
  useUpdateSellerCouponStatus,
  useDeleteSellerCoupon,
  useDuplicateSellerCoupon,
  useBulkSellerCouponAction,
} from "@/hooks/use-seller-coupons";
import type { SellerCouponItem } from "@/types/seller-coupon";
import { SellerCouponDetailsModal } from "@/components/dashboard/store/SellerCouponDetailsModal";
import { SellerCouponFormModal } from "@/components/dashboard/store/SellerCouponFormModal";

interface SellerCouponManagementTableProps {
  onSummaryChange?: (summary: any) => void;
}

const money = (val?: number) => `₹${(val ?? 0).toLocaleString("en-IN")}`;
const formatDate = (val?: string | null) =>
  val
    ? new Date(val).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

export function SellerCouponManagementTable({ onSummaryChange }: SellerCouponManagementTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [discountTypeFilter, setDiscountTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Selected for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [detailsCoupon, setDetailsCoupon] = useState<SellerCouponItem | null>(null);
  const [editCoupon, setEditCoupon] = useState<SellerCouponItem | null>(null);
  const [deleteConfirmCoupon, setDeleteConfirmCoupon] = useState<SellerCouponItem | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const couponsQuery = useSellerCoupons({
    page,
    limit: 10,
    search: search.trim() || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    discountType: discountTypeFilter !== "all" ? discountTypeFilter : undefined,
    sortBy,
  });

  const updateStatusMutation = useUpdateSellerCouponStatus();
  const deleteMutation = useDeleteSellerCoupon();
  const duplicateMutation = useDuplicateSellerCoupon();
  const bulkActionMutation = useBulkSellerCouponAction();

  const coupons = couponsQuery.data?.coupons ?? [];
  const pagination = couponsQuery.data?.pagination;
  const summary = couponsQuery.data?.summary;

  useEffect(() => {
    if (summary && onSummaryChange) {
      onSummaryChange(summary);
    }
  }, [summary, onSummaryChange]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(coupons.map((c) => c.couponId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (couponId: string) => {
    setSelectedIds((prev) =>
      prev.includes(couponId) ? prev.filter((id) => id !== couponId) : [...prev, couponId]
    );
  };

  const handleCopy = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const handleBulkAction = (action: "activate" | "deactivate" | "delete") => {
    if (selectedIds.length === 0) return;
    if (
      action === "delete" &&
      !window.confirm(`Are you sure you want to delete ${selectedIds.length} selected coupons?`)
    ) {
      return;
    }
    bulkActionMutation.mutate(
      { action, couponIds: selectedIds },
      {
        onSuccess: () => {
          setSelectedIds([]);
        },
      }
    );
  };

  const allSelected = coupons.length > 0 && selectedIds.length === coupons.length;

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search coupon title or code..."
            className="h-10 w-full rounded-xl border border-stone-200 bg-white pl-9 pr-3 text-xs text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter coupons by status"
            className="h-10 rounded-xl border border-stone-200 bg-white px-3 text-xs font-medium text-stone-700 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
            <option value="disabled">Disabled</option>
          </select>

          {/* Discount Type Filter */}
          <select
            value={discountTypeFilter}
            onChange={(e) => {
              setDiscountTypeFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter coupons by discount type"
            className="h-10 rounded-xl border border-stone-200 bg-white px-3 text-xs font-medium text-stone-700 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200"
          >
            <option value="all">All Discount Types</option>
            <option value="percentage">Percentage (%)</option>
            <option value="flat">Flat Amount (₹)</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            aria-label="Sort coupons"
            className="h-10 rounded-xl border border-stone-200 bg-white px-3 text-xs font-medium text-stone-700 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200"
          >
            <option value="newest">Newest First</option>
            <option value="expiry_asc">Expiring Soonest</option>
            <option value="expiry_desc">Expiring Latest</option>
            <option value="redemptions">Most Redeemed</option>
            <option value="discount_desc">Highest Discount</option>
          </select>
        </div>
      </div>

      {/* Floating Bulk Action Toolbar */}
      {selectedIds.length > 0 ? (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          <span className="font-semibold">
            {selectedIds.length} coupon{selectedIds.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("activate")}
              disabled={bulkActionMutation.isPending}
              className="h-7 text-xs bg-white dark:bg-stone-900"
            >
              Activate
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("deactivate")}
              disabled={bulkActionMutation.isPending}
              className="h-7 text-xs bg-white dark:bg-stone-900"
            >
              Deactivate
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => handleBulkAction("delete")}
              disabled={bulkActionMutation.isPending}
              className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Selected
            </Button>
          </div>
        </div>
      ) : null}

      {/* Content Table */}
      {couponsQuery.isLoading ? <LoadingSkeleton rows={5} /> : null}

      {!couponsQuery.isLoading && coupons.length === 0 ? (
        <EmptyState
          title="No coupons found"
          description="Create your first store discount code to boost sales and reward loyal shoppers."
        />
      ) : null}

      {!couponsQuery.isLoading && coupons.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <table className="min-w-[1050px] w-full text-left text-xs">
            <thead className="bg-stone-50 uppercase text-[11px] tracking-wider text-stone-500 dark:bg-stone-800/60 dark:text-stone-400">
              <tr>
                <th className="px-4 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="px-4 py-3.5">Code & Title</th>
                <th className="px-4 py-3.5">Discount Value</th>
                <th className="px-4 py-3.5">Min Order</th>
                <th className="px-4 py-3.5">Scope & Eligibility</th>
                <th className="px-4 py-3.5">Usage / Limit</th>
                <th className="px-4 py-3.5">Validity</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {coupons.map((c, index) => {
                const isChecked = selectedIds.includes(c.couponId);
                const isMenuOpen = openDropdownId === c.couponId;
                const isNearBottom = coupons.length > 2 ? index >= coupons.length - 2 : index > 0;
                const isExpiringSoon =
                  c.status === "active" &&
                  new Date(c.endsAt).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;

                return (
                  <tr
                    key={c.couponId}
                    className="transition hover:bg-stone-50/50 dark:hover:bg-stone-800/30"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSelectOne(c.couponId)}
                        className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>

                    {/* Code & Title */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(c.code)}
                          className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/80 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 transition"
                          title="Click to copy code"
                        >
                          {c.code}
                          {copiedCode === c.code ? (
                            <Check className="inline ml-1 h-3 w-3 text-emerald-600" />
                          ) : null}
                        </button>
                      </div>
                      <p className="mt-0.5 font-semibold text-stone-900 dark:text-stone-100">
                        {c.title}
                      </p>
                    </td>

                    {/* Discount */}
                    <td className="px-4 py-3">
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      </span>
                      {c.maximumDiscount ? (
                        <p className="text-[10px] text-stone-400">Max {money(c.maximumDiscount)}</p>
                      ) : null}
                    </td>

                    {/* Min Order */}
                    <td className="px-4 py-3 font-semibold text-stone-700 dark:text-stone-300">
                      {money(c.minimumCartValue)}
                    </td>

                    {/* Scope & Eligibility */}
                    <td className="px-4 py-3">
                      <span className="capitalize font-medium text-stone-800 dark:text-stone-200">
                        {c.applicableScope === "store"
                          ? "Entire Store"
                          : c.applicableScope === "category"
                          ? "Categories"
                          : "Products"}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        {c.newUsersOnly ? (
                          <span className="rounded bg-teal-50 text-teal-700 text-[9px] font-semibold px-1.5 py-0.2 dark:bg-teal-950/50 dark:text-teal-300">
                            1st Order
                          </span>
                        ) : null}
                        {c.verifiedOnly ? (
                          <span className="rounded bg-emerald-50 text-emerald-700 text-[9px] font-semibold px-1.5 py-0.2 dark:bg-emerald-950/50 dark:text-emerald-300">
                            Verified
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* Usage / Limit */}
                    <td className="px-4 py-3">
                      <span className="font-semibold text-stone-900 dark:text-stone-100">
                        {c.usageCount || 0}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {" "}
                        / {c.usageLimit !== null ? c.usageLimit : "∞"}
                      </span>
                    </td>

                    {/* Validity */}
                    <td className="px-4 py-3 whitespace-nowrap text-stone-600 dark:text-stone-400">
                      <p>{formatDate(c.endsAt)}</p>
                      {isExpiringSoon ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          <Clock className="h-3 w-3" /> Expiring Soon
                        </span>
                      ) : null}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block text-left">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setOpenDropdownId(isMenuOpen ? null : c.couponId)
                          }
                          aria-label="Coupon actions"
                          className="h-8 w-8"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>

                        {isMenuOpen ? (
                          <>
                            <button
                              type="button"
                              className="fixed inset-0 z-20"
                              onClick={() => setOpenDropdownId(null)}
                            />
                            <div className={`absolute right-0 z-30 w-44 rounded-xl border border-stone-200 bg-white py-1 shadow-xl dark:border-stone-800 dark:bg-stone-900 ${
                              isNearBottom ? "bottom-full mb-1 origin-bottom-right" : "mt-1 origin-top-right"
                            }`}>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  setDetailsCoupon(c);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800"
                              >
                                <Eye className="h-3.5 w-3.5 text-stone-400" />
                                View Details
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  setEditCoupon(c);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800"
                              >
                                <Edit2 className="h-3.5 w-3.5 text-stone-400" />
                                Edit Coupon
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  duplicateMutation.mutate(c.couponId);
                                }}
                                disabled={duplicateMutation.isPending}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800"
                              >
                                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                                Duplicate Coupon
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  updateStatusMutation.mutate({
                                    couponId: c.couponId,
                                    isActive: !c.isActive,
                                  });
                                }}
                                disabled={updateStatusMutation.isPending}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800"
                              >
                                <Power className="h-3.5 w-3.5 text-stone-400" />
                                {c.isActive ? "Deactivate" : "Activate"}
                              </button>

                              <div className="my-1 border-t border-stone-100 dark:border-stone-800" />

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  setDeleteConfirmCoupon(c);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                Delete Coupon
                              </button>
                            </div>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 ? (
        <div className="pt-2">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      ) : null}

      {/* Details Modal */}
      {detailsCoupon ? (
        <SellerCouponDetailsModal
          coupon={detailsCoupon}
          onClose={() => setDetailsCoupon(null)}
          onEdit={() => {
            setEditCoupon(detailsCoupon);
            setDetailsCoupon(null);
          }}
        />
      ) : null}

      {/* Edit Modal */}
      {editCoupon ? (
        <SellerCouponFormModal
          coupon={editCoupon}
          onClose={() => setEditCoupon(null)}
        />
      ) : null}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmCoupon ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 id="delete-confirm-title" className="text-base font-bold text-stone-900 dark:text-stone-50">
                Delete Store Coupon
              </h3>
            </div>
            <p className="mt-2 text-xs text-stone-600 dark:text-stone-400">
              Are you sure you want to delete coupon{" "}
              <strong className="text-stone-900 dark:text-stone-100 font-mono">
                {deleteConfirmCoupon.code}
              </strong>
              ? Customers will no longer be able to apply this discount.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmCoupon(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                disabled={deleteMutation.isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={() => {
                  deleteMutation.mutate(deleteConfirmCoupon.couponId, {
                    onSuccess: () => setDeleteConfirmCoupon(null),
                  });
                }}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Coupon"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
