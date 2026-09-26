"use client";

import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Heart,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Store,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminUserDetails, useVerifyCustomer } from "@/hooks/use-admin-users";
import type { AdminUser } from "@/types/admin-user";

interface UserDetailsModalProps {
  userId: string | null;
  onClose: () => void;
  onEdit?: (user: AdminUser) => void;
}

export function UserDetailsModal({ userId, onClose, onEdit }: UserDetailsModalProps) {
  const { data, isLoading, error } = useAdminUserDetails(userId);
  const verifyMutation = useVerifyCustomer();

  if (!userId) return null;

  const user = data?.user;
  const addresses = data?.addresses ?? [];
  const stores = data?.stores ?? [];
  const stats = data?.stats;
  const timeline = data?.timeline ?? [];

  const handleToggleVerification = () => {
    if (!user) return;
    verifyMutation.mutate({
      userId: user.userId,
      isVerifiedCustomer: !user.isVerifiedCustomer,
    });
  };

  const formatDate = (val?: string | null) => {
    if (!val) return "N/A";
    const d = new Date(val);
    return Number.isNaN(d.getTime())
      ? "N/A"
      : d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const roleStyles: Record<string, string> = {
    customer: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700",
    store_owner: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    platform_admin: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-950">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-base font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {user?.name || "User Details"}
                </h2>
                {user?.isVerifiedCustomer && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified Customer
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                User ID: <span className="font-mono">{userId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(user);
                }}
                className="text-xs"
              >
                Edit Profile
              </Button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center text-stone-500">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mb-3" />
              <p className="text-sm font-medium">Loading user details...</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              {error instanceof Error ? error.message : "Failed to load user details."}
            </div>
          )}

          {user && !isLoading && (
            <>
              {/* Top Banner Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-stone-50/60 p-4 dark:border-stone-800 dark:bg-stone-900/50">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                      roleStyles[user.role] || roleStyles.customer
                    }`}
                  >
                    <Shield className="h-3 w-3" />
                    {user.role.replace("_", " ")}
                  </span>

                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      user.status === "active"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : user.status === "suspended"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        : user.status === "deleted"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                        : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                    }`}
                  >
                    {user.status.toUpperCase()}
                  </span>

                  {user.isSuspended && user.suspendedReason && (
                    <span className="text-xs text-amber-700 dark:text-amber-300">
                      Reason: {user.suspendedReason}
                    </span>
                  )}
                </div>

                {/* Verification Toggle Button */}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={verifyMutation.isPending}
                  onClick={handleToggleVerification}
                  className={`text-xs gap-1.5 ${
                    user.isVerifiedCustomer
                      ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                      : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                  }`}
                >
                  {user.isVerifiedCustomer ? (
                    <>
                      <UserX className="h-3.5 w-3.5" />
                      Remove Customer Verification
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-3.5 w-3.5" />
                      Mark as Verified Customer
                    </>
                  )}
                </Button>
              </div>

              {/* 1. Basic Profile & Contact */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Basic Information
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 text-xs sm:text-sm">
                  <div>
                    <span className="block text-stone-400 text-xs">Full Name</span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">{user.name}</span>
                  </div>
                  <div>
                    <span className="block text-stone-400 text-xs">Email Address</span>
                    <span className="inline-flex items-center gap-1 text-stone-900 dark:text-stone-100">
                      <Mail className="h-3.5 w-3.5 text-stone-400" />
                      {user.email}
                      {user.emailVerified && (
                        <span title="Email verified">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        </span>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="block text-stone-400 text-xs">Mobile Phone</span>
                    <span className="inline-flex items-center gap-1 text-stone-900 dark:text-stone-100">
                      <Phone className="h-3.5 w-3.5 text-stone-400" />
                      {user.mobile}
                      {user.phoneVerified && (
                        <span title="Phone verified">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        </span>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="block text-stone-400 text-xs">Gender / DOB</span>
                    <span className="text-stone-900 dark:text-stone-100">
                      {user.gender ? user.gender.toUpperCase() : "Not specified"}{" "}
                      {user.dob ? `(${new Date(user.dob).toLocaleDateString("en-IN")})` : ""}
                    </span>
                  </div>
                  <div>
                    <span className="block text-stone-400 text-xs">Joined Platform</span>
                    <span className="inline-flex items-center gap-1 text-stone-900 dark:text-stone-100">
                      <Calendar className="h-3.5 w-3.5 text-stone-400" />
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-stone-400 text-xs">Last Activity</span>
                    <span className="inline-flex items-center gap-1 text-stone-900 dark:text-stone-100">
                      <Clock className="h-3.5 w-3.5 text-stone-400" />
                      {formatDate(user.lastLoginAt || user.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Account Statistics Cards */}
              {stats && (
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
                  <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-3 text-center dark:border-stone-800 dark:bg-stone-900">
                    <span className="text-xs text-stone-500">Orders</span>
                    <p className="text-lg font-bold text-stone-900 dark:text-stone-100">{stats.totalOrders}</p>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-emerald-50/50 p-3 text-center dark:border-emerald-950/40 dark:bg-emerald-950/20">
                    <span className="text-xs text-emerald-700 dark:text-emerald-400">Completed</span>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                      {stats.completedOrders}
                    </p>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-rose-50/50 p-3 text-center dark:border-rose-950/40 dark:bg-rose-950/20">
                    <span className="text-xs text-rose-700 dark:text-rose-400">Cancelled</span>
                    <p className="text-lg font-bold text-rose-700 dark:text-rose-300">
                      {stats.cancelledOrders}
                    </p>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-amber-50/50 p-3 text-center dark:border-amber-950/40 dark:bg-amber-950/20">
                    <span className="text-xs text-amber-700 dark:text-amber-400">Total Spent</span>
                    <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
                      ₹{stats.totalSpent.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-3 text-center dark:border-stone-800 dark:bg-stone-900">
                    <span className="inline-flex items-center gap-1 text-xs text-stone-500">
                      <ShoppingCart className="h-3 w-3" /> Cart
                    </span>
                    <p className="text-lg font-bold text-stone-900 dark:text-stone-100">{stats.cartCount}</p>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-3 text-center dark:border-stone-800 dark:bg-stone-900">
                    <span className="inline-flex items-center gap-1 text-xs text-stone-500">
                      <Heart className="h-3 w-3" /> Wishlist
                    </span>
                    <p className="text-lg font-bold text-stone-900 dark:text-stone-100">{stats.wishlistCount}</p>
                  </div>
                </div>
              )}

              {/* 3. Saved Addresses */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Addresses ({addresses.length})
                  </h3>
                </div>
                {addresses.length === 0 ? (
                  <p className="text-xs text-stone-500">No saved addresses for this user.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {addresses.map((addr) => (
                      <div
                        key={addr.addressId}
                        className={`rounded-lg border p-3 text-xs ${
                          addr.isDefault
                            ? "border-emerald-300 bg-emerald-50/30 dark:border-emerald-800 dark:bg-emerald-950/20"
                            : "border-stone-200 bg-stone-50/30 dark:border-stone-800 dark:bg-stone-900/30"
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-stone-900 dark:text-stone-100">
                          <span className="capitalize">{addr.fullName} ({addr.addressType})</span>
                          {addr.isDefault && (
                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-stone-600 dark:text-stone-300">
                          {addr.house}, {addr.street}
                          {addr.landmark ? `, Near ${addr.landmark}` : ""}
                        </p>
                        <p className="text-stone-500 dark:text-stone-400">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="mt-1 text-stone-500">Phone: {addr.mobile}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Seller & Owned Stores */}
              {(user.role === "store_owner" || stores.length > 0) && (
                <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Seller Stores ({stores.length})
                  </h3>
                  {stores.length === 0 ? (
                    <p className="text-xs text-stone-500">User has seller role but has not created any stores yet.</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {stores.map((st) => (
                        <div
                          key={st.storeId}
                          className="flex items-center gap-3 rounded-lg border border-stone-200 p-3 dark:border-stone-800 dark:bg-stone-900/40"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            <Store className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">
                              {st.storeName}
                            </h4>
                            <p className="text-xs text-stone-500">
                              Status: <span className="capitalize font-medium">{st.status}</span> • Rating: {st.rating} ({st.totalReviews})
                            </p>
                          </div>
                          <a
                            href={`/admin/stores?search=${encodeURIComponent(st.storeName)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                            title="Inspect store"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 5. Chronological Activity Timeline */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Account Activity Timeline
                </h3>
                {timeline.length === 0 ? (
                  <p className="text-xs text-stone-500">No events logged yet.</p>
                ) : (
                  <ol className="relative border-l border-stone-200 dark:border-stone-800 ml-3 space-y-4 text-xs">
                    {timeline.map((evt) => (
                      <li key={evt.id} className="ml-4">
                        <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border border-white bg-emerald-600 dark:border-stone-900" />
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-stone-900 dark:text-stone-100">{evt.title}</p>
                          <time className="text-[11px] text-stone-400">{formatDate(evt.timestamp)}</time>
                        </div>
                        <p className="text-stone-600 dark:text-stone-400 mt-0.5">{evt.description}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end border-t border-stone-200 px-6 py-4 dark:border-stone-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
