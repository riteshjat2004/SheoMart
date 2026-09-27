"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Package,
  ShoppingBag,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { useCustomerNotifications } from "@/hooks/use-notifications";
import type { CustomerNotificationItem } from "@/services/notifications";

export function CustomerNotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "order" | "offer" | "coupon">("all");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const notificationsQuery = useCustomerNotifications();
  const rawNotifications = notificationsQuery.data ?? [];

  const unreadCount = rawNotifications.filter((n) => !readIds.has(n.id)).length;

  const filteredNotifications = rawNotifications.filter((n) => {
    if (activeFilter === "all") return true;
    return n.type === activeFilter;
  });

  const markAsRead = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
  };

  const markAllAsRead = () => {
    setReadIds(new Set(rawNotifications.map((n) => n.id)));
  };

  const getIcon = (type: CustomerNotificationItem["type"]) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="h-4 w-4 text-emerald-600" />;
      case "coupon":
        return <Tag className="h-4 w-4 text-amber-600" />;
      case "offer":
        return <Sparkles className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        type="button"
        aria-label="Open notifications"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 transition hover:border-emerald-300 hover:text-emerald-600 dark:border-stone-800 dark:bg-zinc-900 dark:text-stone-300"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Slide-out / Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-stone-200 bg-white p-4 shadow-2xl dark:border-stone-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900 dark:text-stone-50">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:underline"
                >
                  <CheckCheck className="h-3 w-3" />
                  Read all
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Type Filters */}
          <div className="flex gap-1.5 py-2.5 overflow-x-auto text-xs">
            {[
              { id: "all", label: "All" },
              { id: "order", label: "Orders" },
              { id: "coupon", label: "Coupons" },
              { id: "offer", label: "Offers" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id as typeof activeFilter)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                  activeFilter === f.id
                    ? "bg-emerald-600 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto space-y-2 pt-1 divide-y divide-stone-50 dark:divide-stone-800/50">
            {filteredNotifications.length ? (
              filteredNotifications.map((notif) => {
                const isRead = readIds.has(notif.id);
                return (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`flex items-start gap-3 rounded-xl p-2.5 transition cursor-pointer ${
                      isRead
                        ? "opacity-60 hover:opacity-100"
                        : "bg-emerald-50/50 dark:bg-emerald-950/20"
                    }`}
                  >
                    <div className="mt-0.5 rounded-lg bg-stone-100 p-2 dark:bg-stone-800">
                      {getIcon(notif.type)}
                    </div>

                    <div className="flex-1 space-y-0.5 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-stone-900 line-clamp-1 dark:text-stone-50">
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-stone-400 shrink-0">
                          {new Date(notif.timestamp).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] leading-4 text-stone-600 line-clamp-2 dark:text-stone-300">
                        {notif.message}
                      </p>

                      {notif.actionUrl && (
                        <Link
                          href={notif.actionUrl}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 hover:underline pt-1"
                        >
                          View details
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-xs text-stone-400 py-6">No notifications found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
