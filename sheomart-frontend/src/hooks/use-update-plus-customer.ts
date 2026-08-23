import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePlusCustomer } from "@/services/store-customers";

export function useUpdatePlusCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, isPlusCustomer }: { customerId: string; isPlusCustomer: boolean }) =>
      updatePlusCustomer(customerId, isPlusCustomer),
    onSuccess: (customer) => {
      queryClient.setQueriesData<{ customers: Array<{ customerId: string; isPlusCustomer: boolean }> }>({ queryKey: ["store-customers"] }, (current) => {
        if (!current) return current;
        return {
          ...current,
          customers: current.customers.map((item) => item.customerId === customer.customerId ? { ...item, isPlusCustomer: customer.isPlusCustomer } : item),
        };
      });
      void queryClient.invalidateQueries({ queryKey: ["store-customers"] });
      void queryClient.invalidateQueries({ queryKey: ["store-customer", customer.customerId] });
    },
  });
}
