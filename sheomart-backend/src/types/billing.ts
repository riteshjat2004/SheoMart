export const PAYMENT_METHOD = {
  CASH: "CASH",
  UPI: "UPI",
  CREDIT: "CREDIT",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const PAYMENT_STATUS = {
  PAID: "PAID",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PENDING: "PENDING",
  CANCELLED: "CANCELLED",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const INVOICE_STATUS = {
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];

export const INVENTORY_MOVEMENT_TYPE = {
  SALE_OFFLINE: "SALE_OFFLINE",
  SALE_ONLINE: "SALE_ONLINE",
  RESTOCK: "RESTOCK",
  ADJUSTMENT: "ADJUSTMENT",
  RETURN: "RETURN",
  CANCEL_INVOICE: "CANCEL_INVOICE",
  CANCEL_ORDER: "CANCEL_ORDER",
} as const;

export type InventoryMovementType =
  (typeof INVENTORY_MOVEMENT_TYPE)[keyof typeof INVENTORY_MOVEMENT_TYPE];

export const REFERENCE_TYPE = {
  OFFLINE_INVOICE: "OFFLINE_INVOICE",
  ONLINE_ORDER: "ONLINE_ORDER",
  MANUAL: "MANUAL",
} as const;

export type ReferenceType = (typeof REFERENCE_TYPE)[keyof typeof REFERENCE_TYPE];

export interface OfflineInvoiceData {
  invoiceNumber: string;
  storeId: string;
  customerId?: string | null;
  walkInCustomerName?: string;
  walkInCustomerPhone?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discountAmount: number;
  grandTotal: number;
  amountPaid: number;
  remainingAmount: number;
  totalItems: number;
  notes?: string;
  status: InvoiceStatus;
  createdBy: string;
  cancelledAt?: Date | null;
}

export interface OfflineInvoiceItemData {
  invoiceId: string;
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  categorySnapshot: string;
  priceSnapshot: number;
  discountSnapshot: number;
  quantity: number;
  subtotal: number;
}

export interface InventoryLedgerData {
  storeId: string;
  productId: string;
  movementType: InventoryMovementType;
  referenceType: ReferenceType;
  referenceId: string;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  performedBy: string;
}

export interface StoreCustomerData {
  storeId: string;
  customerId: string;
  isPlusCustomer: boolean;
  joinedAt: Date;
  totalOfflinePurchases: number;
  totalOnlinePurchases: number;
  lastPurchaseAt?: Date | null;
}
