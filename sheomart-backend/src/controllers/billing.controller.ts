import { type Response } from "express";

import { AppError } from "../errors/AppError";
import { AuthRequest } from "../middleware/auth.middleware";
import { PAYMENT_METHOD } from "../types/billing";
import type { BillingInvoiceListFilters } from "../services/billing.service";
import {
  cancelInvoice as cancelInvoiceService,
  completePickupPayment as completePickupPaymentService,
  createOfflineInvoice as createOfflineInvoiceService,
  getInvoiceById as getInvoiceByIdService,
  listInvoices as listInvoicesService,
  listPickupOrders as listPickupOrdersService,
  listStoreCustomers as listStoreCustomersService,
  updatePlusCustomer as updatePlusCustomerService,
} from "../services/billing.service";
import {
  createOfflineInvoiceSchema,
  customerIdParamSchema,
  invoiceIdParamSchema,
  listBillingQuerySchema,
  orderIdParamSchema,
  updatePlusCustomerSchema,
} from "../validators/billing.validator";

const getQueryString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return undefined;
};

export const createOfflineInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<
    string,
    unknown
  >;
  const result = createOfflineInvoiceSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid invoice payload";
    throw new AppError(message, 400);
  }

  const amountPaid = payload.amountPaid;
  if (
    amountPaid !== undefined &&
    (typeof amountPaid !== "number" || !Number.isFinite(amountPaid) || amountPaid < 0)
  ) {
    throw new AppError("Amount paid must be a non-negative number", 400);
  }

  const invoice = await createOfflineInvoiceService(
    req.user?.userId as string,
    req.user?.userId as string,
    { ...result.data, amountPaid }
  );

  res.status(201).json({
    success: true,
    message: "Offline invoice created successfully",
    data: { invoice },
  });
};

export const listInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  const filters = listBillingQuerySchema.parse(req.query);
  const paymentMethod = getQueryString(req.query.paymentMethod);

  if (paymentMethod && !Object.values(PAYMENT_METHOD).includes(paymentMethod as never)) {
    throw new AppError("Invalid payment method", 400);
  }

  const listFilters: BillingInvoiceListFilters = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    search: filters.search,
    status: filters.status,
    paymentStatus: filters.paymentStatus,
    paymentMethod,
    from: getQueryString(req.query.from),
    to: getQueryString(req.query.to),
  };

  const result = await listInvoicesService(req.user?.userId as string, listFilters);
  res.status(200).json({
    success: true,
    message: "Invoices fetched successfully",
    data: result,
  });
};

export const getInvoiceById = async (req: AuthRequest, res: Response): Promise<void> => {
  const invoiceId = Array.isArray(req.params.invoiceId)
    ? req.params.invoiceId[0]
    : req.params.invoiceId;
  const result = invoiceIdParamSchema.safeParse({ invoiceId });

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid invoice ID";
    throw new AppError(message, 400);
  }

  const invoice = await getInvoiceByIdService(req.user?.userId as string, result.data.invoiceId);
  res.status(200).json({
    success: true,
    message: "Invoice fetched successfully",
    data: invoice,
  });
};

export const cancelInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  const invoiceId = Array.isArray(req.params.invoiceId)
    ? req.params.invoiceId[0]
    : req.params.invoiceId;
  const result = invoiceIdParamSchema.safeParse({ invoiceId });

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid invoice ID";
    throw new AppError(message, 400);
  }

  void result.data;
  await cancelInvoiceService();
  res.status(501).json({
    success: false,
    message: "Billing service is not implemented yet.",
  });
};

export const listPickupOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const filters = listBillingQuerySchema.parse(req.query);

  void filters;
  await listPickupOrdersService();
  res.status(501).json({
    success: false,
    message: "Billing service is not implemented yet.",
  });
};

export const completePickupPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
  const result = orderIdParamSchema.safeParse({ orderId });

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid order ID";
    throw new AppError(message, 400);
  }

  void result.data;
  await completePickupPaymentService();
  res.status(501).json({
    success: false,
    message: "Billing service is not implemented yet.",
  });
};

export const listStoreCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  const filters = listBillingQuerySchema.parse(req.query);

  void filters;
  await listStoreCustomersService();
  res.status(501).json({
    success: false,
    message: "Billing service is not implemented yet.",
  });
};

export const updatePlusCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  const customerId = Array.isArray(req.params.customerId)
    ? req.params.customerId[0]
    : req.params.customerId;
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<
    string,
    unknown
  >;
  const paramsResult = customerIdParamSchema.safeParse({ customerId });

  if (!paramsResult.success) {
    const message = paramsResult.error.issues[0]?.message || "Invalid customer ID";
    throw new AppError(message, 400);
  }

  const bodyResult = updatePlusCustomerSchema.safeParse(payload);

  if (!bodyResult.success) {
    const message = bodyResult.error.issues[0]?.message || "Invalid plus-customer payload";
    throw new AppError(message, 400);
  }

  void paramsResult.data;
  void bodyResult.data;
  await updatePlusCustomerService();
  res.status(501).json({
    success: false,
    message: "Billing service is not implemented yet.",
  });
};
