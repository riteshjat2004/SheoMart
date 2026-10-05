"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCheck,
  ShoppingBag,
  Boxes,
  TicketPercent,
  Star,
  Megaphone,
  ShieldCheck,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { fetchMyStore } from "@/services/store";
import {
  fetchStoreNotifications,
  fetchStoreUnreadCount,
  markNotificationAsRead,
  markAllStoreNotificationsAsRead,
  type StoreNotificationItem,
} from "@/services/notification";
import {
  getAppSocket,
  joinStoreRoom,
  leaveStoreRoom,
} from "@/lib/socket";
import {
  playOrderAlertChime,
  requestOrderNotificationPermission,
  showBrowserOrderNotification,
} from "@/lib/order-chime";

export function SellerNotificationCenter() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [isOpen, setIsOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "unread">("all");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeOrderAlert, setActiveOrderAlert] = useState<StoreNotificationItem | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  // 1. Fetch seller's store info
  const { data: store } = useQuery({
    queryKey: ["my-store"],
    queryFn: fetchMyStore,
    staleTime: 1000 * 60 * 5,
  });

  const storeId = store?.storeId;

  // 2. Fetch notifications from backend
  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ["store-notifications", storeId],
    queryFn: () => fetchStoreNotifications({ limit: 30 }),
    enabled: Boolean(storeId),
    staleTime: 1000 * 30,
  });

  // 3. Fetch unread count from backend
  const { data: unreadCount = 0, refetch: refetchUnread } = useQuery({
    queryKey: ["store-unread-count", storeId],
    queryFn: fetchStoreUnreadCount,
    enabled: Boolean(storeId),
    staleTime: 1000 * 30,
  });

  const notifications = notificationsData?.notifications || [];

  // Mutations
  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-notifications", storeId] });
      queryClient.invalidateQueries({ queryKey: ["store-unread-count", storeId] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllStoreNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-notifications", storeId] });
      queryClient.invalidateQueries({ queryKey: ["store-unread-count", storeId] });
    },
  });

  // 4. Socket.IO Real-Time Order Listener
  useEffect(() => {
    if (!storeId) return;

    const socket = getAppSocket();
    if (!socket) return;

    const handleConnect = () => {
      joinStoreRoom(storeId);
    };

    // Join store room immediately and on reconnect
    joinStoreRoom(storeId);
    socket.on("connect", handleConnect);

    const handleNewOrder = (incoming: any) => {
      // 1. Play chime sound if enabled
      if (soundEnabled) {
        playOrderAlertChime();
      }

      const notifItem: StoreNotificationItem = {
        id: incoming.id || incoming.notificationId || `order-${Date.now()}`,
        notificationId: incoming.notificationId || incoming.id || `order-${Date.now()}`,
        type: "new-order",
        title: incoming.title || "New Order Received! 🛍️",
        message: incoming.message || "A customer placed a new order in your store.",
        data: incoming.data || {},
        link: incoming.link || `/store/orders?orderId=${incoming.orderId || ""}`,
        read: false,
        isRead: false,
        timestamp: incoming.timestamp || new Date().toISOString(),
        createdAt: incoming.createdAt || new Date().toISOString(),
      };

      // 2. Trigger native OS browser notification if tab minimized
      showBrowserOrderNotification(notifItem.title, notifItem.message, notifItem.link);

      // 3. Show prominent on-screen banner
      setActiveOrderAlert(notifItem);

      // 4. Invalidate queries so lists update seamlessly
      queryClient.invalidateQueries({ queryKey: ["store-notifications", storeId] });
      queryClient.invalidateQueries({ queryKey: ["store-unread-count", storeId] });
      queryClient.invalidateQueries({ queryKey: ["store-orders"] });
    };

    socket.on("new_order", handleNewOrder);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("new_order", handleNewOrder);
      leaveStoreRoom(storeId);
    };
  }, [storeId, soundEnabled, queryClient]);

  // Handle click outside to close dropdown
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

  // Request browser notification permission once on user interaction
  const enableDesktopAlerts = async () => {
    const granted = await requestOrderNotificationPermission();
    if (granted && soundEnabled) {
      playOrderAlertChime();
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    markReadMutation.mutate(notificationId);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const filtered = useMemo(() => {
    if (filterTab === "unread") {
      return notifications.filter((n) => !n.read && !n.isRead);
    }
    return notifications;
  }, [notifications, filterTab]);

  const grouped = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const today: StoreNotificationItem[] = [];
    const yesterday: StoreNotificationItem[] = [];
    const earlier: StoreNotificationItem[] = [];

    filtered.forEach((n) => {
      const ts = new Date(n.timestamp || n.createdAt);
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

  const getIcon = (type: StoreNotificationItem["type"]) => {
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

  const renderItem = (n: StoreNotificationItem) => {
    const isRead = n.read || n.isRead;
    return (
      <div
        key={n.id || n.notificationId}
        onClick={() => {
          if (!isRead) handleMarkAsRead(n.notificationId || n.id);
        }}
        className={`group relative flex items-start gap-3 p-3 transition rounded-xl cursor-pointer ${
          isRead
            ? "bg-transparent hover:bg-stone-100/70 dark:hover:bg-stone-800/50"
            : "bg-emerald-50/60 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30"
        }`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800 mt-0.5">
          {getIcon(n.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p
              className={`text-xs truncate ${
                isRead
                  ? "text-stone-800 dark:text-stone-200 font-medium"
                  : "text-stone-900 dark:text-stone-50 font-bold"
              }`}
            >
              {n.title}
            </p>
            {!isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
            {n.message}
          </p>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[10px] text-stone-400">
              {new Date(n.timestamp || n.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {n.link && (
              <Link
                href={n.link}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isRead) handleMarkAsRead(n.notificationId || n.id);
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
    <>
      {/* Real-time Order Alert Toast Banner */}
      {activeOrderAlert && (
        <div className="fixed top-16 right-4 sm:right-6 z-[100] max-w-sm w-full animate-in slide-in-from-top-4 duration-300">
          <div className="rounded-2xl border-2 border-emerald-500 bg-white p-4 shadow-2xl backdrop-blur-md dark:bg-stone-900 ring-4 ring-emerald-500/20">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <ShoppingBag className="h-5 w-5 animate-bounce" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    New Order Alert!
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveOrderAlert(null)}
                    className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <h4 className="mt-1 text-sm font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                  {activeOrderAlert.title}
                </h4>
                <p className="mt-0.5 text-xs text-stone-600 dark:text-stone-300 line-clamp-2">
                  {activeOrderAlert.message}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeOrderAlert.link) {
                        router.push(activeOrderAlert.link);
                      }
                      setActiveOrderAlert(null);
                    }}
                    className="flex-1 rounded-xl bg-emerald-600 py-1.5 px-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 text-center transition"
                  >
                    View Order
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveOrderAlert(null)}
                    className="rounded-xl border border-stone-200 py-1.5 px-3 text-xs font-semibold text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800 transition"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Notification Bell Trigger */}
      <div className="relative" ref={panelRef}>
        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
            enableDesktopAlerts();
          }}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
          aria-label="Seller Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold text-white shadow-xs animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 origin-top-right rounded-2xl border border-stone-200/80 bg-white/95 shadow-2xl backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-900/95 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[520px]">
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
                <p className="text-[11px] text-stone-400">Store operations & real-time order alerts</p>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Sound Chime Toggle */}
                <button
                  type="button"
                  onClick={() => setSoundEnabled((prev) => !prev)}
                  className={`rounded-lg p-1.5 transition ${
                    soundEnabled
                      ? "text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                      : "text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                  title={soundEnabled ? "Order chime active (click to mute)" : "Order chime muted (click to unmute)"}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={markAllReadMutation.isPending}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/40 transition"
                    title="Mark all notifications as read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>Mark read</span>
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

            {/* Filter Pills & Audio indicator */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/30">
              <div className="flex items-center gap-1.5">
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

              <button
                type="button"
                onClick={playOrderAlertChime}
                className="text-[10px] font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                title="Test audio chime"
              >
                Test Chime 🔔
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-2 divide-y divide-stone-100 dark:divide-stone-800/60 scrollbar-thin">
              {filtered.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="mx-auto h-8 w-8 text-stone-300 dark:text-stone-700 mb-2" />
                  <p className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                    No notifications
                  </p>
                  <p className="text-[11px] text-stone-400">
                    You will receive instant alerts whenever a new order takes place!
                  </p>
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
            <div className="border-t border-stone-100 dark:border-stone-800 p-2 text-center bg-stone-50/50 dark:bg-stone-950/30 flex items-center justify-between px-3">
              <span className="text-[10px] text-stone-400">Real-time alerts active</span>
              <Link
                href="/store/orders"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Orders Dashboard</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
