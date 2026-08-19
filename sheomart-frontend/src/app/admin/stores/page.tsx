"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Filter } from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { StoreApprovalCard } from "@/components/dashboard/admin/StoreApprovalCard";
import { fetchAdminStores } from "@/services/store";
import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { StoreItem } from "@/types/marketplace";

const statusOptions = ["all", "pending", "approved", "rejected", "suspended"] as const;

type StatusFilter = (typeof statusOptions)[number];

export default function AdminStoresPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [pendingAction, setPendingAction] = useState<{ store: StoreItem; status: "approved" | "rejected" | "suspended" } | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const { data: stores = [], isLoading, isError, error } = useQuery<StoreItem[], Error>({
    queryKey: ["stores", "admin"],
    queryFn: async () => fetchAdminStores(),
    staleTime: 1000 * 60 * 5,
  });

  const filteredStores = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return stores.filter((store) => {
      const matchesStatus = filter === "all" || (store.status ?? "pending") === filter;
      const matchesQuery =
        !normalized ||
        `${store.storeName ?? store.name ?? ""} ${store.description ?? ""} ${store.city ?? ""}`.toLowerCase().includes(normalized);

      return matchesStatus && matchesQuery;
    });
  }, [filter, query, stores]);

  const statusMutation = useMutation({
    mutationFn: async ({ storeId, status }: { storeId: string; status: "approved" | "rejected" | "suspended" }) => {
      const response = await api.patch<ApiResponse<{ store: StoreItem }>>(`/api/v1/stores/${storeId}/status`, { status });
      return response.data.data?.store;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stores", "admin"] });
      setFeedback({ type: "success", message: `Store status updated to ${variables.status}.` });
      setPendingAction(null);
    },
    onError: (mutationError: unknown) => {
      setFeedback({ type: "error", message: mutationError instanceof Error ? mutationError.message : "Unable to update store status." });
    },
  });

  const handleAction = (store: StoreItem, status: "approved" | "rejected" | "suspended") => {
    if (!store.storeId && !store._id) {
      return;
    }

    setPendingAction({ store, status });
  };

  const confirmAction = () => {
    if (!pendingAction?.store.storeId && !pendingAction?.store._id) {
      return;
    }

    const storeId = pendingAction.store.storeId ?? pendingAction.store._id;
    if (!storeId) {
      return;
    }

    statusMutation.mutate({ storeId, status: pendingAction.status });
  };

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Admin" }, { label: "Stores" }]} />
      <PageHeader
        title="Store approval management"
        description="Review store applications and update approval states from one workspace."
      />

      {feedback ? (
        <div className={`rounded-lg border p-3 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300" : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300"}`}>
          {feedback.message}
        </div>
      ) : null}

      <DashboardCard title="Store requests" description="Search and filter stores by status before applying an approval action.">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-sm text-stone-500 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
            <Search className="h-4 w-4" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search stores"
              className="w-full bg-transparent outline-none placeholder:text-stone-400"
            />
          </label>

          <label className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-sm text-stone-500 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
            <Filter className="h-4 w-4" />
            <select value={filter} onChange={(event) => setFilter(event.target.value as StatusFilter)} className="bg-transparent outline-none">
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All statuses" : option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isLoading ? (
          <EmptyState title="Loading stores" description="Fetching the latest store applications and statuses." />
        ) : null}

        {isError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300">{error?.message ?? "Unable to load stores"}</div>
        ) : null}

        {!isLoading && !isError ? (
          <div className="space-y-3">
            {filteredStores.length === 0 ? (
              <EmptyState title="No stores found" description="No store requests match the current search and filter." />
            ) : null}

            {filteredStores.map((store) => (
              <StoreApprovalCard
                key={store.storeId ?? store._id}
                store={store}
                onApprove={(item) => handleAction(item, "approved")}
                onReject={(item) => handleAction(item, "rejected")}
                onSuspend={(item) => handleAction(item, "suspended")}
              />
            ))}
          </div>
        ) : null}
      </DashboardCard>

      {pendingAction ? (
        <ConfirmDialog
          title={`Update store to ${pendingAction.status}?`}
          description={`This will change the store status for ${pendingAction.store.storeName ?? pendingAction.store.name ?? "this store"}.`}
        >
          <Button variant="outline" onClick={() => setPendingAction(null)}>
            Cancel
          </Button>
          <Button onClick={confirmAction} disabled={statusMutation.isPending}>
            {statusMutation.isPending ? "Saving..." : "Confirm"}
          </Button>
        </ConfirmDialog>
      ) : null}
    </DashboardContent>
  );
}
