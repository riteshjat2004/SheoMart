"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  ShoppingBag,
  Boxes,
  TicketPercent,
  Star,
  Megaphone,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export interface SellerNotification {
  id: string;
  type: "new-order" | "low-stock" | "coupon-expiring" | "review-received" | "admin-announcement" | "store-verification";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

const DEFAULT_SELLER_NOTIFICATIONS: SellerNotification[] = [
  {
    id: "notif-1",
    type: "new-order",
    title: "New Pickup Order Placed",
    message: "Order #ORD-7821 received for ₹1,250 (Pay at shop). Ready for packing.",
    timestamp: new Date().toISOString(),
    read: false,
    link: "/store/orders",
  },
  {
    id: "notif-2",
    type: "low-stock",
    title: "Low Stock Warning",
    message: "Fresh Alphonso Mangoes is running low (only 4 units left in inventory).",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    link: "/store/inventory",
  },
  {
    id: "notif-3",
    type: "review-received",
    title: "New Customer Review",
    message: "A customer rated Organic Cow Milk 5 stars with comment 'Fast pickup and fresh quality!'",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: false,
    link: "/store/reviews",
  },
  {
    id: "notif-4",
    type: "coupon-expiring",
    title: "Coupon Expiring Soon",
    message: "Your voucher 'FRESH15' will expire in 48 hours. Consider extending or launching a new deal.",
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    read: true,
    link: "/store/coupons",
  },
  {
    id: "notif-5",
    type: "store-verification",
    title: "Store Badge Verified",
    message: "Marketplace Admin has verified your business documents and upgraded your store trust tier.",
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    read: true,
    link: "/store/settings",
  },
];

export function SellerNotificationCenter() {
  const user = useAuthStore((state) => state.user);
  const storageKey = `sheomart_seller_read_notifications_${user?.userId || "seller"}`;
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const [notifications, setNotifications] = useState<SellerNotification[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("sheomart_seller_notifications");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return DEFAULT_SELLER_NOTIFICATIONS;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "unread">("all");
  const panelRef = useRef<HTMLDivElement>(null);

  // Load readIds from localStorage
  useEffect(() => {
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
  }, [storageKey]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read && !readIds.has(n.id)).length,
    [notifications, readIds]
  );

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

  const markAsRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set([...prev, id]);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
        } catch {}
      }
      return next;
    });

    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("sheomart_seller_notifications", JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  const markAllRead = () => {
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

    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("sheomart_seller_notifications", JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("sheomart_seller_notifications");
      } catch {}
    }
  };

  const filtered = useMemo(() => {
    if (filterTab === "unread") return notifications.filter((n) => !n.read && !readIds.has(n.id));
    return notifications;
  }, [notifications, readIds, filterTab]);

  const grouped = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const today: SellerNotification[] = [];
    const yesterday: SellerNotification[] = [];
    const earlier: SellerNotification[] = [];

    filtered.forEach((n) => {
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
  }, [filtered]);

  const getIcon = (type: SellerNotification["type"]) => {
    switch (type) {
      case "new-order":
        return <ShoppingBag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case "low-stock":
        return <Boxes className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case "coupon-expiring":
        return <TicketPercent className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case "review-received":
        return <Star className="h-4 w-4 text-amber-500 fill-amber-500" />;
      case "admin-announcement":
        return <Megaphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "store-verification":
        return <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <Bell className="h-4 w-4 text-stone-500" />;
    }
  };

  const renderItem = (n: SellerNotification) => {
    const isRead = n.read || readIds.has(n.id);
    return (
      <div
        key={n.id}
        onClick={() => markAsRead(n.id)}
        className={`group relative flex items-start gap-3 p-3 transition rounded-xl cursor-pointer ${
          isRead
            ? "bg-transparent hover:bg-stone-100/70 dark:hover:bg-stone-800/50"
            : "bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30"
        }`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800 mt-0.5">
          {getIcon(n.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={`text-xs truncate ${isRead ? "text-stone-800 dark:text-stone-200 font-medium" : "text-stone-900 dark:text-stone-50 font-bold"}`}>
              {n.title}
            </p>
            {!isRead && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            )}
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
            {n.message}
          </p>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[10px] text-stone-400">
              {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            {n.link && (
              <Link
                href={n.link}
                onClick={(e) => {
                  e.stopPropagation();
                  markAsRead(n.id);
                  setIsOpen(false);
                }}
                className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                View details →
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
        aria-label="Seller Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 origin-top-right rounded-2xl border border-stone-200/80 bg-white/95 shadow-2xl backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-900/95 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3 dark:border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400">Store operations & order alerts</p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/40 transition"
                  title="Mark all notifications as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/30">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                filterTab === "all"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-stone-600 hover:bg-stone-200/60 dark:text-stone-400"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("unread")}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                filterTab === "unread"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-stone-600 hover:bg-stone-200/60 dark:text-stone-400"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 divide-y divide-stone-100 dark:divide-stone-800/60 scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="mx-auto h-8 w-8 text-stone-300 dark:text-stone-700 mb-2" />
                <p className="text-xs font-semibold text-stone-600 dark:text-stone-400">No notifications</p>
                <p className="text-[11px] text-stone-400">You're all caught up with your store!</p>
              </div>
            ) : (
              <>
                {grouped.today.length > 0 && (
                  <div className="pb-2">
                    <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Today
                    </p>
                    <div className="space-y-1">{grouped.today.map(renderItem)}</div>
                  </div>
                )}

                {grouped.yesterday.length > 0 && (
                  <div className="py-2">
                    <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Yesterday
                    </p>
                    <div className="space-y-1">{grouped.yesterday.map(renderItem)}</div>
                  </div>
                )}

                {grouped.earlier.length > 0 && (
                  <div className="py-2">
                    <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Earlier
                    </p>
                    <div className="space-y-1">{grouped.earlier.map(renderItem)}</div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-stone-100 dark:border-stone-800 p-2 text-center bg-stone-50/50 dark:bg-stone-950/30">
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
