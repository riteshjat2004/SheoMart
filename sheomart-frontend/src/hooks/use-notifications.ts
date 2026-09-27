"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCustomerNotifications, type CustomerNotificationItem } from "@/services/notifications";

export function useCustomerNotifications(enabled = true) {
  return useQuery<CustomerNotificationItem[], Error>({
    queryKey: ["customer-notifications"],
    queryFn: fetchCustomerNotifications,
    enabled,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
  });
}
