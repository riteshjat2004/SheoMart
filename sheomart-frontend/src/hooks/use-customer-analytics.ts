"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCustomerInsights, type CustomerInsights } from "@/services/customer-analytics";

export function useCustomerInsights(enabled = true) {
  return useQuery<CustomerInsights, Error>({
    queryKey: ["customer-insights"],
    queryFn: fetchCustomerInsights,
    enabled,
    staleTime: 1000 * 60 * 3,
  });
}
