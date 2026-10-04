import api from "./api";
import type { ApiResponse } from "@/types/api";

export interface PublicMaintenanceInfo {
  enabled: boolean;
  title?: string;
  description?: string;
  estimatedReturnTime?: string | null;
}

export interface PublicSettings {
  general?: Record<string, unknown>;
  branding?: Record<string, unknown>;
  delivery?: Record<string, unknown>;
  payments?: Record<string, unknown>;
  announcement?: Record<string, unknown>;
  maintenance: PublicMaintenanceInfo;
}

export async function fetchPublicSettings(): Promise<PublicSettings> {
  const response = await api.get<ApiResponse<PublicSettings>>("/api/v1/settings/public");
  if (!response.data?.data) {
    throw new Error(response.data?.message || "Failed to fetch public settings");
  }
  return response.data.data;
}
