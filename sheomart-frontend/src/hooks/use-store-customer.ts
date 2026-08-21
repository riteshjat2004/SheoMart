"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStoreCustomer, type StoreCustomerDetails } from "@/services/store-customers";
import type { StoreCustomer } from "@/types/store-customer";

export function useStoreCustomer(customerId: string | null, initialCustomer?: StoreCustomer | null) {
  return useQuery<StoreCustomerDetails | null, Error>({
    queryKey: ["store-customer", customerId],
    queryFn: () => fetchStoreCustomer(customerId as string),
    enabled: Boolean(customerId),
    initialData: initialCustomer ? { customer: initialCustomer } : undefined,
    staleTime: 1000 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}