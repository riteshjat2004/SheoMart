import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { AdminUserFilters, AdminUserListResponse } from "@/types/admin-user";

export async function fetchAdminUsers(filters: AdminUserFilters): Promise<AdminUserListResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.role) params.set("role", filters.role);
  if (typeof filters.isActive === "boolean") params.set("isActive", String(filters.isActive));
  if (typeof filters.emailVerified === "boolean") params.set("emailVerified", String(filters.emailVerified));
  if (typeof filters.phoneVerified === "boolean") params.set("phoneVerified", String(filters.phoneVerified));
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

  const response = await api.get<ApiResponse<AdminUserListResponse>>(`/api/v1/users/admin?${params.toString()}`);
  return response.data.data ?? { users: [], pagination: { page: filters.page, limit: filters.limit, total: 0, totalPages: 0 } };
}
