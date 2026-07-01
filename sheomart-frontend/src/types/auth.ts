export type UserRole = "customer" | "store_owner" | "platform_admin";

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  isCreditApproved: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  isActive: boolean;
}

export interface AuthSessionPayload {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface AuthProfileResponse {
  user: AuthUser;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
