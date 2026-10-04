"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { fetchPublicSettings } from "@/services/public-settings";
import type { AuthUser } from "@/types/auth";

export type Theme = "dark" | "light";

export const THEME_EVENT = "sheomart-theme-change";
export const PLATFORM_DEFAULT_THEME_KEY = "sheomart_platform_default_theme";
export const PLATFORM_DEFAULT_THEME_EVENT = "sheomart-platform-theme-default-change";

export function isAuthRoute(pathname?: string | null): boolean {
  let path = pathname;
  if (!path && typeof window !== "undefined") {
    path = window.location.pathname;
  }
  if (!path) return false;
  return (
    path === "/login" ||
    path === "/register" ||
    path === "/forgot-password"
  );
}

export function getUserThemeKey(user?: Partial<AuthUser> | null): string {
  if (user?.userId) return `sheomart_theme_user_${user.userId}`;
  if (user?.email) return `sheomart_theme_user_${user.email}`;
  return "sheomart_theme_guest";
}

export function getPlatformDefaultTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = localStorage.getItem(PLATFORM_DEFAULT_THEME_KEY) as Theme | null;
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return "dark";
}

export function setPlatformDefaultTheme(defaultTheme: Theme) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PLATFORM_DEFAULT_THEME_KEY, defaultTheme);
    window.dispatchEvent(
      new CustomEvent(PLATFORM_DEFAULT_THEME_EVENT, { detail: { defaultTheme } })
    );
  } catch {}
}

export function hasCustomUserTheme(user?: Partial<AuthUser> | null): boolean {
  if (typeof window === "undefined") return false;
  try {
    const activeUser = user !== undefined ? user : getStoredAuthUser();
    const key = getUserThemeKey(activeUser);
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

export function resetToDefaultTheme(user?: Partial<AuthUser> | null): Theme {
  const defaultTheme = getPlatformDefaultTheme();
  if (typeof window !== "undefined") {
    try {
      const activeUser = user !== undefined ? user : getStoredAuthUser();
      const key = getUserThemeKey(activeUser);
      localStorage.removeItem(key);
      window.dispatchEvent(
        new CustomEvent(THEME_EVENT, { detail: { theme: defaultTheme, userKey: key } })
      );
    } catch {}
  }
  return defaultTheme;
}

export function getStoredAuthUser(): Partial<AuthUser> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("sheomart-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.user ?? null;
  } catch {
    return null;
  }
}

export function getInitialTheme(pathname?: string | null, user?: Partial<AuthUser> | null): Theme {
  if (typeof window === "undefined") return "dark";

  try {
    const activeUser = user !== undefined ? user : getStoredAuthUser();
    const key = getUserThemeKey(activeUser);
    const saved = localStorage.getItem(key) as Theme | null;
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Ignore localStorage access errors
  }
  return getPlatformDefaultTheme();
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const body = document.body;
  if (theme === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
    root.style.colorScheme = "dark";
    if (body) {
      body.classList.add("dark");
    }
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
    root.style.colorScheme = "light";
    if (body) {
      body.classList.remove("dark");
    }
  }
}

export function useTheme() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [theme, setThemeState] = useState<Theme>("dark");
  const [platformDefault, setPlatformDefault] = useState<Theme>("dark");
  const [hasCustomPreference, setHasCustomPreference] = useState(false);
  const [mounted, setMounted] = useState(false);
  const activeUserRef = useRef<Partial<AuthUser> | null>(user);
  activeUserRef.current = user;

  // Query public platform settings to discover admin-configured default theme
  const { data: publicSettings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: fetchPublicSettings,
    staleTime: 1000 * 30, // 30s
    retry: 1,
  });

  // Reactively recompute theme when route changes or user account switches
  useEffect(() => {
    setMounted(true);
    const currentTheme = getInitialTheme(pathname, user);
    setThemeState(currentTheme);
    applyTheme(currentTheme);
    setPlatformDefault(getPlatformDefaultTheme());
    setHasCustomPreference(hasCustomUserTheme(user));
  }, [pathname, user?.userId, user?.email]);

  // Sync server default theme from public-settings
  useEffect(() => {
    const serverDefault = publicSettings?.branding?.defaultTheme as Theme | undefined;
    if (serverDefault === "light" || serverDefault === "dark") {
      setPlatformDefault(serverDefault);
      try {
        localStorage.setItem(PLATFORM_DEFAULT_THEME_KEY, serverDefault);
      } catch {}

      const activeKey = getUserThemeKey(activeUserRef.current);
      const hasPersonalOverride = typeof window !== "undefined" && localStorage.getItem(activeKey) !== null;
      if (!hasPersonalOverride) {
        setThemeState(serverDefault);
        applyTheme(serverDefault);
      }
    }
  }, [publicSettings?.branding?.defaultTheme, pathname]);

  // Listen for storage and custom events for the active account and platform default
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      const activeKey = getUserThemeKey(activeUserRef.current);
      if (e.key === activeKey && (e.newValue === "light" || e.newValue === "dark")) {
        setThemeState(e.newValue);
        applyTheme(e.newValue);
        setHasCustomPreference(true);
      } else if (e.key === activeKey && e.newValue === null) {
        setHasCustomPreference(false);
        const def = getPlatformDefaultTheme();
        setThemeState(def);
        applyTheme(def);
      } else if (e.key === PLATFORM_DEFAULT_THEME_KEY && (e.newValue === "light" || e.newValue === "dark")) {
        setPlatformDefault(e.newValue as Theme);
        const hasPersonalOverride = typeof window !== "undefined" && localStorage.getItem(activeKey) !== null;
        if (!hasPersonalOverride) {
          setThemeState(e.newValue as Theme);
          applyTheme(e.newValue as Theme);
        }
      }
    };

    const handleCustomChange = (e: CustomEvent<{ theme: Theme; userKey?: string }>) => {
      const activeKey = getUserThemeKey(activeUserRef.current);
      if (e.detail?.theme && (!e.detail.userKey || e.detail.userKey === activeKey)) {
        setThemeState(e.detail.theme);
        applyTheme(e.detail.theme);
        setHasCustomPreference(hasCustomUserTheme(activeUserRef.current));
      }
    };

    const handlePlatformDefaultChange = (e: CustomEvent<{ defaultTheme: Theme }>) => {
      const newDefault = e.detail?.defaultTheme;
      if (!newDefault) return;
      setPlatformDefault(newDefault);
      const activeKey = getUserThemeKey(activeUserRef.current);
      const hasPersonalOverride = typeof window !== "undefined" && localStorage.getItem(activeKey) !== null;
      if (!hasPersonalOverride) {
        setThemeState(newDefault);
        applyTheme(newDefault);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(THEME_EVENT as unknown as string, handleCustomChange as EventListener);
    window.addEventListener(PLATFORM_DEFAULT_THEME_EVENT as unknown as string, handlePlatformDefaultChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(THEME_EVENT as unknown as string, handleCustomChange as EventListener);
      window.removeEventListener(PLATFORM_DEFAULT_THEME_EVENT as unknown as string, handlePlatformDefaultChange as EventListener);
    };
  }, [pathname]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    setHasCustomPreference(true);
    try {
      const userKey = getUserThemeKey(activeUserRef.current);
      localStorage.setItem(userKey, newTheme);
      window.dispatchEvent(
        new CustomEvent(THEME_EVENT, { detail: { theme: newTheme, userKey } })
      );
    } catch {
      // Ignore storage write errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const resetToDefault = useCallback(() => {
    const def = resetToDefaultTheme(activeUserRef.current);
    setHasCustomPreference(false);
    setThemeState(def);
    applyTheme(def);
  }, []);

  return {
    theme,
    setTheme,
    toggleTheme,
    resetToDefault,
    platformDefaultTheme: platformDefault,
    hasCustomTheme: hasCustomPreference,
    isDark: theme === "dark",
    isLight: theme === "light",
    isAuthPage: isAuthRoute(pathname),
    mounted,
  };
}
