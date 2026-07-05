import api from "./api";
import type { ApiResponse } from "@/types/api";

export interface AddressItem {
  addressId?: string;
  fullName?: string;
  mobile?: string;
  house?: string;
  street?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  addressType?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressListResponse {
  addresses: AddressItem[];
}

export interface CreateAddressPayload {
  fullName: string;
  mobile: string;
  house: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  addressType?: string;
  isDefault?: boolean;
}

export async function fetchAddresses() {
  const response = await api.get<ApiResponse<AddressListResponse>>("/api/v1/addresses");
  return response.data.data?.addresses ?? [];
}

export async function addAddress(payload: CreateAddressPayload) {
  const response = await api.post<ApiResponse<{ address: AddressItem }>>("/api/v1/addresses", payload);
  return response.data.data?.address;
}

export async function removeAddress(addressId: string) {
  const response = await api.delete<ApiResponse<{ address: AddressItem }>>(`/api/v1/addresses/${addressId}`);
  return response.data.data?.address;
}
