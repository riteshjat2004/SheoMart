import { useQuery } from "@tanstack/react-query";
import { fetchBillingInvoices, type BillingInvoiceFilters } from "@/services/billing-history";

export function useBillingInvoices(filters: BillingInvoiceFilters) {
  return useQuery({
    queryKey: ["billing-invoices", filters],
    queryFn: () => fetchBillingInvoices(filters),
    staleTime: 1000 * 60,
  });
}
