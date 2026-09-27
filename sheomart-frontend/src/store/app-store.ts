import { create } from "zustand";

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: "system" | "marketplace" | "security" | "inventory";
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  priority?: "low" | "medium" | "high";
}

const DEFAULT_NOTIFICATIONS: DashboardNotification[] = [
  {
    id: "notif-1",
    title: "New Store Application",
    message: "A new seller registered 'Sheopur Organic Spices' awaiting verification.",
    type: "marketplace",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    read: false,
    actionUrl: "/admin/stores",
    priority: "high",
  },
  {
    id: "notif-2",
    title: "Low Inventory Warning",
    message: "3 catalog products have fallen below threshold (< 5 units remaining).",
    type: "inventory",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
    actionUrl: "/admin/analytics",
    priority: "medium",
  },
  {
    id: "notif-3",
    title: "Review Reported for Spam",
    message: "Customer feedback was flagged for suspicious promotion.",
    type: "marketplace",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read: false,
    actionUrl: "/admin/reviews",
    priority: "medium",
  },
  {
    id: "notif-4",
    title: "Database Backup Completed",
    message: "Automated daily platform snapshot synchronized successfully.",
    type: "system",
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    read: true,
    actionUrl: "/admin/settings",
    priority: "low",
  },
];

interface AppState {
  // Mobile drawer
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Sidebar collapse
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapse: () => void;

  // Command palette
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Notifications
  notifications: DashboardNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: string) => void;
  addNotification: (notif: Omit<DashboardNotification, "id" | "timestamp" | "read">) => void;

  hydrateSidebar: () => void;

  // Dense table mode
  denseMode: boolean;
  toggleDenseMode: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

  isSidebarCollapsed: false,
  hydrateSidebar: () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sheomart_sidebar_collapsed");
      if (saved !== null) {
        set({ isSidebarCollapsed: saved === "true" });
      }
    }
  },
  setSidebarCollapsed: (collapsed) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sheomart_sidebar_collapsed", String(collapsed));
    }
    set({ isSidebarCollapsed: collapsed });
  },
  toggleSidebarCollapse: () =>
    set((state) => {
      const next = !state.isSidebarCollapsed;
      if (typeof window !== "undefined") {
        localStorage.setItem("sheomart_sidebar_collapsed", String(next));
      }
      return { isSidebarCollapsed: next };
    }),

  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

  notifications: DEFAULT_NOTIFICATIONS,
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  addNotification: (notif) =>
    set((state) => ({
      notifications: [
        {
          ...notif,
          id: `notif-${Date.now()}`,
          timestamp: new Date().toISOString(),
          read: false,
        },
        ...state.notifications,
      ],
    })),

  denseMode: false,
  toggleDenseMode: () => set((state) => ({ denseMode: !state.denseMode })),
}));
