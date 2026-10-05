"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Eye,
  Filter,
  Flame,
  Image as ImageIcon,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/dashboard/admin/ConfirmDialog";
import { OfferDetailsModal } from "@/components/dashboard/admin/OfferDetailsModal";
import { OfferFormModal } from "@/components/dashboard/admin/OfferFormModal";
import { PromotionBulkToolbar } from "@/components/dashboard/admin/PromotionBulkToolbar";
import { fetchCategories } from "@/services/category";
import { fetchAdminStores } from "@/services/store";
import {
  bulkOfferAction,
  createOffer,
  deleteOffer,
  fetchAdminOffers,
  restoreOffer,
  updateOffer,
  updateOfferStatus,
  type OfferItem,
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

export default function AdminOffersPage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [offerTypeFilter, setOfferTypeFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferItem | null>(null);
  const [detailsOffer, setDetailsOffer] = useState<OfferItem | null>(null);

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
    queryKey: ["admin-offers", activeTab, searchQuery, offerTypeFilter],
    queryFn: () =>
      fetchAdminOffers({
        status: activeTab,
        search: searchQuery || undefined,
        offerType: offerTypeFilter,
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

  const offers = data?.offers ?? [];
  const stats = data?.stats ?? {
    total: 0,
    active: 0,
    homepageOffers: 0,
    flashSales: 0,
    expired: 0,
    deleted: 0,
  };

  const invalidatePromotions = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
    queryClient.invalidateQueries({ queryKey: ["offers"] });
  };

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (editingOffer) {
        return updateOffer(editingOffer.offerId, formData);
      }
      return createOffer(formData);
    },
    onSuccess: () => {
      invalidatePromotions();
      setFormOpen(false);
      setEditingOffer(null);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return updateOfferStatus(id, isActive);
    },
    onSuccess: () => invalidatePromotions(),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteOffer(id),
    onSuccess: (_data, id) => {
      invalidatePromotions();
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => restoreOffer(id),
    onSuccess: (_data, id) => {
      invalidatePromotions();
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async (action: "activate" | "deactivate" | "delete" | "restore") => {
      return bulkOfferAction(selectedIds, action);
    },
    onSuccess: () => {
      invalidatePromotions();
      setSelectedIds([]);
    },
  });

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(offers.map((o) => o.offerId));
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

  const renderDiscountText = (offer: OfferItem) => {
    if (offer.offerType === "bogo") return "BOGO Free";
    if (offer.offerType === "buy_x_get_y") return `Buy ${offer.buyQuantity} Get ${offer.getQuantity}`;
    if (offer.offerType === "free_delivery") return "Free Delivery";
    return offer.discountType === "percentage" ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`;
  };

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Admin" }, { label: "Festival Offers" }]} />

      <PageHeader
        category="MARKETING"
        title="Promotional Offer Management"
        description="Schedule seasonal marketing campaigns, manage homepage banner placements, flash sales, and category-wide discounts."
        actions={
          <Button
            onClick={() => {
              saveMutation.reset();
              setEditingOffer(null);
              setFormOpen(true);
            }}
            className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create Campaign
          </Button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <DashboardCard title="Total" description="All campaigns">
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{stats.total}</p>
        </DashboardCard>
        <DashboardCard title="Active" description="Live campaigns">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</p>
        </DashboardCard>
        <DashboardCard title="Homepage" description="Hero / Featured">
          <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{stats.homepageOffers}</p>
        </DashboardCard>
        <DashboardCard title="Flash Sales" description="Limited-time rush">
          <p className="text-2xl font-bold text-amber-500">{stats.flashSales}</p>
        </DashboardCard>
        <DashboardCard title="Expired" description="Past end date">
          <p className="text-2xl font-bold text-stone-500">{stats.expired}</p>
        </DashboardCard>
        <DashboardCard title="Trash" description="Deleted items">
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.deleted}</p>
        </DashboardCard>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-950">
        {/* Status Tabs */}
        <div className="flex border-b border-stone-200 px-4 dark:border-stone-800 overflow-x-auto">
          {(
            [
              { key: "all", label: "All Offers", count: stats.total },
              { key: "active", label: "Active", count: stats.active },
              { key: "scheduled", label: "Scheduled", count: 0 },
              { key: "expired", label: "Expired", count: stats.expired },
              { key: "disabled", label: "Disabled", count: 0 },
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
              placeholder="Search campaigns by title or festival name..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2 pl-9 pr-4 text-xs outline-none transition focus:border-emerald-500 focus:bg-white dark:border-stone-800 dark:bg-stone-900 dark:focus:bg-stone-950"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <Filter className="h-3.5 w-3.5" />
              <span>Type:</span>
            </div>
            <select
              value={offerTypeFilter}
              onChange={(e) => setOfferTypeFilter(e.target.value)}
              className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700 outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
            >
              <option value="all">All Campaign Types</option>
              <option value="percentage">Percentage Off</option>
              <option value="flat">Flat Discount</option>
              <option value="bogo">BOGO</option>
              <option value="buy_x_get_y">Buy X Get Y</option>
              <option value="free_delivery">Free Delivery</option>
              <option value="flash_sale">Flash Sale</option>
            </select>
          </div>
        </div>

        {/* Offers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/90 backdrop-blur font-semibold uppercase tracking-wider text-stone-500 dark:border-stone-800 dark:bg-stone-900/90">
              <tr>
                <th className="py-3 pl-4 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={offers.length > 0 && selectedIds.length === offers.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="py-3 px-3">Banner</th>
                <th className="py-3 px-3">Campaign & Festival</th>
                <th className="py-3 px-3">Type & Discount</th>
                <th className="py-3 px-3">Targets & Scope</th>
                <th className="py-3 px-3">Placements</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Validity</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Active</th>
                <th className="py-3 pl-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-stone-400">
                    Loading campaigns...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-rose-500">
                    {error instanceof Error ? error.message : "Failed to load offers"}
                  </td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-stone-400">
                    No promotional campaigns found.
                  </td>
                </tr>
              ) : (
                offers.map((offer) => {
                  const isSelected = selectedIds.includes(offer.offerId);
                  return (
                    <tr
                      key={offer.offerId}
                      className={`transition hover:bg-stone-50/60 dark:hover:bg-stone-900/40 ${
                        isSelected ? "bg-emerald-50/30 dark:bg-emerald-950/20" : ""
                      }`}
                    >
                      <td className="py-3 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectOne(offer.offerId, e.target.checked)}
                          className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Banner Thumbnail */}
                      <td className="py-3 px-3">
                        <div
                          onClick={() => setDetailsOffer(offer)}
                          className="h-12 w-20 cursor-pointer overflow-hidden rounded-lg border border-stone-200 bg-stone-100 transition hover:opacity-80 dark:border-stone-800 dark:bg-stone-900"
                        >
                          {offer.bannerImage ? (
                            <img
                              src={offer.bannerImage}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-stone-400">
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Campaign Title & Festival */}
                      <td className="py-3 px-3 max-w-[220px]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {offer.festivalName}
                        </span>
                        <p className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {offer.title}
                        </p>
                        {offer.isFlashSale && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600">
                            <Flame className="h-3 w-3" /> Flash Sale
                          </span>
                        )}
                      </td>

                      {/* Type & Discount */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {renderDiscountText(offer)}
                        </span>
                        <span className="block text-[11px] text-stone-400 capitalize">
                          {offer.offerType?.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Target Scopes */}
                      <td className="py-3 px-3 max-w-[180px]">
                        <span className="font-medium capitalize text-stone-700 dark:text-stone-300">
                          {offer.targetScope || "Marketplace"}
                        </span>
                        {offer.targetCategories && offer.targetCategories.length > 0 && (
                          <p className="text-[11px] text-stone-400 truncate">
                            {offer.targetCategories.map((c) => c.name).join(", ")}
                          </p>
                        )}
                        {offer.targetStores && offer.targetStores.length > 0 && (
                          <p className="text-[11px] text-stone-400 truncate">
                            {offer.targetStores.map((s) => s.name).join(", ")}
                          </p>
                        )}
                      </td>

                      {/* Placements */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5">
                          {offer.showOnHero && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              • Hero Carousel
                            </span>
                          )}
                          {offer.showOnFeatured && (
                            <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">
                              • Featured Deals
                            </span>
                          )}
                          {offer.showOnExplore && (
                            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                              • Explore
                            </span>
                          )}
                          {!offer.showOnHero && !offer.showOnFeatured && !offer.showOnExplore && (
                            <span className="text-[10px] text-stone-400">Standard</span>
                          )}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3 text-stone-700 dark:text-stone-300 font-semibold">
                        {offer.priority ?? 0}
                      </td>

                      {/* Validity */}
                      <td className="py-3 px-3 text-stone-500 dark:text-stone-400">
                        <span>{new Date(offer.startsAt).toLocaleDateString()}</span>
                        <span className="block text-[10px] text-stone-400">
                          to {new Date(offer.endsAt).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${getStatusBadge(
                            offer.status
                          )}`}
                        >
                          {offer.status}
                        </span>
                      </td>

                      {/* Active Toggle */}
                      <td className="py-3 px-3">
                        {!offer.isDeleted ? (
                          <button
                            type="button"
                            onClick={() =>
                              toggleStatusMutation.mutate({
                                id: offer.offerId,
                                isActive: !offer.isActive,
                              })
                            }
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              offer.isActive ? "bg-emerald-600" : "bg-stone-300 dark:bg-stone-700"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                offer.isActive ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        ) : (
                          <span className="text-stone-400 text-[10px]">Deleted</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 pl-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                            onClick={() => setDetailsOffer(offer)}
                            title="View details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          {!offer.isDeleted ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                                onClick={() => {
                                  setEditingOffer(offer);
                                  setFormOpen(true);
                                }}
                                title="Edit campaign"
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
                                    title: "Move Campaign to Trash?",
                                    description: `Are you sure you want to deactivate and remove campaign "${offer.title}"? It will no longer show on the homepage.`,
                                    confirmLabel: "Move to Trash",
                                    variant: "danger",
                                    action: async () => {
                                      await deleteMutation.mutateAsync(offer.offerId);
                                      setConfirmDialog((prev) => ({ ...prev, open: false }));
                                    },
                                  })
                                }
                                title="Delete campaign"
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
                                  title: "Restore Campaign?",
                                  description: `Restore campaign "${offer.title}" from trash back to active promotional offers?`,
                                  confirmLabel: "Restore Campaign",
                                  variant: "primary",
                                  action: async () => {
                                    await restoreMutation.mutateAsync(offer.offerId);
                                    setConfirmDialog((prev) => ({ ...prev, open: false }));
                                  },
                                })
                              }
                              title="Restore campaign"
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
      <OfferFormModal
        open={formOpen}
        offer={editingOffer}
        stores={stores}
        categories={categories}
        isSubmitting={saveMutation.isPending}
        submissionError={saveMutation.error instanceof Error ? saveMutation.error.message : null}
        onClose={() => {
          saveMutation.reset();
          setFormOpen(false);
          setEditingOffer(null);
        }}
        onSubmit={(formData) => saveMutation.mutate(formData)}
      />

      <OfferDetailsModal
        open={Boolean(detailsOffer)}
        offer={detailsOffer}
        onClose={() => setDetailsOffer(null)}
        onEdit={(offer) => {
          saveMutation.reset();
          setDetailsOffer(null);
          setEditingOffer(offer);
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
            title: `Delete ${selectedIds.length} Selected Campaigns?`,
            description: "These campaigns will be moved to trash and deactivated from the storefront.",
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
            title: `Restore ${selectedIds.length} Selected Campaigns?`,
            description: "These campaigns will be restored from trash.",
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
