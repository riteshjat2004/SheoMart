"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  Store as StoreIcon,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Star,
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Crown,
  ShieldCheck,
  Circle,
  Clock,
  ExternalLink,
  Power,
  PowerOff,
  ShoppingBag,
  Layers,
  Sparkles,
  Truck,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoreBadge, StoreItem } from "@/types/marketplace";

interface StoreDetailsModalProps {
  store: StoreItem | null;
  open: boolean;
  onClose: () => void;
  onApprove: (store: StoreItem) => void;
  onReject: (store: StoreItem) => void;
  onActivate: (store: StoreItem) => void;
  onDeactivate: (store: StoreItem) => void;
  onUpdateBadge: (store: StoreItem, badge: StoreBadge) => void;
  isActionLoading?: boolean;
}

export function StoreDetailsModal({
  store,
  open,
  onClose,
  onApprove,
  onReject,
  onActivate,
  onDeactivate,
  onUpdateBadge,
  isActionLoading = false,
}: StoreDetailsModalProps) {
  const [selectedBadge, setSelectedBadge] = useState<StoreBadge>(store?.badge ?? "normal");
  const [activeTab, setActiveTab] = useState<"overview" | "seller" | "stats" | "address" | "timeline">("overview");

  useEffect(() => {
    if (store?.badge) {
      setSelectedBadge(store.badge);
    }
  }, [store]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !store) return null;

  const status = (store.status ?? "pending").toLowerCase();
  const isActive = store.isActive ?? (status === "approved" || status === "active");

  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return {
          label: "Active",
          icon: Sparkles,
          className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        };
      case "approved":
        return {
          label: "Approved",
          icon: CheckCircle2,
          className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
        };
      case "pending":
        return {
          label: "Pending Approval",
          icon: Clock,
          className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
        };
      case "rejected":
        return {
          label: "Rejected",
          icon: XCircle,
          className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
        };
      case "suspended":
        return {
          label: "Suspended",
          icon: AlertTriangle,
          className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
        };
      case "inactive":
        return {
          label: "Inactive",
          icon: PowerOff,
          className: "bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700",
        };
      default:
        return {
          label: status.toUpperCase(),
          icon: Circle,
          className: "bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700",
        };
    }
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const stats = store.stats ?? {
    totalProducts: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    totalCategories: 0,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900 animate-in zoom-in-95 duration-200">
        {/* Sticky Header with Quick Actions Toolbar */}
        <div className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 px-6 py-4 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/95 rounded-t-3xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <StoreIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">
                    {store.storeName ?? store.name ?? "Store Details"}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge.className}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {statusBadge.label}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  ID: <span className="font-mono">{store.storeId ?? store._id}</span>
                </p>
              </div>
            </div>

            {/* Quick Actions Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              {status === "pending" ? (
                <>
                  <Button
                    size="sm"
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                    disabled={isActionLoading}
                    onClick={() => onApprove(store)}
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400"
                    disabled={isActionLoading}
                    onClick={() => onReject(store)}
                  >
                    <XCircle className="mr-1.5 h-4 w-4" />
                    Reject
                  </Button>
                </>
              ) : status === "rejected" ? (
                <Button
                  size="sm"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  disabled={isActionLoading}
                  onClick={() => onApprove(store)}
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  Re-Approve
                </Button>
              ) : isActive && status === "active" ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400"
                  disabled={isActionLoading}
                  onClick={() => onDeactivate(store)}
                >
                  <PowerOff className="mr-1.5 h-4 w-4" />
                  Deactivate
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  disabled={isActionLoading}
                  onClick={() => onActivate(store)}
                >
                  <Power className="mr-1.5 h-4 w-4" />
                  {status === "inactive" || status === "suspended" ? "Reactivate" : "Activate"}
                </Button>
              )}

              <Button
                asChild
                size="sm"
                variant="outline"
                className="text-stone-700 dark:text-stone-300"
              >
                <Link href={`/admin/products?storeId=${store.storeId ?? store._id}`}>
                  <Package className="mr-1.5 h-4 w-4" />
                  Products
                </Link>
              </Button>

              <Button
                asChild
                size="sm"
                variant="outline"
                className="text-stone-700 dark:text-stone-300"
              >
                <Link href={`/admin/reviews?storeId=${store.storeId ?? store._id}`}>
                  <Star className="mr-1.5 h-4 w-4" />
                  Reviews
                </Link>
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                aria-label="Close details modal"
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-4 flex gap-1 border-t border-stone-200 pt-3 dark:border-stone-800 overflow-x-auto text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === "overview"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("seller")}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === "seller"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              }`}
            >
              Seller Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("stats")}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === "stats"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              }`}
            >
              Business Stats
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("address")}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === "address"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              }`}
            >
              Address & Delivery
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("timeline")}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === "timeline"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              }`}
            >
              Activity Timeline
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Badge Management Card */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-5 dark:border-stone-800 dark:bg-stone-950/50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      Store Tier & Badge
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Select official marketplace badge. Priority: Royal &gt; Verified &gt; Normal.
                    </p>
                  </div>
                  {selectedBadge !== store.badge && (
                    <Button
                      size="sm"
                      onClick={() => onUpdateBadge(store, selectedBadge)}
                      disabled={isActionLoading}
                    >
                      Save Badge Change
                    </Button>
                  )}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      id: "normal" as const,
                      label: "Normal Store",
                      desc: "Standard listing on marketplace",
                      icon: Circle,
                      color: "border-stone-300 bg-white text-stone-700 dark:bg-stone-900 dark:border-stone-700 dark:text-stone-300",
                    },
                    {
                      id: "verified" as const,
                      label: "Verified Store",
                      desc: "Official SheoMart verified partner",
                      icon: ShieldCheck,
                      color: "border-emerald-300 bg-emerald-50/60 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300",
                    },
                    {
                      id: "royal" as const,
                      label: "SheoMart Royal",
                      desc: "Top-tier premium featured store",
                      icon: Crown,
                      color: "border-amber-300 bg-amber-50/60 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300",
                    },
                  ].map((badge) => {
                    const Icon = badge.icon;
                    const isSelected = selectedBadge === badge.id;
                    return (
                      <label
                        key={badge.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                          isSelected
                            ? "ring-2 ring-emerald-500 border-emerald-500 shadow-sm"
                            : "border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900"
                        }`}
                      >
                        <input
                          type="radio"
                          name="modal-badge-selection"
                          value={badge.id}
                          checked={isSelected}
                          onChange={() => setSelectedBadge(badge.id)}
                          className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 font-medium text-sm text-stone-900 dark:text-stone-50">
                            <Icon className="h-4 w-4" />
                            {badge.label}
                          </div>
                          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                            {badge.desc}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Store Details Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/60">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Store Description
                  </h4>
                  <p className="mt-2 text-sm text-stone-700 dark:text-stone-300">
                    {store.description || "No description provided."}
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/60">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Contact Information
                  </h4>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                      <Mail className="h-4 w-4 text-emerald-600" />
                      <span>{store.email || "No email"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                      <Phone className="h-4 w-4 text-emerald-600" />
                      <span>{store.phone || "No phone"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fulfilment Capabilities */}
              <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/60">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Fulfilment Modes
                </h4>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/50 p-3 dark:border-stone-800 dark:bg-stone-950/40">
                    <Building className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                        In-Store Pickup
                      </p>
                      <p className="text-xs text-stone-500">
                        {store.supportsPickup || store.pickupEnabled ? "Enabled" : "Disabled"} (
                        {store.pickupOpeningTime || "10:00"} - {store.pickupClosingTime || "20:00"})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/50 p-3 dark:border-stone-800 dark:bg-stone-950/40">
                    <Truck className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                        Doorstep Delivery
                      </p>
                      <p className="text-xs text-stone-500">
                        {store.supportsDelivery || store.deliveryEnabled ? "Enabled" : "Disabled"} (
                        Radius: {store.deliveryRadiusKm || 5} km)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SELLER INFO */}
          {activeTab === "seller" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <User className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50">
                      {store.seller?.name || "Store Owner"}
                    </h3>
                    <p className="text-xs text-stone-500">
                      Owner ID: <span className="font-mono">{store.ownerId || "Unknown"}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-stone-100 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/50">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Email Address
                    </dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-stone-900 dark:text-stone-100">
                      <Mail className="h-4 w-4 text-emerald-600" />
                      {store.seller?.email || store.email || "Not available"}
                    </dd>
                  </div>

                  <div className="rounded-xl border border-stone-100 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/50">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Phone Number
                    </dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-stone-900 dark:text-stone-100">
                      <Phone className="h-4 w-4 text-emerald-600" />
                      {store.seller?.phone || store.phone || "Not available"}
                    </dd>
                  </div>

                  <div className="rounded-xl border border-stone-100 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/50">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Seller Joined
                    </dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-stone-900 dark:text-stone-100">
                      <Calendar className="h-4 w-4 text-emerald-600" />
                      {formatDate(store.seller?.registeredAt || store.createdAt)}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BUSINESS STATS */}
          {activeTab === "stats" && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Total Products
                    </span>
                    <Package className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-stone-900 dark:text-stone-50">
                    {stats.totalProducts}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">Listed in store catalog</p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Active Products
                    </span>
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-emerald-600">
                    {stats.activeProducts}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">Live & purchaseable</p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Out of Stock
                    </span>
                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-rose-600">
                    {stats.outOfStockProducts}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">Zero inventory remaining</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Customer Rating
                    </span>
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <p className="text-3xl font-extrabold text-stone-900 dark:text-stone-50">
                      {typeof store.rating === "number" && store.rating > 0 ? store.rating.toFixed(1) : "N/A"}
                    </p>
                    <span className="text-sm text-stone-500">★</span>
                  </div>
                  <p className="mt-1 text-xs text-stone-500">
                    Based on {store.totalReviews ?? 0} reviews
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Categories
                    </span>
                    <Layers className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-stone-900 dark:text-stone-50">
                    {stats.totalCategories}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">Active product categories</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADDRESS & DELIVERY */}
          {activeTab === "address" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                      Registered Store Address
                    </h3>
                    <p className="mt-2 text-sm text-stone-700 dark:text-stone-300">
                      {store.address || "Street address not provided"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-stone-600 dark:text-stone-400">
                      <span className="rounded-md bg-stone-100 px-2.5 py-1 dark:bg-stone-800">
                        City: {store.city || "Sheopur"}
                      </span>
                      <span className="rounded-md bg-stone-100 px-2.5 py-1 dark:bg-stone-800">
                        State: {store.state || "Madhya Pradesh"}
                      </span>
                      <span className="rounded-md bg-stone-100 px-2.5 py-1 dark:bg-stone-800">
                        Pincode: {store.pincode || "476337"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Map style visualization card */}
                <div className="mt-6 flex h-48 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-4 text-center dark:border-emerald-800/60 dark:bg-emerald-950/20">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                    {store.storeName ?? store.name}
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    {store.city}, {store.state} — {store.pincode}
                  </p>
                  <p className="mt-1 text-[11px] text-stone-400">
                    Geo-coordinates: {store.latitude ?? "25.6667"}° N, {store.longitude ?? "76.7000"}° E
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TIMELINE */}
          {activeTab === "timeline" && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Store Lifecycle & Audit Log
              </h3>
              <div className="relative mt-6 pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800">
                <div className="relative">
                  <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-stone-900" />
                  <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                    Store Application Submitted
                  </p>
                  <p className="text-xs text-stone-500">
                    {formatDate(store.createdAt)}
                  </p>
                </div>

                {store.approvedAt ? (
                  <div className="relative">
                    <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500 dark:border-stone-900" />
                    <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                      Store Approved by Admin
                    </p>
                    <p className="text-xs text-stone-500">
                      {formatDate(store.approvedAt)}{" "}
                      {store.approvedBy ? `(by ${store.approvedBy})` : ""}
                    </p>
                  </div>
                ) : null}

                <div className="relative">
                  <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-amber-500 dark:border-stone-900" />
                  <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                    Current Badge: {store.badge ? store.badge.toUpperCase() : "NORMAL"}
                  </p>
                  <p className="text-xs text-stone-500">
                    Assigned tier in marketplace
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-stone-400 dark:border-stone-900" />
                  <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                    Last Metadata Update
                  </p>
                  <p className="text-xs text-stone-500">
                    {formatDate(store.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-stone-200 bg-stone-50/80 px-6 py-3.5 dark:border-stone-800 dark:bg-stone-950/60 rounded-b-3xl flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
