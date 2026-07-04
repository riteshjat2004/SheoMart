import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { ProfileResponse, ProfileUpdatePayload, ProfileUser } from "@/types/profile";

export async function fetchProfile(): Promise<ProfileUser> {
  const response = await api.get<ApiResponse<ProfileResponse>>("/api/v1/users/profile");
  return response.data.data?.user as ProfileUser;
}

export async function updateProfile(payload: ProfileUpdatePayload): Promise<ProfileUser> {
  const response = await api.patch<ApiResponse<ProfileResponse>>("/api/v1/users/profile", payload);
  return response.data.data?.user as ProfileUser;
}

export async function changePassword(payload: { currentPassword: string; newPassword: string; confirmPassword: string }) {
  const response = await api.patch<ApiResponse<unknown>>("/api/v1/users/change-password", payload);
  return response.data;
}

export async function deleteAccount() {
  const response = await api.delete<ApiResponse<unknown>>("/api/v1/users/account");
  return response.data;
}
