import { useQuery } from "@tanstack/react-query";
import { fetchAdminUsers } from "@/services/admin-users";
import type { AdminUserFilters } from "@/types/admin-user";

export function useAdminUsers(filters: AdminUserFilters) {
  return useQuery({
    queryKey: ["admin-users", filters],
    queryFn: () => fetchAdminUsers(filters),
    staleTime: 1000 * 60 * 2,
  });
}
