import { useQuery } from "@tanstack/react-query";
import { fetchStoreCustomers } from "@/services/store-customers";
import type { StoreCustomerFilters } from "@/types/store-customer";

export function useStoreCustomers(filters: StoreCustomerFilters) {
  return useQuery({
    queryKey: ["store-customers", filters],
    queryFn: () => fetchStoreCustomers(filters),
    staleTime: 1000 * 60,
  });
}
