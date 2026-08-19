import { useQuery } from "@tanstack/react-query";
import { fetchAdminProducts } from "@/services/admin-products";
import type { AdminProductFilters } from "@/types/admin-product";

export function useAdminProducts(filters: AdminProductFilters) {
  return useQuery({
    queryKey: ["admin-products", filters],
    queryFn: () => fetchAdminProducts(filters),
    staleTime: 1000 * 60 * 2,
  });
}
