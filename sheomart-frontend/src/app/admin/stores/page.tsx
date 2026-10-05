"use client";

import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Crown,
  ShieldCheck,
  Circle,
  Eye,
  MoreVertical,
  Power,
  PowerOff,
  Trash2,
  Store as StoreIcon,
  Package,
  Star,
  RefreshCw,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { ToastNotification, type ToastMessage } from "@/components/dashboard/ToastNotification";
import { StoreDetailsModal } from "@/components/dashboard/admin/StoreDetailsModal";
import { AdminStoreCatalogModal } from "@/components/dashboard/admin/AdminStoreCatalogModal";
import { Button } from "@/components/ui/button";
import {
  fetchAdminStores,
  updateStoreStatus,
  updateStoreBadge,
  deleteStore,
  bulkUpdateStoreStatus,
} from "@/services/store";
import { cloneProductsToStore } from "@/services/product";
import type { StoreBadge, StoreItem } from "@/types/marketplace";

const statusFilterOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
  { value: "rejected", label: "Rejected" },
] as const;

const badgeFilterOptions = [
  { value: "all", label: "All Badges" },
  { value: "normal", label: "Normal Store" },
  { value: "verified", label: "Verified Store" },
  { value: "royal", label: "SheoMart Royal" },
] as const;

type SortOption =
  | "newest"
  | "oldest"
  | "name_asc"
  | "name_desc"
  | "seller_asc"
  | "products_desc"
  | "rating_desc";

interface PendingActionState {
  type: "status" | "badge" | "delete" | "bulk_status" | "bulk_delete";
  store?: StoreItem;
  storeIds?: string[];
  status?: string;
  badge?: StoreBadge;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant: "default" | "destructive" | "secondary";
}

export default function AdminStoresPage() {
  const queryClient = useQueryClient();

  // Search & Filter State
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [badgeFilter, setBadgeFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const router = useRouter();

  // Selection State
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<string>>(new Set());

  // Modal & Dialog State
  const [inspectingStore, setInspectingStore] = useState<StoreItem | null>(null);
  const [catalogTargetStore, setCatalogTargetStore] = useState<StoreItem | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingActionState | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchInput.trim().toLowerCase());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Query: Fetch Admin Stores
  const { data: stores = [], isLoading, isError, error, isFetching, refetch } = useQuery<StoreItem[], Error>({
    queryKey: ["stores", "admin"],
    queryFn: async () => fetchAdminStores(),
    staleTime: 1000 * 60 * 2,
  });

  // Extract unique cities for city filter
  const cityOptions = useMemo(() => {
    const cities = new Set<string>();
    stores.forEach((store) => {
      if (store.city && store.city.trim()) {
        cities.add(store.city.trim());
      }
    });
    return Array.from(cities).sort();
  }, [stores]);

  // Filter & Sort stores
  const filteredAndSortedStores = useMemo(() => {
    const result = stores.filter((store) => {
      const storeStatus = (store.status ?? "pending").toLowerCase();
      const storeBadge = (store.badge ?? "normal").toLowerCase();
      const isStoreActive = store.isActive ?? (storeStatus === "approved" || storeStatus === "active");

      // Status filter
      if (statusFilter !== "all" && storeStatus !== statusFilter) return false;

      // Badge filter
      if (badgeFilter !== "all" && storeBadge !== badgeFilter) return false;

      // City filter
      if (cityFilter !== "all" && (store.city?.toLowerCase() !== cityFilter.toLowerCase())) return false;

      // Active/Inactive filter
      if (activeFilter === "active" && !isStoreActive) return false;
      if (activeFilter === "inactive" && isStoreActive) return false;

      // Search Query
      if (debouncedQuery) {
        const storeName = (store.storeName ?? store.name ?? "").toLowerCase();
        const storeId = (store.storeId ?? store._id ?? "").toLowerCase();
        const sellerName = (store.seller?.name ?? "").toLowerCase();
        const sellerEmail = (store.seller?.email ?? store.email ?? "").toLowerCase();
        const sellerPhone = (store.seller?.phone ?? store.phone ?? "").toLowerCase();
        const city = (store.city ?? "").toLowerCase();

        const matches =
          storeName.includes(debouncedQuery) ||
          storeId.includes(debouncedQuery) ||
          sellerName.includes(debouncedQuery) ||
          sellerEmail.includes(debouncedQuery) ||
          sellerPhone.includes(debouncedQuery) ||
          city.includes(debouncedQuery);

        if (!matches) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest": {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        }
        case "oldest": {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        }
        case "name_asc": {
          const nameA = (a.storeName ?? a.name ?? "").toLowerCase();
          const nameB = (b.storeName ?? b.name ?? "").toLowerCase();
          return nameA.localeCompare(nameB);
        }
        case "name_desc": {
          const nameA = (a.storeName ?? a.name ?? "").toLowerCase();
          const nameB = (b.storeName ?? b.name ?? "").toLowerCase();
          return nameB.localeCompare(nameA);
        }
        case "seller_asc": {
          const sellerA = (a.seller?.name ?? "").toLowerCase();
          const sellerB = (b.seller?.name ?? "").toLowerCase();
          return sellerA.localeCompare(sellerB);
        }
        case "products_desc": {
          const countA = a.stats?.totalProducts ?? 0;
          const countB = b.stats?.totalProducts ?? 0;
          return countB - countA;
        }
        case "rating_desc": {
          const ratingA = a.rating ?? 0;
          const ratingB = b.rating ?? 0;
          return ratingB - ratingA;
        }
        default:
          return 0;
      }
    });

    return result;
  }, [stores, statusFilter, badgeFilter, cityFilter, activeFilter, debouncedQuery, sortBy]);

  // Paginated Stores
  const totalStores = filteredAndSortedStores.length;
  const totalPages = Math.max(1, Math.ceil(totalStores / pageSize));
  const paginatedStores = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedStores.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedStores, currentPage, pageSize]);

  // Status Mutation
  const statusMutation = useMutation({
    mutationFn: async ({ storeId, status }: { storeId: string; status: string }) => {
      return updateStoreStatus(storeId, status);
    },
    onSuccess: (updatedStore, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stores", "admin"] });
      const statusLabel = variables.status.charAt(0).toUpperCase() + variables.status.slice(1);
      setToast({
        type: "success",
        message: `Store ${statusLabel.toLowerCase() === "active" ? "activated" : statusLabel.toLowerCase() === "inactive" ? "deactivated" : statusLabel.toLowerCase()} successfully.`,
      });
      setPendingAction(null);
      if (inspectingStore && (inspectingStore.storeId === variables.storeId || inspectingStore._id === variables.storeId)) {
        setInspectingStore(updatedStore);
      }
    },
    onError: (err: unknown) => {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update store status.",
      });
      setPendingAction(null);
    },
  });

  // Badge Mutation
  const badgeMutation = useMutation({
    mutationFn: async ({ storeId, badge }: { storeId: string; badge: StoreBadge }) => {
      return updateStoreBadge(storeId, badge);
    },
    onSuccess: (updatedStore, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stores", "admin"] });
      setToast({
        type: "success",
        message: `Badge changed to ${variables.badge.charAt(0).toUpperCase() + variables.badge.slice(1)}.`,
      });
      setPendingAction(null);
      if (inspectingStore && (inspectingStore.storeId === variables.storeId || inspectingStore._id === variables.storeId)) {
        setInspectingStore(updatedStore);
      }
    },
    onError: (err: unknown) => {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update store badge.",
      });
      setPendingAction(null);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (storeId: string) => {
      return deleteStore(storeId);
    },
    onSuccess: (_data, storeId) => {
      queryClient.invalidateQueries({ queryKey: ["stores", "admin"] });
      setSelectedStoreIds((prev) => {
        const next = new Set(prev);
        next.delete(storeId);
        return next;
      });
      setToast({ type: "success", message: "Store deleted successfully." });
      setPendingAction(null);
      if (inspectingStore && (inspectingStore.storeId === storeId || inspectingStore._id === storeId)) {
        setInspectingStore(null);
      }
    },
    onError: (err: unknown) => {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete store.",
      });
      setPendingAction(null);
    },
  });

  // Bulk Status Mutation
  const bulkMutation = useMutation({
    mutationFn: async ({ storeIds, status }: { storeIds: string[]; status: string }) => {
      return bulkUpdateStoreStatus(storeIds, status);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stores", "admin"] });
      setSelectedStoreIds(new Set());
      setToast({
        type: "success",
        message: `Successfully updated ${data.modifiedCount ?? variables.storeIds.length} stores.`,
      });
      setPendingAction(null);
    },
    onError: (err: unknown) => {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to execute bulk action.",
      });
      setPendingAction(null);
    },
  });

  // Assign Catalog Products Mutation
  const cloneProductsMutation = useMutation({
    mutationFn: cloneProductsToStore,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stores", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      const storeId = catalogTargetStore?.storeId || catalogTargetStore?._id;
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: ["admin-store-existing-products", storeId] });
      }
      const storeName = catalogTargetStore?.storeName || catalogTargetStore?.name || "the store";
      const skippedNote = data.skippedCount && data.skippedCount > 0 ? ` (${data.skippedCount} already in store and skipped)` : "";
      setToast({
        type: "success",
        message: `Successfully assigned ${data.clonedCount} products to ${storeName}${skippedNote}. Stock and pricing can now be managed by the store.`,
      });
      setCatalogTargetStore(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to assign products to store.";
      setToast({
        type: "error",
        message: msg,
      });
    },
  });

  const isMutating =
    statusMutation.isPending ||
    badgeMutation.isPending ||
    deleteMutation.isPending ||
    bulkMutation.isPending ||
    cloneProductsMutation.isPending;

  // Selection Helpers
  const isAllPageSelected =
    paginatedStores.length > 0 &&
    paginatedStores.every((s) => selectedStoreIds.has(s.storeId ?? s._id ?? ""));

  const toggleSelectAllPage = () => {
    setSelectedStoreIds((prev) => {
      const next = new Set(prev);
      if (isAllPageSelected) {
        paginatedStores.forEach((s) => next.delete(s.storeId ?? s._id ?? ""));
      } else {
        paginatedStores.forEach((s) => {
          const id = s.storeId ?? s._id;
          if (id) next.add(id);
        });
      }
      return next;
    });
  };

  const toggleSelectStore = (storeId: string) => {
    setSelectedStoreIds((prev) => {
      const next = new Set(prev);
      if (next.has(storeId)) {
        next.delete(storeId);
      } else {
        next.add(storeId);
      }
      return next;
    });
  };

  // Action Dispatcher
  const requestStatusAction = (store: StoreItem, newStatus: string) => {
    const storeId = store.storeId ?? store._id;
    if (!storeId) return;

    const storeName = store.storeName ?? store.name ?? "Store";
    const statusLabels: Record<string, string> = {
      approved: "Approve Store",
      rejected: "Reject Store",
      active: "Activate Store",
      inactive: "Deactivate Store",
      suspended: "Suspend Store",
    };

    setPendingAction({
      type: "status",
      store,
      status: newStatus,
      title: `${statusLabels[newStatus] ?? "Update Store"}?`,
      description: `Are you sure you want to set ${storeName} to ${newStatus}?`,
      confirmLabel: statusLabels[newStatus] ?? "Confirm",
      confirmVariant: newStatus === "rejected" || newStatus === "inactive" || newStatus === "suspended" ? "destructive" : "default",
    });
    setOpenDropdownId(null);
  };

  const requestBadgeAction = (store: StoreItem, newBadge: StoreBadge) => {
    const storeId = store.storeId ?? store._id;
    if (!storeId) return;
    const storeName = store.storeName ?? store.name ?? "Store";

    setPendingAction({
      type: "badge",
      store,
      badge: newBadge,
      title: `Change Badge to ${newBadge.toUpperCase()}?`,
      description: `Assign the ${newBadge.toUpperCase()} badge to ${storeName}. Customers will see this badge on the marketplace.`,
      confirmLabel: "Update Badge",
      confirmVariant: "default",
    });
    setOpenDropdownId(null);
  };

  const requestDeleteAction = (store: StoreItem) => {
    const storeId = store.storeId ?? store._id;
    if (!storeId) return;
    const storeName = store.storeName ?? store.name ?? "Store";

    setPendingAction({
      type: "delete",
      store,
      title: "Delete Store?",
      description: `This will soft-delete ${storeName}. The store will be deactivated and removed from public listings.`,
      confirmLabel: "Delete Store",
      confirmVariant: "destructive",
    });
    setOpenDropdownId(null);
  };

  const requestBulkAction = (status: string) => {
    const count = selectedStoreIds.size;
    if (count === 0) return;

    if (status === "delete") {
      setPendingAction({
        type: "bulk_delete",
        storeIds: Array.from(selectedStoreIds),
        status: "delete",
        title: `Delete ${count} Stores?`,
        description: `This will soft-delete all ${count} selected stores. They will no longer be visible on the customer marketplace.`,
        confirmLabel: "Delete Stores",
        confirmVariant: "destructive",
      });
    } else {
      const label = status.charAt(0).toUpperCase() + status.slice(1);
      setPendingAction({
        type: "bulk_status",
        storeIds: Array.from(selectedStoreIds),
        status,
        title: `Bulk ${label} (${count} Stores)?`,
        description: `Set status of all ${count} selected stores to "${status}".`,
        confirmLabel: `Confirm ${label}`,
        confirmVariant: status === "rejected" || status === "inactive" ? "destructive" : "default",
      });
    }
  };

  const executePendingAction = () => {
    if (!pendingAction) return;

    if (pendingAction.type === "status" && pendingAction.store && pendingAction.status) {
      const storeId = pendingAction.store.storeId ?? pendingAction.store._id;
      if (storeId) {
        statusMutation.mutate({ storeId, status: pendingAction.status });
      }
    } else if (pendingAction.type === "badge" && pendingAction.store && pendingAction.badge) {
      const storeId = pendingAction.store.storeId ?? pendingAction.store._id;
      if (storeId) {
        badgeMutation.mutate({ storeId, badge: pendingAction.badge });
      }
    } else if (pendingAction.type === "delete" && pendingAction.store) {
      const storeId = pendingAction.store.storeId ?? pendingAction.store._id;
      if (storeId) {
        deleteMutation.mutate(storeId);
      }
    } else if (
      (pendingAction.type === "bulk_status" || pendingAction.type === "bulk_delete") &&
      pendingAction.storeIds &&
      pendingAction.status
    ) {
      bulkMutation.mutate({
        storeIds: pendingAction.storeIds,
        status: pendingAction.status,
      });
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setDebouncedQuery("");
    setStatusFilter("all");
    setBadgeFilter("all");
    setCityFilter("all");
    setActiveFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchInput !== "" ||
    statusFilter !== "all" ||
    badgeFilter !== "all" ||
    cityFilter !== "all" ||
    activeFilter !== "all" ||
    sortBy !== "newest";

  const getStatusPill = (statusStr?: string) => {
    const s = (statusStr ?? "pending").toLowerCase();
    switch (s) {
      case "active":
        return {
          label: "Active",
          icon: Sparkles,
          classes: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
        };
      case "approved":
        return {
          label: "Approved",
          icon: CheckCircle2,
          classes: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
        };
      case "pending":
        return {
          label: "Pending",
          icon: Clock,
          classes: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
        };
      case "rejected":
        return {
          label: "Rejected",
          icon: XCircle,
          classes: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
        };
      case "suspended":
        return {
          label: "Suspended",
          icon: AlertTriangle,
          classes: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300",
        };
      case "inactive":
        return {
          label: "Inactive",
          icon: PowerOff,
          classes: "border-stone-200 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300",
        };
      default:
        return {
          label: s,
          icon: Circle,
          classes: "border-stone-200 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300",
        };
    }
  };

  const getBadgePill = (badgeStr?: string) => {
    const b = (badgeStr ?? "normal").toLowerCase();
    switch (b) {
      case "royal":
        return {
          label: "Royal",
          icon: Crown,
          classes: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
        };
      case "verified":
        return {
          label: "Verified",
          icon: ShieldCheck,
          classes: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
        };
      default:
        return {
          label: "Normal",
          icon: Circle,
          classes: "border-stone-200 bg-stone-50 text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400",
        };
    }
  };

  return (
    <DashboardContent className="space-y-6 pb-24">
      {/* Toast Notification */}
      <ToastNotification toast={toast} onDismiss={() => setToast(null)} />

      <Breadcrumb items={[{ label: "Admin" }, { label: "Stores" }]} />

      <PageHeader
        category="STORE MANAGEMENT"
        title="Store Management"
        description="Review merchant applications, verified badges, operating metrics, and store health."
      />

      {/* Stats Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Total Stores
            </span>
            <StoreIcon className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-stone-900 dark:text-stone-50">
            {stores.length}
          </p>
          <p className="mt-1 text-xs text-stone-500">Registered merchant profiles</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Active / Live
            </span>
            <Sparkles className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-600">
            {stores.filter((s) => s.status === "active" || (s.status === "approved" && s.isActive !== false)).length}
          </p>
          <p className="mt-1 text-xs text-stone-500">Serving marketplace customers</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Pending Review
            </span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-600">
            {stores.filter((s) => !s.status || s.status === "pending").length}
          </p>
          <p className="mt-1 text-xs text-stone-500">Awaiting administrative approval</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Royal & Verified
            </span>
            <Crown className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-600">
            {stores.filter((s) => s.badge === "royal" || s.badge === "verified").length}
          </p>
          <p className="mt-1 text-xs text-stone-500">Featured store partners</p>
        </div>
      </div>

      <DashboardCard
        title="Merchant store directory"
        description="Filter, sort, inspect seller profiles, manage badges, and execute single or bulk approval workflows."
      >
        {/* Controls Toolbar: Search & Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by store name, ID, seller, email, phone..."
                className="w-full rounded-full border border-stone-200 bg-white pl-10 pr-4 py-2 text-sm text-stone-800 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick Actions & Refetch */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="h-9 gap-1.5 text-stone-600 dark:text-stone-300"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin text-emerald-600" : ""}`} />
                <span>Refresh</span>
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-9 gap-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <X className="h-3.5 w-3.5" />
                  Reset filters
                </Button>
              )}
            </div>
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
            {/* Status Select */}
            <div className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-stone-700 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
              <Filter className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-semibold text-stone-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent font-medium outline-none cursor-pointer"
              >
                {statusFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Badge Select */}
            <div className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-stone-700 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
              <Crown className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-semibold text-stone-500">Badge:</span>
              <select
                value={badgeFilter}
                onChange={(e) => {
                  setBadgeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent font-medium outline-none cursor-pointer"
              >
                {badgeFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* City Select */}
            {cityOptions.length > 0 && (
              <div className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-stone-700 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
                <span className="font-semibold text-stone-500">City:</span>
                <select
                  value={cityFilter}
                  onChange={(e) => {
                    setCityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent font-medium outline-none cursor-pointer"
                >
                  <option value="all">All Cities</option>
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Active / Inactive Filter */}
            <div className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-stone-700 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
              <Power className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-semibold text-stone-500">Activity:</span>
              <select
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value as "all" | "active" | "inactive");
                  setCurrentPage(1);
                }}
                className="bg-transparent font-medium outline-none cursor-pointer"
              >
                <option value="all">All Stores</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="ml-auto flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-stone-700 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
              <ArrowUpDown className="h-3.5 w-3.5 text-stone-400" />
              <span className="font-semibold text-stone-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent font-medium outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name_asc">Store Name (A-Z)</option>
                <option value="name_desc">Store Name (Z-A)</option>
                <option value="seller_asc">Seller Name (A-Z)</option>
                <option value="products_desc">Products Count (High-Low)</option>
                <option value="rating_desc">Rating (High-Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading & Error States */}
        {isLoading ? (
          <EmptyState
            title="Loading stores catalog"
            description="Fetching merchant records, seller credentials, and product aggregations..."
          />
        ) : null}

        {isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-rose-500" />
            <p className="font-semibold">Unable to load stores</p>
            <p className="mt-1 text-xs opacity-90">{error?.message ?? "An unexpected error occurred."}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
              Try again
            </Button>
          </div>
        ) : null}

        {/* Empty state when no stores match filters */}
        {!isLoading && !isError && filteredAndSortedStores.length === 0 ? (
          <div className="py-12 text-center">
            <StoreIcon className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-700" />
            <h3 className="mt-3 text-base font-semibold text-stone-900 dark:text-stone-100">
              No stores match your search
            </h3>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Try adjusting your query, clear active filters, or check back later.
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4">
                Clear all filters
              </Button>
            )}
          </div>
        ) : null}

        {/* TABLE VIEW */}
        {!isLoading && !isError && paginatedStores.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <table className="w-full text-left text-sm text-stone-600 dark:text-stone-300">
              <thead className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/90 text-xs font-semibold uppercase tracking-wider text-stone-500 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/80">
                <tr>
                  <th scope="col" className="w-10 px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={isAllPageSelected}
                      onChange={toggleSelectAllPage}
                      className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      aria-label="Select all stores on this page"
                    />
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Store
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Seller
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Badge
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Products
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Rating
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Created
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {paginatedStores.map((store) => {
                  const storeId = store.storeId ?? store._id ?? "";
                  const isSelected = selectedStoreIds.has(storeId);
                  const statusPill = getStatusPill(store.status);
                  const StatusIconComponent = statusPill.icon;
                  const badgePill = getBadgePill(store.badge);
                  const BadgeIconComponent = badgePill.icon;
                  const rawStatus = (store.status ?? "pending").toLowerCase();
                  const isLive = store.isActive ?? (rawStatus === "approved" || rawStatus === "active");

                  return (
                    <tr
                      key={storeId}
                      className={`group transition hover:bg-stone-50/80 dark:hover:bg-stone-800/40 ${
                        isSelected ? "bg-emerald-50/40 dark:bg-emerald-950/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectStore(storeId)}
                          className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          aria-label={`Select ${store.storeName ?? store.name}`}
                        />
                      </td>

                      {/* Store info */}
                      <td className="px-4 py-3.5">
                        <div
                          className="flex items-center gap-3 cursor-pointer group-hover:text-emerald-700 dark:group-hover:text-emerald-300"
                          onClick={() => setInspectingStore(store)}
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                            {(store.storeName ?? store.name ?? "S").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-stone-900 dark:text-stone-100 transition group-hover:underline">
                              {store.storeName ?? store.name ?? "Untitled Store"}
                            </p>
                            <p className="text-xs text-stone-400">
                              {store.city || "Sheopur"} • <span className="font-mono text-[11px]">{storeId.slice(0, 8)}...</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Seller info */}
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-medium text-stone-900 dark:text-stone-100">
                            {store.seller?.name || "Merchant"}
                          </p>
                          <p className="text-xs text-stone-400">
                            {store.seller?.phone || store.phone || store.seller?.email || store.email || "No contact"}
                          </p>
                        </div>
                      </td>

                      {/* Badge Pill */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgePill.classes}`}
                        >
                          <BadgeIconComponent className="h-3 w-3" />
                          {badgePill.label}
                        </span>
                      </td>

                      {/* Status Pill */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusPill.classes}`}
                        >
                          <StatusIconComponent className="h-3 w-3" />
                          {statusPill.label}
                        </span>
                      </td>

                      {/* Products Count */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Package className="h-3.5 w-3.5 text-stone-400" />
                          <span className="text-stone-900 dark:text-stone-100">
                            {store.stats?.totalProducts ?? 0}
                          </span>
                          <span className="text-xs text-stone-400">
                            ({store.stats?.activeProducts ?? 0} active)
                          </span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <span className="font-medium text-stone-900 dark:text-stone-100">
                            {typeof store.rating === "number" && store.rating > 0 ? store.rating.toFixed(1) : "—"}
                          </span>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="px-4 py-3.5 text-xs text-stone-500">
                        {store.createdAt
                          ? new Date(store.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </td>

                      {/* Actions Menu */}
                      <td className="px-4 py-3.5 text-right relative">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setInspectingStore(store)}
                            title="View store details"
                            className="h-8 w-8 text-stone-500 hover:text-emerald-600"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setCatalogTargetStore(store)}
                            title="Stock products from SheoMart Catalog"
                            className="h-8 w-8 text-stone-500 hover:text-emerald-600"
                          >
                            <Sparkles className="h-4 w-4" />
                          </Button>

                          <div className="relative">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setOpenDropdownId(openDropdownId === storeId ? null : storeId)}
                              title="More options"
                              className="h-8 w-8 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>

                            {openDropdownId === storeId && (
                              <div
                                className="absolute right-0 top-9 z-30 w-48 rounded-xl border border-stone-200 bg-white py-1.5 shadow-xl dark:border-stone-800 dark:bg-stone-900 animate-in fade-in zoom-in-95 duration-100 text-left"
                                onMouseLeave={() => setOpenDropdownId(null)}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInspectingStore(store);
                                    setOpenDropdownId(null);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                                >
                                  <Eye className="h-3.5 w-3.5 text-stone-400" />
                                  View Details
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setCatalogTargetStore(store);
                                    setOpenDropdownId(null);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                >
                                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                                  Stock from Catalog
                                </button>

                                {/* Approve */}
                                {(rawStatus === "pending" || rawStatus === "rejected") && (
                                  <button
                                    type="button"
                                    onClick={() => requestStatusAction(store, "approved")}
                                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {rawStatus === "rejected" ? "Re-Approve" : "Approve Store"}
                                  </button>
                                )}

                                {/* Reject */}
                                {rawStatus === "pending" && (
                                  <button
                                    type="button"
                                    onClick={() => requestStatusAction(store, "rejected")}
                                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    Reject Application
                                  </button>
                                )}

                                {/* Activate / Reactivate */}
                                {!isLive || rawStatus === "inactive" || rawStatus === "suspended" ? (
                                  <button
                                    type="button"
                                    onClick={() => requestStatusAction(store, "active")}
                                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                  >
                                    <Power className="h-3.5 w-3.5" />
                                    {rawStatus === "inactive" || rawStatus === "suspended" ? "Reactivate Store" : "Activate Store"}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => requestStatusAction(store, "inactive")}
                                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
                                  >
                                    <PowerOff className="h-3.5 w-3.5" />
                                    Deactivate Store
                                  </button>
                                )}

                                <div className="my-1 border-t border-stone-100 dark:border-stone-800" />

                                {/* Badge options */}
                                <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                                  Assign Badge
                                </div>
                                <button
                                  type="button"
                                  disabled={store.badge === "normal"}
                                  onClick={() => requestBadgeAction(store, "normal")}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 disabled:opacity-40"
                                >
                                  <Circle className="h-3.5 w-3.5 text-stone-400" />
                                  Normal Store
                                </button>
                                <button
                                  type="button"
                                  disabled={store.badge === "verified"}
                                  onClick={() => requestBadgeAction(store, "verified")}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30 disabled:opacity-40"
                                >
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  Verified Store
                                </button>
                                <button
                                  type="button"
                                  disabled={store.badge === "royal"}
                                  onClick={() => requestBadgeAction(store, "royal")}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30 disabled:opacity-40"
                                >
                                  <Crown className="h-3.5 w-3.5" />
                                  SheoMart Royal
                                </button>

                                <div className="my-1 border-t border-stone-100 dark:border-stone-800" />

                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={() => requestDeleteAction(store)}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete Store
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-stone-200 px-4 py-3 text-xs text-stone-600 dark:border-stone-800 dark:text-stone-400">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-stone-200 bg-white px-2 py-1 outline-none dark:border-stone-800 dark:bg-stone-900"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="ml-2">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, totalStores)} of {totalStores} stores
                </span>
              </div>

              <div className="flex items-center gap-1 self-end sm:self-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="h-8 gap-1 px-2.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
                <span className="px-3 font-semibold">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="h-8 gap-1 px-2.5"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </DashboardCard>

      {/* Floating Bulk Actions Bar (when stores are selected) */}
      {selectedStoreIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-full border border-stone-300 bg-stone-900/95 px-5 py-2.5 text-white shadow-2xl backdrop-blur-md dark:border-stone-700 dark:bg-stone-950/95 animate-in slide-in-from-bottom-6 duration-200">
          <span className="text-xs font-semibold text-emerald-400">
            {selectedStoreIds.size} selected
          </span>

          <div className="h-4 w-px bg-stone-700" />

          <Button
            size="sm"
            variant="ghost"
            onClick={() => requestBulkAction("active")}
            className="h-8 text-xs text-emerald-300 hover:bg-emerald-950/60 hover:text-emerald-200"
          >
            <Power className="mr-1.5 h-3.5 w-3.5" />
            Activate
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => requestBulkAction("inactive")}
            className="h-8 text-xs text-amber-300 hover:bg-amber-950/60 hover:text-amber-200"
          >
            <PowerOff className="mr-1.5 h-3.5 w-3.5" />
            Deactivate
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => requestBulkAction("approved")}
            className="h-8 text-xs text-blue-300 hover:bg-blue-950/60 hover:text-blue-200"
          >
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            Approve
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => requestBulkAction("rejected")}
            className="h-8 text-xs text-rose-300 hover:bg-rose-950/60 hover:text-rose-200"
          >
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            Reject
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => requestBulkAction("delete")}
            className="h-8 text-xs text-rose-400 hover:bg-rose-950/60 hover:text-rose-300"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>

          <div className="h-4 w-px bg-stone-700" />

          <button
            type="button"
            onClick={() => setSelectedStoreIds(new Set())}
            className="rounded-full p-1 text-stone-400 hover:text-white"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Centered Modal Confirmation Dialog */}
      {pendingAction ? (
        <ConfirmDialog
          open={true}
          title={pendingAction.title}
          description={pendingAction.description}
          confirmLabel={pendingAction.confirmLabel}
          confirmVariant={pendingAction.confirmVariant}
          isConfirming={isMutating}
          onClose={() => setPendingAction(null)}
          onConfirm={executePendingAction}
        />
      ) : null}

      {/* Store Details Modal */}
      <StoreDetailsModal
        store={inspectingStore}
        open={Boolean(inspectingStore)}
        onClose={() => setInspectingStore(null)}
        onApprove={(store) => requestStatusAction(store, "approved")}
        onReject={(store) => requestStatusAction(store, "rejected")}
        onActivate={(store) => requestStatusAction(store, "active")}
        onDeactivate={(store) => requestStatusAction(store, "inactive")}
        onUpdateBadge={(store, badge) => requestBadgeAction(store, badge)}
        onAssignProducts={(store) => {
          setInspectingStore(null);
          setCatalogTargetStore(store);
        }}
        isActionLoading={isMutating}
      />

      {/* Admin Store Catalog Modal (Master Catalog Product Assignment) */}
      <AdminStoreCatalogModal
        store={catalogTargetStore}
        open={Boolean(catalogTargetStore)}
        onClose={() => setCatalogTargetStore(null)}
        isCloning={cloneProductsMutation.isPending}
        onClone={async (payload) => {
          await cloneProductsMutation.mutateAsync(payload);
        }}
        onCloneSuccess={(_count) => {
          // Toast handled by mutation onSuccess
        }}
        onCreateCustomProduct={(store) => {
          router.push(`/admin/products?storeId=${store.storeId ?? store._id}&action=new`);
        }}
      />
    </DashboardContent>
  );
}
