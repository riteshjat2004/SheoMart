import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  AdminSession,
  AuditLogFilters,
  AuditLogListResponse,
  MarketplaceSettings,
  SecurityStatusData,
  SystemHealthData,
} from "@/types/admin-settings";

export async function fetchAdminSettings(): Promise<MarketplaceSettings> {
  const response = await api.get<ApiResponse<MarketplaceSettings>>("/api/v1/settings/admin");
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to load marketplace settings");
  }
  return response.data.data;
}

export async function updateAdminSettings(
  updates: Partial<MarketplaceSettings>
): Promise<MarketplaceSettings> {
  const response = await api.patch<ApiResponse<MarketplaceSettings>>(
    "/api/v1/settings/admin",
    updates
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to update marketplace settings");
  }
  return response.data.data;
}

export async function uploadBrandingAsset(file: File): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post<ApiResponse<{ url: string; publicId: string }>>(
    "/api/v1/settings/admin/branding/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  if (!response.data.data?.url) {
    throw new Error(response.data.message || "Failed to upload branding image");
  }

  return response.data.data;
}

export async function fetchAuditLogs(filters: AuditLogFilters): Promise<AuditLogListResponse> {
  const params = new URLSearchParams();
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));
  if (filters.module && filters.module !== "all") params.set("module", filters.module);
  if (filters.action) params.set("action", filters.action);
  if (filters.search) params.set("search", filters.search);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  const response = await api.get<ApiResponse<AuditLogListResponse>>(
    `/api/v1/settings/admin/audit-logs?${params.toString()}`
  );
  return (
    response.data.data ?? {
      logs: [],
      pagination: { page: filters.page, limit: filters.limit, total: 0, totalPages: 0 },
    }
  );
}

export async function createPlatformBackup(): Promise<{ backupTime: string; backupSize: string }> {
  const response = await api.post<ApiResponse<{ backupTime: string; backupSize: string }>>(
    "/api/v1/settings/admin/backup/create",
    {}
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to generate backup");
  }
  return response.data.data;
}

export async function downloadPlatformBackup(): Promise<void> {
  const response = await api.get("/api/v1/settings/admin/backup/download", {
    responseType: "blob",
  });
  const blob = new Blob([response.data], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `sheomart-settings-backup-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function fetchSystemHealth(): Promise<SystemHealthData> {
  const response = await api.get<ApiResponse<SystemHealthData>>("/api/v1/settings/admin/health");
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to load system diagnostics");
  }
  return response.data.data;
}

export async function exportPlatformDataset(
  type: "products" | "categories" | "users" | "stores" | "coupons"
): Promise<void> {
  const response = await api.get(`/api/v1/settings/admin/export?type=${type}`, {
    responseType: "blob",
  });
  const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `sheomart-${type}-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function fetchAdminSessions(): Promise<AdminSession[]> {
  const response = await api.get<ApiResponse<{ sessions: AdminSession[] }>>(
    "/api/v1/admin/security/sessions"
  );
  return response.data.data?.sessions ?? [];
}

export async function revokeAdminSession(sessionId: string): Promise<void> {
  await api.delete(`/api/v1/admin/security/sessions/${sessionId}`);
}

export async function logoutOtherAdminSessions(): Promise<string> {
  const response = await api.post<ApiResponse<unknown>>(
    "/api/v1/admin/security/sessions/logout-other",
    {}
  );
  return response.data.message || "Logged out of other sessions";
}

export async function fetchSecurityStatus(): Promise<SecurityStatusData> {
  const response = await api.get<ApiResponse<SecurityStatusData>>(
    "/api/v1/admin/security/status"
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to load security status");
  }
  return response.data.data;
}
