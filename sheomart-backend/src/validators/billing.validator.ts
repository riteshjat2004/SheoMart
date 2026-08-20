import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const telephoneRegex = /^\d{10}$/;

export const paymentMethodSchema = z.enum(["CASH", "UPI", "CREDIT"] as const);

export const invoiceStatusSchema = z.enum(["COMPLETED", "CANCELLED"] as const);

export const paymentStatusSchema = z.enum([
  "PAID",
  "PARTIALLY_PAID",
  "PENDING",
  "CANCELLED",
] as const);

export const createOfflineInvoiceItemSchema = z.object({
  productId: z.string().trim().min(1, "Product ID is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  discount: z.number().min(0, "Discount must be 0 or greater").optional(),
});

export const createOfflineInvoiceSchema = z.object({
  customerId: z
    .string()
    .trim()
    .regex(objectIdRegex, "Customer ID must be a valid Mongo ObjectId")
    .optional()
    .nullable(),
  walkInCustomerName: z.string().trim().min(1, "Walk-in customer name is required").optional(),
  walkInCustomerPhone: z
    .string()
    .trim()
    .regex(telephoneRegex, "Walk-in customer phone must be a 10-digit number")
    .optional(),
  paymentMethod: paymentMethodSchema,
  notes: z.string().trim().max(500, "Notes must be 500 characters or less").optional(),
  items: z.array(createOfflineInvoiceItemSchema).min(1, "Invoice must contain at least one item"),
});

export const invoiceIdParamSchema = z.object({
  invoiceId: z.string().trim().min(1, "Invoice ID is required"),
});

export const orderIdParamSchema = z.object({
  orderId: z.string().trim().min(1, "Order ID is required"),
});

export const customerIdParamSchema = z.object({
  customerId: z.string().trim().min(1, "Customer ID is required"),
});

export const listBillingQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(20).optional(),
  search: z.string().trim().max(100).optional(),
  status: invoiceStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
});

export const updatePlusCustomerSchema = z.object({
  isPlusCustomer: z.boolean().optional(),
});

export type CreateOfflineInvoiceInput = z.infer<typeof createOfflineInvoiceSchema>;
export type InvoiceIdParamInput = z.infer<typeof invoiceIdParamSchema>;
export type OrderIdParamInput = z.infer<typeof orderIdParamSchema>;
export type CustomerIdParamInput = z.infer<typeof customerIdParamSchema>;
export type BillingListQueryInput = z.infer<typeof listBillingQuerySchema>;
export type UpdatePlusCustomerInput = z.infer<typeof updatePlusCustomerSchema>;
