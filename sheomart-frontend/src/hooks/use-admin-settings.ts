import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminSettings,
  updateAdminSettings,
  fetchAuditLogs,
  fetchAdminSessions,
  revokeAdminSession,
  logoutOtherAdminSessions,
  fetchSystemHealth,
  fetchSecurityStatus,
} from "@/services/admin-settings";
import type { AuditLogFilters, MarketplaceSettings } from "@/types/admin-settings";

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin-settings"],
    queryFn: fetchAdminSettings,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: Partial<MarketplaceSettings>) => updateAdminSettings(updates),
    onSuccess: (updated) => {
      queryClient.setQueryData(["admin-settings"], updated);
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
    },
  });
}

export function useAdminAuditLogs(filters: AuditLogFilters) {
  return useQuery({
    queryKey: ["admin-audit-logs", filters],
    queryFn: () => fetchAuditLogs(filters),
    staleTime: 1000 * 60 * 1,
  });
}

export function useAdminSessions() {
  return useQuery({
    queryKey: ["admin-sessions"],
    queryFn: fetchAdminSessions,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => revokeAdminSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
    },
  });
}

export function useLogoutOtherSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logoutOtherAdminSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
    },
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ["system-health"],
    queryFn: fetchSystemHealth,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60, // poll every 60s for health
  });
}

export function useSecurityStatus() {
  return useQuery({
    queryKey: ["security-status"],
    queryFn: fetchSecurityStatus,
    staleTime: 1000 * 60 * 2,
  });
}
