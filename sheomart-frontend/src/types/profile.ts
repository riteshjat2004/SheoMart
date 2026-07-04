import type { UserRole } from "@/types/auth";

export interface ProfileUser {
  userId: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isCreditApproved?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  isActive?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ProfileResponse {
  user: ProfileUser;
}

export interface ProfileUpdatePayload {
  name?: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  avatar?: string;
}

export type SellerApplicationStatus = "none" | "pending" | "approved" | "rejected";
