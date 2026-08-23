"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStoreCustomer, type StoreCustomerDetails } from "@/services/store-customers";
import type { StoreCustomer } from "@/types/store-customer";

export function useStoreCustomer(customerId: string | null, initialCustomer?: StoreCustomer | null, storeId?: string) {
  return useQuery<StoreCustomerDetails | null, Error>({
    queryKey: ["store-customer", customerId, storeId],
    queryFn: () => fetchStoreCustomer(customerId as string, storeId),
    enabled: Boolean(customerId && storeId),
    initialData: initialCustomer ? { customer: initialCustomer } : undefined,
    staleTime: 1000 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}