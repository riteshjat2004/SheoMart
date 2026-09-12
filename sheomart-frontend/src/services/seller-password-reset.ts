import api from "@/services/api";
import type { ApiResponse } from "@/types/api";

export interface SellerPasswordResetRequest {
  id: string;
  sellerId: string;
  storeId: string;
  email: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  adminRemarks: string;
  createdAt: string;
  reviewedAt?: string;
  sellerName: string;
  storeName: string;
  storeBadge: "normal" | "verified" | "royal";
  storeStatus: string;
}

export async function submitSellerPasswordResetRequest(payload: { email: string; newPassword: string; confirmPassword: string; reason?: string }) {
  const response = await api.post<ApiResponse<unknown>>("/api/v1/seller/password-reset-request", payload);
  return response.data;
}

export async function fetchSellerRecovery(email: string) {
  const response = await api.get<ApiResponse<{ latestRequest: { id: string; status: "pending" | "approved" | "rejected"; createdAt: string; adminRemarks: string } | null }>>("/api/v1/seller/password-reset-recovery", { params: { email } });
  return response.data.data;
}

export async function fetchSellerPasswordResetRequests(): Promise<SellerPasswordResetRequest[]> {
  const response = await api.get<ApiResponse<{ requests: SellerPasswordResetRequest[] }>>("/api/v1/admin/password-reset-requests");
  return response.data.data?.requests ?? [];
}

export async function approveSellerPasswordReset(id: string, remarks: string) {
  const response = await api.patch<ApiResponse<unknown>>(`/api/v1/admin/password-reset-requests/${id}/approve`, { remarks });
  return response.data;
}

export async function rejectSellerPasswordReset(id: string, remarks: string) {
  const response = await api.patch<ApiResponse<unknown>>(`/api/v1/admin/password-reset-requests/${id}/reject`, { remarks });
  return response.data;
}
