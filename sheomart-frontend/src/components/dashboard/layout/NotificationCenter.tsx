"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Flame,
  HardDrive,
  Package,
  Shield,
  ShoppingBag,
  Store,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore, type DashboardNotification } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";

export function NotificationCenter() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification,
    hydrateNotifications,
  } = useAppStore();

  const user = useAuthStore((state) => state.user);
  const storageKey = `sheomart_admin_read_notifications_${user?.userId || "admin"}`;
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "marketplace" | "system">("all");
  const panelRef = useRef<HTMLDivElement>(null);

  // Hydrate admin notifications and readIds from localStorage
  useEffect(() => {
    hydrateNotifications();
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setReadIds(new Set(parsed));
          return;
        }
      }
      setReadIds(new Set());
    } catch {
      setReadIds(new Set());
    }
  }, [storageKey, hydrateNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read && !readIds.has(n.id)).length,
    [notifications, readIds]
  );

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    setReadIds((prev) => {
      const next = new Set([...prev, id]);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
        } catch {}
      }
      return next;
    });
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    setReadIds((prev) => {
      const allIds = notifications.map((n) => n.id);
      const next = new Set([...prev, ...allIds]);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
        } catch {}
      }
      return next;
    });
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const isRead = n.read || readIds.has(n.id);
      if (activeTab === "unread") return !isRead;
      if (activeTab === "marketplace") return n.type === "marketplace" || n.type === "inventory";
      if (activeTab === "system") return n.type === "system" || n.type === "security";
      return true;
    });
  }, [notifications, readIds, activeTab]);

  // Group notifications into Today, Yesterday, Earlier
  const groupedNotifications = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const today: DashboardNotification[] = [];
    const yesterday: DashboardNotification[] = [];
    const earlier: DashboardNotification[] = [];

    filteredNotifications.forEach((n) => {
      const ts = new Date(n.timestamp);
      if (ts >= todayStart) {
        today.push(n);
      } else if (ts >= yesterdayStart) {
        yesterday.push(n);
      } else {
        earlier.push(n);
      }
    });

    return { today, yesterday, earlier };
  }, [filteredNotifications]);

  const getNotificationIcon = (type: DashboardNotification["type"]) => {
    switch (type) {
      case "marketplace":
        return <Store className="h-4 w-4 text-emerald-600" />;
      case "inventory":
        return <Package className="h-4 w-4 text-amber-600" />;
      case "security":
        return <Shield className="h-4 w-4 text-rose-600" />;
      case "system":
        return <HardDrive className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4 text-stone-600" />;
    }
  };

  const formatTimeAgo = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const renderNotificationItem = (notif: DashboardNotification) => {
    const isRead = notif.read || readIds.has(notif.id);
    return (
      <div
        key={notif.id}
        className={`group relative flex items-start gap-3 p-2 rounded-lg transition ${
          isRead
            ? "hover:bg-stone-50/70 dark:hover:bg-stone-800/40"
            : "bg-emerald-50/30 hover:bg-emerald-50/60 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30"
        }`}
      >
        {/* Icon */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800 mt-0.5">
          {getNotificationIcon(notif.type)}
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <p
              className={`text-[11px] font-bold truncate ${
                isRead
                  ? "text-stone-700 dark:text-stone-300"
                  : "text-stone-900 dark:text-stone-100"
              }`}
            >
              {notif.title}
            </p>
            <span className="text-[10px] text-stone-400 shrink-0">
              {formatTimeAgo(notif.timestamp)}
            </span>
          </div>

          <p className="text-[11px] text-stone-500 mt-0.5 leading-snug line-clamp-2">
            {notif.message}
          </p>

          <div className="mt-2 flex items-center gap-2">
            {notif.actionUrl && (
              <Link
                href={notif.actionUrl}
                onClick={() => {
                  handleMarkRead(notif.id);
                  setIsOpen(false);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                <span>Review</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}

            {!isRead && (
              <button
                type="button"
                onClick={() => handleMarkRead(notif.id)}
                className="text-[10px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                Mark read
              </button>
            )}

            <button
              type="button"
              onClick={() => removeNotification(notif.id)}
              className="ml-auto opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-500 transition p-0.5"
              title="Dismiss"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 transition hover:bg-stone-50 hover:text-stone-900 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 animate-ping opacity-75" />
          </>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-stone-200 bg-white p-3 shadow-2xl dark:border-stone-800 dark:bg-stone-900 animate-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-2 dark:border-stone-800 px-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 border-b border-stone-100 py-2 dark:border-stone-800">
            {(
              [
                { id: "all", label: "All" },
                { id: "unread", label: `Unread (${unreadCount})` },
                { id: "marketplace", label: "Marketplace" },
                { id: "system", label: "System" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white"
                    : "text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-72 overflow-y-auto pr-0.5">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 mb-2">
                  <Bell className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  No new notifications
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Platform alerts will appear here in real-time.
                </p>
              </div>
            ) : (
              <>
                {groupedNotifications.today.length > 0 && (
                  <div>
                    <p className="px-1 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      Today
                    </p>
                    <div className="divide-y divide-stone-100 dark:divide-stone-800">
                      {groupedNotifications.today.map(renderNotificationItem)}
                    </div>
                  </div>
                )}
                {groupedNotifications.yesterday.length > 0 && (
                  <div>
                    <p className="px-1 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      Yesterday
                    </p>
                    <div className="divide-y divide-stone-100 dark:divide-stone-800">
                      {groupedNotifications.yesterday.map(renderNotificationItem)}
                    </div>
                  </div>
                )}
                {groupedNotifications.earlier.length > 0 && (
                  <div>
                    <p className="px-1 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      Earlier
                    </p>
                    <div className="divide-y divide-stone-100 dark:divide-stone-800">
                      {groupedNotifications.earlier.map(renderNotificationItem)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
