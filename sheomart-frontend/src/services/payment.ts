import api from "./api";

export interface CreatePaymentOrderResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
}

export async function createPaymentOrder(orderId: string) {
  const response = await api.post<{ data: CreatePaymentOrderResponse }>("/api/v1/payments/create-order", {
    orderId,
  });

  return response.data.data;
}

export async function verifyPayment(payload: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const response = await api.post("/api/v1/payments/verify", payload);

  return response.data.data;
}