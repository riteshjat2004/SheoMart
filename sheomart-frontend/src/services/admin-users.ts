import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  AdminUser,
  AdminUserDetails,
  AdminUserFilters,
  AdminUserListResponse,
  AdminUserStats,
  CreateAdminUserInput,
  UpdateAdminUserInput,
} from "@/types/admin-user";
import type { UserRole } from "@/types/auth";

export async function fetchAdminUsers(filters: AdminUserFilters): Promise<AdminUserListResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.role) params.set("role", filters.role);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (typeof filters.isVerifiedCustomer === "boolean") params.set("isVerifiedCustomer", String(filters.isVerifiedCustomer));
  if (typeof filters.isActive === "boolean") params.set("isActive", String(filters.isActive));
  if (typeof filters.emailVerified === "boolean") params.set("emailVerified", String(filters.emailVerified));
  if (typeof filters.phoneVerified === "boolean") params.set("phoneVerified", String(filters.phoneVerified));
  if (filters.district) params.set("district", filters.district);
  if (filters.state) params.set("state", filters.state);
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

  const response = await api.get<ApiResponse<AdminUserListResponse>>(`/api/v1/users/admin?${params.toString()}`);
  return response.data.data ?? { users: [], pagination: { page: filters.page, limit: filters.limit, total: 0, totalPages: 0 } };
}

export async function fetchAdminUserStats(): Promise<AdminUserStats> {
  const response = await api.get<ApiResponse<AdminUserStats>>("/api/v1/users/admin/stats");
  return response.data.data ?? {
    total: 0,
    active: 0,
    suspended: 0,
    deleted: 0,
    customers: 0,
    verifiedCustomers: 0,
    sellers: 0,
    admins: 0,
  };
}

export async function fetchAdminUserDetails(userId: string): Promise<AdminUserDetails> {
  const response = await api.get<ApiResponse<AdminUserDetails>>(`/api/v1/users/admin/${userId}`);
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to load user details");
  }
  return response.data.data;
}

export async function createAdminUser(data: CreateAdminUserInput): Promise<AdminUser> {
  const response = await api.post<ApiResponse<{ user: AdminUser }>>("/api/v1/users/admin", data);
  if (!response.data.data?.user) {
    throw new Error(response.data.message || "Failed to create user");
  }
  return response.data.data.user;
}

export async function updateAdminUser(userId: string, data: UpdateAdminUserInput): Promise<AdminUser> {
  const response = await api.patch<ApiResponse<{ user: AdminUser }>>(`/api/v1/users/admin/${userId}`, data);
  if (!response.data.data?.user) {
    throw new Error(response.data.message || "Failed to update user");
  }
  return response.data.data.user;
}

export async function updateUserStatus(userId: string, isSuspended: boolean, suspendedReason?: string): Promise<AdminUser> {
  const response = await api.patch<ApiResponse<{ user: AdminUser }>>(`/api/v1/users/admin/${userId}/status`, {
    isSuspended,
    suspendedReason,
  });
  if (!response.data.data?.user) {
    throw new Error(response.data.message || "Failed to update user status");
  }
  return response.data.data.user;
}

export async function updateUserRole(userId: string, role: UserRole): Promise<AdminUser> {
  const response = await api.patch<ApiResponse<{ user: AdminUser }>>(`/api/v1/users/admin/${userId}/role`, {
    role,
  });
  if (!response.data.data?.user) {
    throw new Error(response.data.message || "Failed to update user role");
  }
  return response.data.data.user;
}

export async function verifyCustomer(userId: string, isVerifiedCustomer: boolean): Promise<AdminUser> {
  const response = await api.patch<ApiResponse<{ user: AdminUser }>>(`/api/v1/users/admin/${userId}/verify`, {
    isVerifiedCustomer,
  });
  if (!response.data.data?.user) {
    throw new Error(response.data.message || "Failed to update customer verification");
  }
  return response.data.data.user;
}

export async function deleteAdminUser(userId: string): Promise<void> {
  await api.delete<ApiResponse<unknown>>(`/api/v1/users/admin/${userId}`);
}

export async function restoreAdminUser(userId: string): Promise<AdminUser> {
  const response = await api.patch<ApiResponse<{ user: AdminUser }>>(`/api/v1/users/admin/${userId}/restore`, {});
  if (!response.data.data?.user) {
    throw new Error(response.data.message || "Failed to restore user");
  }
  return response.data.data.user;
}

export async function bulkUserAction(
  userIds: string[],
  action: "verify" | "unverify" | "suspend" | "activate" | "delete" | "restore" | "assign_seller" | "remove_seller",
  reason?: string
): Promise<{ affectedCount: number; message: string }> {
  const response = await api.post<ApiResponse<{ action: string; affectedCount: number; message: string }>>(
    "/api/v1/users/admin/bulk-action",
    { userIds, action, reason }
  );
  return {
    affectedCount: response.data.data?.affectedCount ?? 0,
    message: response.data.data?.message || response.data.message || "Action executed",
  };
}

