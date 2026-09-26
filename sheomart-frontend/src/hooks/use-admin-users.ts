import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminUsers,
  fetchAdminUserStats,
  fetchAdminUserDetails,
  createAdminUser,
  updateAdminUser,
  updateUserStatus,
  updateUserRole,
  verifyCustomer,
  deleteAdminUser,
  restoreAdminUser,
  bulkUserAction,
} from "@/services/admin-users";
import type {
  AdminUserFilters,
  CreateAdminUserInput,
  UpdateAdminUserInput,
} from "@/types/admin-user";
import type { UserRole } from "@/types/auth";

export function useAdminUsers(filters: AdminUserFilters) {
  return useQuery({
    queryKey: ["admin-users", filters],
    queryFn: () => fetchAdminUsers(filters),
    staleTime: 1000 * 30,
  });
}

export function useAdminUserStats() {
  return useQuery({
    queryKey: ["admin-user-stats"],
    queryFn: () => fetchAdminUserStats(),
    staleTime: 1000 * 30,
  });
}

export function useAdminUserDetails(userId: string | null) {
  return useQuery({
    queryKey: ["admin-user-details", userId],
    queryFn: () => (userId ? fetchAdminUserDetails(userId) : null),
    enabled: Boolean(userId),
    staleTime: 1000 * 30,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAdminUserInput) => createAdminUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-stats"] });
    },
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateAdminUserInput }) =>
      updateAdminUser(userId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-details", variables.userId] });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      isSuspended,
      suspendedReason,
    }: {
      userId: string;
      isSuspended: boolean;
      suspendedReason?: string;
    }) => updateUserStatus(userId, isSuspended, suspendedReason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-details", variables.userId] });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      updateUserRole(userId, role),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-details", variables.userId] });
    },
  });
}

export function useVerifyCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isVerifiedCustomer }: { userId: string; isVerifiedCustomer: boolean }) =>
      verifyCustomer(userId, isVerifiedCustomer),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-details", variables.userId] });
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteAdminUser(userId),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-details", userId] });
    },
  });
}

export function useRestoreAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => restoreAdminUser(userId),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-details", userId] });
    },
  });
}

export function useBulkUserAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userIds,
      action,
      reason,
    }: {
      userIds: string[];
      action: "verify" | "unverify" | "suspend" | "activate" | "delete" | "restore" | "assign_seller" | "remove_seller";
      reason?: string;
    }) => bulkUserAction(userIds, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-details"] });
    },
  });
}

