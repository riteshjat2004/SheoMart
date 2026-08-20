import { useMutation } from "@tanstack/react-query";
import { createOfflineInvoice, type CreateOfflineInvoicePayload } from "@/services/billing";

export function useCreateOfflineInvoice() {
  return useMutation({
    mutationFn: (payload: CreateOfflineInvoicePayload) => createOfflineInvoice(payload),
  });
}
