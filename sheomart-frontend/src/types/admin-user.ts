import type { UserRole } from "@/types/auth";

export interface AdminUser {
  userId: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  isCreditApproved: boolean;
  city: string;
  state: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminUserListResponse {
  users: AdminUser[];
  pagination: AdminUserPagination;
}

export interface AdminUserFilters {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  page: number;
  limit: number;
  sortBy?: "createdAt" | "name" | "email" | "role";
  sortOrder?: "asc" | "desc";
}
