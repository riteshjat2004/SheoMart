import { useMutation } from "@tanstack/react-query";
import { updatePlusCustomer } from "@/services/store-customers";

export function useUpdatePlusCustomer() {
  return useMutation({
    mutationFn: ({ customerId, isPlusCustomer }: { customerId: string; isPlusCustomer: boolean }) =>
      updatePlusCustomer(customerId, isPlusCustomer),
  });
}
