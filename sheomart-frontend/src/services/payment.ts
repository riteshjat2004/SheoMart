import api from "./api";

export interface CreatePaymentOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
}

export async function createPaymentOrder(checkout: Record<string, unknown>) {
  const response = await api.post<{ data: CreatePaymentOrderResponse }>("/api/v1/payments/create-order", {
    checkout,
  });

  return response.data.data;
}

export async function verifyPayment(payload: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  checkout: Record<string, unknown>;
}) {
  const response = await api.post("/api/v1/payments/verify", payload);

  return response.data.data;
}