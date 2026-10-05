import api from "./api";
import type { ApiResponse } from "@/types/api";

export interface CreateOfflineInvoiceItemPayload {
  productId: string;
  variantId?: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export interface CreateOfflineInvoicePayload {
  customerId?: string;
  walkInCustomerName?: string;
  walkInCustomerPhone?: string;
  paymentMethod: "CASH" | "UPI" | "CREDIT";
  amountPaid: number;
  items: CreateOfflineInvoiceItemPayload[];
}

export interface OfflineInvoiceResponse {
  invoiceId: string;
  invoiceNumber: string;
  grandTotal: number;
  paymentStatus: string;
}

export async function createOfflineInvoice(payload: CreateOfflineInvoicePayload): Promise<OfflineInvoiceResponse> {
  const response = await api.post<ApiResponse<{ invoice: OfflineInvoiceResponse }>>(
    "/api/v1/billing/invoices",
    payload
  );

  const invoice = response.data.data?.invoice;
  if (!invoice) {
    throw new Error("Invoice creation response was incomplete.");
  }

  return invoice;
}

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface PosCatalogProduct {
  productId: string;
  name: string;
  sku: string;
  brand: string;
  price: number;
  discountPrice: number;
  sellingType?: "PIECE" | "WEIGHT" | "VOLUME";
  baseUnit?: string;
  unitLabel?: string;
  minQuantity?: number;
  stepQuantity?: number;
  allowCustomQuantity?: boolean;
  variants?: import("@/types/marketplace").ProductVariant[];
  stockTrackingMode?: "SEPARATE" | "SHARED";
  availableQuantity: number;
  lowStockThreshold: number;
  stockStatus: StockStatus;
  categoryId: string;
  categoryName: string;
  thumbnail: string;
  images: string[];
}

export interface PosCatalogCategory {
  categoryId: string;
  name: string;
}

export interface PosCatalogResponse {
  products: PosCatalogProduct[];
  categories: PosCatalogCategory[];
  store: {
    storeId: string;
    storeName: string;
  };
}

export async function fetchPosCatalog(): Promise<PosCatalogResponse> {
  const response = await api.get<ApiResponse<PosCatalogResponse>>(
    "/api/v1/billing/pos-catalog"
  );

  const data = response.data.data;
  if (!data) {
    throw new Error("POS catalog response was incomplete.");
  }

  return data;
}
