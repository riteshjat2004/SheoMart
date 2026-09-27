"use client";

import { useState } from "react";
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  ShieldCheck,
  Crown,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Tag,
  StickyNote,
  History,
  Check,
  AlertCircle,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useStoreCustomer } from "@/hooks/use-store-customer";
import { useUpdateCustomerNotes } from "@/hooks/use-store-customers";
import { CustomerPurchaseHistoryDrawer } from "@/components/dashboard/store/CustomerPurchaseHistoryDrawer";
import type { StoreCustomer } from "@/types/store-customer";

interface CustomerDetailsDrawerProps {
  customer: StoreCustomer;
  onClose: () => void;
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

export function CustomerDetailsDrawer({ customer, onClose }: CustomerDetailsDrawerProps) {
  const customerQuery = useStoreCustomer(customer.customerId, customer);
  const details = customerQuery.data;
  const profile = details?.customer ?? customer;
  const rel = details?.sellerRelationship;
  const insights = details?.insights;

  const [notes, setNotes] = useState(profile.notes || "");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSavedToast, setNoteSavedToast] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  const updateNotesMutation = useUpdateCustomerNotes();

  const handleSaveNotes = () => {
    setIsSavingNote(true);
    updateNotesMutation.mutate(
      { customerId: customer.customerId, notes: notes.trim() },
      {
        onSuccess: () => {
          setIsSavingNote(false);
          setNoteSavedToast(true);
          setTimeout(() => setNoteSavedToast(false), 2000);
        },
        onError: () => {
          setIsSavingNote(false);
        },
      }
    );
  };

  const cleanPhone = (profile.mobile || profile.phone || "").replace(/\D/g, "");
  const waLink = cleanPhone ? `https://wa.me/91${cleanPhone.slice(-10)}` : null;
  const callLink = cleanPhone ? `tel:+91${cleanPhone.slice(-10)}` : null;
  const mailLink = profile.email ? `mailto:${profile.email}` : null;

  return (
    <>
      <button
        type="button"
        aria-label="Close customer details"
        className="fixed inset-0 z-40 bg-stone-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside
        className="fixed inset-x-0 bottom-0 z-50 max-h-[94vh] overflow-y-auto rounded-t-2xl border border-stone-200 bg-stone-50 p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-950 sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:w-[min(100%,42rem)] sm:rounded-none sm:border-y-0 sm:border-r-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-details-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-5 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-lg font-bold text-white shadow-md">
              {profile.name
                ? profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "CU"}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="customer-details-title" className="text-xl font-bold text-stone-900 dark:text-stone-50">
                  {profile.name || "Customer"}
                </h2>
                {profile.isVerified ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <ShieldCheck className="h-3.5 w-3.5" /> Admin Verified
                  </span>
                ) : null}
                {profile.isVip ? (
                  <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    <Crown className="h-3.5 w-3.5 text-amber-600" /> VIP
                  </span>
                ) : null}
                {profile.isPlusCustomer ? <StatusBadge status="PLUS" /> : null}
              </div>
              <p className="mt-1 flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Customer Since {formatDate(profile.customerSince)}
                </span>
                <span>•</span>
                <span className="font-mono text-[11px] text-stone-400">
                  ID: {profile.customerId.slice(-8).toUpperCase()}
                </span>
              </p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close drawer">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Communication Quick Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
          ) : null}
          {callLink ? (
            <a
              href={callLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
            >
              <Phone className="h-3.5 w-3.5" /> Call ({profile.mobile || profile.phone})
            </a>
          ) : null}
          {mailLink ? (
            <a
              href={mailLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
            >
              <Mail className="h-3.5 w-3.5" /> Email ({profile.email})
            </a>
          ) : null}
        </div>

        {customerQuery.isLoading ? (
          <div className="mt-6 space-y-4">
            <LoadingSkeleton rows={6} />
          </div>
        ) : null}

        {customerQuery.isError ? (
          <div className="mt-6">
            <EmptyState
              title="Unable to load customer details"
              description={customerQuery.error.message}
            />
          </div>
        ) : null}

        {!customerQuery.isLoading && !customerQuery.isError ? (
          <div className="mt-6 space-y-6">
            {/* Store Relationship KPI Grid */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Store Performance Relationship
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <p className="text-xs text-stone-500">Total Spent</p>
                  <p className="mt-1 text-lg font-bold text-stone-900 dark:text-stone-50">
                    {money(rel?.totalSpending ?? profile.totalSpend)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-emerald-600 font-medium">Store Lifetime</p>
                </div>
                <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <p className="text-xs text-stone-500">Total Orders</p>
                  <p className="mt-1 text-lg font-bold text-stone-900 dark:text-stone-50">
                    {rel?.totalOrders ?? profile.totalOrders ?? 0}
                  </p>
                  <p className="mt-0.5 text-[11px] text-stone-400">
                    {rel?.completedOrders ?? 0} Completed
                  </p>
                </div>
                <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <p className="text-xs text-stone-500">Avg Order Value</p>
                  <p className="mt-1 text-lg font-bold text-stone-900 dark:text-stone-50">
                    {money(rel?.averageOrderValue ?? profile.averageOrderValue)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-stone-400">Per Order</p>
                </div>
                <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <p className="text-xs text-stone-500">Last Purchase</p>
                  <p className="mt-1 text-xs font-semibold text-stone-900 dark:text-stone-50 truncate">
                    {formatDate(rel?.lastPurchase ?? profile.lastPurchaseAt)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-stone-400">Recent Activity</p>
                </div>
              </div>
            </div>

            {/* Private Seller Notes Section */}
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center justify-between pb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  <StickyNote className="h-4 w-4 text-amber-500" /> Private Seller Notes
                </span>
                <span className="text-[11px] text-stone-400">
                  Private to your store
                </span>
              </div>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add private notes on delivery timings, preferred items, packaging requests..."
                className="mt-2 w-full rounded-lg border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-800 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
              />
              <div className="mt-2 flex items-center justify-between">
                {noteSavedToast ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <Check className="h-3.5 w-3.5" /> Note saved successfully!
                  </span>
                ) : (
                  <span />
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleSaveNotes}
                  disabled={isSavingNote}
                  className="h-8 text-xs font-medium"
                >
                  {isSavingNote ? "Saving..." : "Save Note"}
                </Button>
              </div>
            </div>

            {/* Customer Insights */}
            {insights ? (
              <div className="rounded-xl border border-stone-200 bg-gradient-to-br from-stone-50 to-emerald-50/30 p-4 shadow-sm dark:border-stone-800 dark:from-stone-900 dark:to-emerald-950/20">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  <TrendingUp className="h-4 w-4" /> Personal Shopping Insights
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                  <div>
                    <span className="text-stone-500">Most Purchased</span>
                    <p className="mt-1 font-semibold text-stone-900 dark:text-stone-100 truncate">
                      {insights.mostPurchasedProduct || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-500">Top Category</span>
                    <p className="mt-1 font-semibold text-stone-900 dark:text-stone-100 truncate">
                      {insights.favoriteCategory || "General"}
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-500">Avg Basket Size</span>
                    <p className="mt-1 font-semibold text-stone-900 dark:text-stone-100">
                      {insights.averageBasketSize} items
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-500">Coupons Used</span>
                    <p className="mt-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      {insights.couponUsageCount} redeemed
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Favorite Products from this Seller */}
            {details?.favoriteProducts && details.favoriteProducts.length > 0 ? (
              <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  <ShoppingBag className="h-4 w-4 text-emerald-600" /> Favorite Products from Your Store
                </p>
                <div className="mt-3 divide-y divide-stone-100 dark:divide-stone-800">
                  {details.favoriteProducts.map((p) => (
                    <div key={p.productId} className="flex items-center justify-between py-2 text-xs">
                      <div>
                        <p className="font-semibold text-stone-900 dark:text-stone-100">{p.name}</p>
                        <p className="text-[11px] text-stone-400">SKU: {p.sku || "N/A"}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-stone-900 dark:text-stone-100">
                          {money(p.totalSpent)}
                        </span>
                        <p className="text-[11px] text-stone-500">Ordered {p.quantity} times</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Favorite Categories */}
            {details?.favoriteCategories && details.favoriteCategories.length > 0 ? (
              <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  <Tag className="h-4 w-4 text-teal-600" /> Favorite Grocery Categories
                </p>
                <div className="mt-3 space-y-2.5">
                  {details.favoriteCategories.map((c) => (
                    <div key={c.category} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-stone-700 dark:text-stone-300 capitalize">
                          {c.category}
                        </span>
                        <span className="font-semibold text-stone-900 dark:text-stone-100">
                          {money(c.totalSpent)} ({c.quantity} items)
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-stone-100 dark:bg-stone-800">
                        <div
                          className="h-1.5 rounded-full bg-emerald-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                (c.totalSpent /
                                  (details.sellerRelationship.totalSpending || 1)) *
                                  100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Recent Timeline Orders */}
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  <History className="h-4 w-4 text-stone-500" /> Recent Order Timeline
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowHistoryDrawer(true)}
                >
                  View All Orders ({rel?.totalOrders ?? 0})
                </Button>
              </div>

              {details?.timeline && details.timeline.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {details.timeline.map((order) => (
                    <div
                      key={order.orderId}
                      className="flex items-center justify-between rounded-lg border border-stone-100 bg-stone-50/60 p-3 text-xs dark:border-stone-800/80 dark:bg-stone-950/40"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            #{order.orderId.slice(-8).toUpperCase()}
                          </span>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="mt-1 text-[11px] text-stone-400">
                          {formatDate(order.date)} • {order.fulfillmentType} • {order.totalItems} items
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-stone-900 dark:text-stone-100">
                          {money(order.grandTotal)}
                        </span>
                        <p className="text-[10px] text-stone-400 uppercase tracking-wider">
                          {order.paymentMethod}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-center text-xs text-stone-400 py-3">
                  No orders placed yet.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </aside>

      {showHistoryDrawer ? (
        <CustomerPurchaseHistoryDrawer
          customer={profile}
          onClose={() => setShowHistoryDrawer(false)}
        />
      ) : null}
    </>
  );
}