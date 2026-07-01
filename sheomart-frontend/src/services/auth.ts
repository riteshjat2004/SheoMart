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
