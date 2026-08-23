"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addAddress, fetchAddresses, removeAddress } from "@/services/addresses";
import type { AddressItem, CreateAddressPayload } from "@/services/addresses";

export function useAddresses(enabled = true) {
  return useQuery<AddressItem[], Error>({
    queryKey: ["addresses"],
    queryFn: fetchAddresses,
    staleTime: 1000 * 60 * 2,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled,
  });
}

export function useAddAddress() {
  const queryClient = useQueryClient();

  return useMutation<AddressItem | undefined, Error, CreateAddressPayload>({
    mutationFn: addAddress,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useRemoveAddress() {
  const queryClient = useQueryClient();

  return useMutation<AddressItem | undefined, Error, string>({
    mutationFn: removeAddress,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });
}
