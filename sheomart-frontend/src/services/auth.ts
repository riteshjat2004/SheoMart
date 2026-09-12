import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  AuthProfileResponse,
  AuthSessionPayload,
  RefreshTokenResponse,
} from "@/types/auth";
import type { LoginFormValues, RegisterFormValues } from "@/lib/auth-schemas";

export async function login(values: LoginFormValues): Promise<AuthSessionPayload> {
  const response = await api.post<ApiResponse<AuthSessionPayload>>("/api/v1/auth/login", values);
  return response.data.data as AuthSessionPayload;
}

export async function register(values: RegisterFormValues): Promise<AuthSessionPayload> {
  const response = await api.post<ApiResponse<AuthSessionPayload>>("/api/v1/auth/register", values);
  return response.data.data as AuthSessionPayload;
}

export async function logout(): Promise<void> {
  await api.post("/api/v1/auth/logout");
}

export async function refreshToken(): Promise<RefreshTokenResponse> {
  const response = await api.post<ApiResponse<RefreshTokenResponse>>("/api/v1/auth/refresh");
  return response.data.data as RefreshTokenResponse;
}

export async function getProfile(): Promise<AuthProfileResponse> {
  const response = await api.get<ApiResponse<AuthProfileResponse>>("/api/v1/users/profile");
  return response.data.data as AuthProfileResponse;
}

export async function requestPasswordReset(email: string) {
  const response = await api.post<ApiResponse<{ accountType: "customer" | "seller" | "unknown"; message: string; seller?: { email: string; storeId: string; storeName: string } }>>("/api/v1/auth/forgot-password", { email });
  return response.data.data as { accountType: "customer" | "seller" | "unknown"; message: string; seller?: { email: string; storeId: string; storeName: string } };
}

export async function resendPasswordResetOtp(email: string) {
  const response = await api.post<ApiResponse<unknown>>("/api/v1/auth/resend-reset-otp", { email });
  return response.data;
}

export async function verifyPasswordResetOtp(email: string, otp: string): Promise<{ email: string; resetToken: string }> {
  const response = await api.post<ApiResponse<{ email: string; resetToken: string }>>("/api/v1/auth/verify-reset-otp", { email, otp });
  return response.data.data as { email: string; resetToken: string };
}

export async function resetPassword(payload: { email: string; resetToken: string; newPassword: string; confirmPassword: string }) {
  const response = await api.post<ApiResponse<unknown>>("/api/v1/auth/reset-password", payload);
  return response.data;
}
