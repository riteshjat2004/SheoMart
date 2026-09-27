import { type Response } from "express";

import { AppError } from "../errors/AppError";
import { USER_ROLES } from "../constants/roles";
import { AuthRequest } from "../middleware/auth.middleware";
import { PAYMENT_METHOD } from "../types/billing";
import type {
  BillingInvoiceListFilters,
  BillingOrderListFilters,
} from "../services/billing.service";
import {
  cancelInvoice as cancelInvoiceService,
  completePickupPayment as completePickupPaymentService,
  createOfflineInvoice as createOfflineInvoiceService,
  getInvoiceById as getInvoiceByIdService,
  getPosCatalog as getPosCatalogService,
  getStoreCustomer as getStoreCustomerService,
  getStoreCustomerForUser as getStoreCustomerForUserService,
  getStoreCustomerOrders as getStoreCustomerOrdersService,
  getStoreCustomersAnalytics as getStoreCustomersAnalyticsService,
  getStoreCustomersSummary as getStoreCustomersSummaryService,
  listInvoices as listInvoicesService,
  listPickupOrders as listPickupOrdersService,
  listStoreCustomers as listStoreCustomersService,
  updatePlusCustomer as updatePlusCustomerService,
  updateStoreCustomerNotes as updateStoreCustomerNotesService,
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
  const parsed = listBillingQuerySchema.parse(req.query);
  const filters: BillingOrderListFilters = {
    page: parsed.page ?? 1,
    limit: parsed.limit ?? 20,
    search: parsed.search,
    paymentStatus: parsed.paymentStatus,
    orderStatus: getQueryString(req.query.orderStatus) ?? parsed.status,
    from: getQueryString(req.query.from),
    to: getQueryString(req.query.to),
  };
  const result = await listPickupOrdersService(req.user!.userId, filters);
  res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    data: result,
  });
};

export const completePickupPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
  const result = orderIdParamSchema.safeParse({ orderId });

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid order ID";
    throw new AppError(message, 400);
  }

  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<
    string,
    unknown
  >;
  const paymentMethod = payload.paymentMethod;
  if (paymentMethod !== "CASH" && paymentMethod !== "UPI" && paymentMethod !== "CREDIT") {
    throw new AppError("Payment method must be CASH, UPI, or CREDIT", 400);
  }

  const order = await completePickupPaymentService(
    req.user?.userId as string,
    result.data.orderId,
    paymentMethod
  );
  res.status(200).json({
    success: true,
    message: "Pickup payment collected successfully",
    data: { order },
  });
};

export const listStoreCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  const isPlusCustomer = getQueryString(req.query.isPlusCustomer);
  const isVerified = getQueryString(req.query.isVerified);
  const search = getQueryString(req.query.search);
  const type = getQueryString(req.query.type) as any;
  const sortBy = getQueryString(req.query.sortBy) as any;
  const spendingMin = req.query.spendingMin ? Number(req.query.spendingMin) : undefined;
  const spendingMax = req.query.spendingMax ? Number(req.query.spendingMax) : undefined;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const result = await listStoreCustomersService(req.user?.userId as string, {
    page,
    limit,
    search,
    isPlusCustomer: isPlusCustomer === undefined ? undefined : isPlusCustomer === "true",
    isVerified: isVerified === undefined ? undefined : isVerified === "true",
    type,
    sortBy,
    spendingMin,
    spendingMax,
  });
  res.status(200).json({ success: true, message: "Store customers fetched successfully", data: result });
};

export const getStoreCustomersSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  const result = await getStoreCustomersSummaryService(req.user?.userId as string);
  res.status(200).json({ success: true, message: "Customer summary fetched successfully", data: result });
};

export const getStoreCustomersAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  const result = await getStoreCustomersAnalyticsService(req.user?.userId as string);
  res.status(200).json({ success: true, message: "Customer analytics fetched successfully", data: result });
};

export const updateStoreCustomerNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  const customerId = Array.isArray(req.params.customerId)
    ? req.params.customerId[0]
    : req.params.customerId;
  const paramsResult = customerIdParamSchema.safeParse({ customerId });
  if (!paramsResult.success) {
    throw new AppError(paramsResult.error.issues[0]?.message || "Invalid customer ID", 400);
  }

  const notes = typeof req.body?.notes === "string" ? req.body.notes : "";
  const result = await updateStoreCustomerNotesService(
    req.user?.userId as string,
    paramsResult.data.customerId,
    notes
  );
  res.status(200).json({ success: true, message: "Customer note updated successfully", data: result });
};

export const getStoreCustomerOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const customerId = Array.isArray(req.params.customerId)
    ? req.params.customerId[0]
    : req.params.customerId;
  const paramsResult = customerIdParamSchema.safeParse({ customerId });
  if (!paramsResult.success) {
    throw new AppError(paramsResult.error.issues[0]?.message || "Invalid customer ID", 400);
  }

  const result = await getStoreCustomerOrdersService(
    req.user?.userId as string,
    paramsResult.data.customerId,
    {
      page: req.query.page as string,
      limit: req.query.limit as string,
      orderStatus: getQueryString(req.query.orderStatus),
      paymentStatus: getQueryString(req.query.paymentStatus),
      sortBy: getQueryString(req.query.sortBy),
    }
  );
  res.status(200).json({ success: true, message: "Customer orders fetched successfully", data: result });
};

export const getStoreCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  const customerId = Array.isArray(req.params.customerId)
    ? req.params.customerId[0]
    : req.params.customerId;
  const paramsResult = customerIdParamSchema.safeParse({ customerId });
  if (!paramsResult.success) {
    throw new AppError(paramsResult.error.issues[0]?.message || "Invalid customer ID", 400);
  }

  const storeId = getQueryString(req.query.storeId);
  if (req.user?.role === USER_ROLES.CUSTOMER) {
    if (!storeId) {
      throw new AppError("Store ID is required", 400);
    }
    if (paramsResult.data.customerId !== req.user.userId) {
      throw new AppError("Access denied", 403);
    }
  }

  const result = req.user?.role === USER_ROLES.CUSTOMER
    ? await getStoreCustomerForUserService(req.user.userId, storeId as string)
    : await getStoreCustomerService(
        req.user?.userId as string,
        paramsResult.data.customerId,
        storeId
      );
  res.status(200).json({ success: true, message: "Store customer fetched successfully", data: result });
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

  if (bodyResult.data.isPlusCustomer === undefined) {
    throw new AppError("isPlusCustomer is required", 400);
  }

  const customer = await updatePlusCustomerService(
    req.user?.userId as string,
    paramsResult.data.customerId,
    bodyResult.data.isPlusCustomer
  );
  res.status(200).json({
    success: true,
    message: "PLUS membership updated successfully",
    data: { customer },
  });
};

export const getPosCatalog = async (req: AuthRequest, res: Response): Promise<void> => {
  const storeOwnerId = req.user?.userId;
  if (!storeOwnerId) {
    throw new AppError("Unauthorized", 401);
  }

  const catalog = await getPosCatalogService(storeOwnerId);
  res.status(200).json({
    success: true,
    message: "POS catalog fetched successfully",
    data: catalog,
  });
};

