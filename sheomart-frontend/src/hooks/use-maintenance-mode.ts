"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPublicSettings, type PublicMaintenanceInfo } from "@/services/public-settings";
import { useAuthStore } from "@/store/auth-store";

const DEFAULT_MAINTENANCE_INFO: PublicMaintenanceInfo = {
  enabled: false,
  title: "We'll be back soon",
  description: "We're making a few improvements to SheoMart. Please check back shortly.",
  estimatedReturnTime: null,
};

export function useMaintenanceMode() {
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.role);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isPlatformAdmin = Boolean(isAuthenticated && role === "platform_admin");

  const {
    data: publicSettings,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ["public-settings"],
    queryFn: fetchPublicSettings,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Poll every minute
    refetchOnWindowFocus: true,
    retry: 1,
  });

  // Listen to 503 maintenance events dispatched from api interceptor
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMaintenanceEvent = (event: Event) => {
      const customEvent = event as CustomEvent<Partial<PublicMaintenanceInfo>>;
      const detail = customEvent.detail;
      if (!detail) return;

      queryClient.setQueryData(["public-settings"], (old: any) => {
        const prevMaintenance = old?.maintenance ?? DEFAULT_MAINTENANCE_INFO;
        return {
          ...old,
          maintenance: {
            enabled: detail.enabled ?? true,
            title: detail.title ?? prevMaintenance.title,
            description: detail.description ?? prevMaintenance.description,
            estimatedReturnTime: detail.estimatedReturnTime ?? prevMaintenance.estimatedReturnTime,
          },
        };
      });
    };

    window.addEventListener("sheomart:maintenance", handleMaintenanceEvent);
    return () => {
      window.removeEventListener("sheomart:maintenance", handleMaintenanceEvent);
    };
  }, [queryClient]);

  const maintenanceInfo: PublicMaintenanceInfo =
    publicSettings?.maintenance ?? DEFAULT_MAINTENANCE_INFO;

  return {
    isMaintenanceActive: Boolean(maintenanceInfo.enabled),
    isPlatformAdmin,
    maintenanceInfo,
    isLoading,
    isFetching,
    refetch,
    error,
  };
}
