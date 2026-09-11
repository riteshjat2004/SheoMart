import api from "./api";
import type { ApiResponse } from "@/types/api";

export interface PlatformFeeConfig {
  amount: number;
  feeType: "FIXED" | "PERCENTAGE";
  minimumOrderAmount?: number;
  maximumPlatformFee?: number;
  enabled: boolean;
}

export async function fetchPlatformFeeConfig() {
  const response = await api.get<ApiResponse<{ config: PlatformFeeConfig }>>("/api/v1/platform-fee");
  return response.data.data?.config;
}

export async function updatePlatformFeeConfig(config: PlatformFeeConfig) {
  const response = await api.patch<ApiResponse<{ config: PlatformFeeConfig }>>("/api/v1/platform-fee", config);
  return response.data.data?.config;
}
