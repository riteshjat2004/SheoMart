import api from "./api";
import type { ApiResponse } from "@/types/api";

export interface PlusMember {
  storeCustomerId: string;
  customerId?: string | null;
  pendingEmail?: string | null;
  pendingPhone?: string | null;
  isPlusCustomer: boolean;
  grantedAt?: string;
  linkedAt?: string | null;
  user?: { name?: string; email?: string; mobile?: string } | null;
}

export async function fetchPlusMembers(storeId: string, search?: string) {
  const response = await api.get<ApiResponse<{ members: PlusMember[] }>>(`/api/v1/stores/${storeId}/plus-members`, { params: search ? { search } : undefined });
  return response.data.data?.members ?? [];
}

export async function addPlusMember(storeId: string, identifier: string) {
  const response = await api.post<ApiResponse<{ member: PlusMember }>>(`/api/v1/stores/${storeId}/plus-members`, { identifier });
  return response.data.data?.member;
}

export async function removePlusMember(storeId: string, memberId: string) {
  const response = await api.delete<ApiResponse<{ member: PlusMember }>>(`/api/v1/stores/${storeId}/plus-members/${memberId}`);
  return response.data.data?.member;
}
