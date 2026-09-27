"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchStoreCustomers,
  fetchStoreCustomersSummary,
  fetchStoreCustomersAnalytics,
  fetchStoreCustomerOrders,
  updateStoreCustomerNotes,
} from "@/services/store-customers";
import type { StoreCustomerFilters } from "@/types/store-customer";

export function useStoreCustomers(filters: StoreCustomerFilters) {
  return useQuery({
    queryKey: ["store-customers", filters],
    queryFn: () => fetchStoreCustomers(filters),
    staleTime: 1000 * 30,
  });
}

export function useStoreCustomersSummary() {
  return useQuery({
    queryKey: ["store-customers-summary"],
    queryFn: fetchStoreCustomersSummary,
    staleTime: 1000 * 60,
  });
}

export function useStoreCustomersAnalytics() {
  return useQuery({
    queryKey: ["store-customers-analytics"],
    queryFn: fetchStoreCustomersAnalytics,
    staleTime: 1000 * 60 * 2,
  });
}

export function useStoreCustomerOrders(
  customerId: string | null,
  params?: {
    page?: number;
    limit?: number;
    orderStatus?: string;
    paymentStatus?: string;
    sortBy?: string;
  }
) {
  return useQuery({
    queryKey: ["store-customer-orders", customerId, params],
    queryFn: () => fetchStoreCustomerOrders(customerId as string, params),
    enabled: Boolean(customerId),
    staleTime: 1000 * 30,
  });
}

export function useUpdateCustomerNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, notes }: { customerId: string; notes: string }) =>
      updateStoreCustomerNotes(customerId, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["store-customer", variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ["store-customers"] });
    },
  });
}
