import { AppError } from "../errors/AppError";
import mongoose from "mongoose";

import { STORE_STATUS } from "../constants/store";
import { Inventory } from "../models/inventory.model";
import { InventoryLedger } from "../models/inventoryLedger.model";
import { OfflineInvoice } from "../models/offlineInvoice.model";
import { OfflineInvoiceItem } from "../models/offlineInvoiceItem.model";
import { Product } from "../models/product.model";
import { Store } from "../models/store.model";
import { StoreCustomer } from "../models/storeCustomer.model";
import { Order } from "../models/order.model";
import { User } from "../models/user.model";
import type { CreateOfflineInvoiceInput } from "../validators/billing.validator";
import { generateInvoiceNumber } from "../utils/invoice-number.util";

type CreateOfflineInvoiceServiceInput = CreateOfflineInvoiceInput & {
  amountPaid?: number;
};

export interface BillingInvoiceListFilters {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  from?: string;
  to?: string;
}

const roundMoney = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

const getPaymentStatus = (amountPaid: number, grandTotal: number) => {
  if (amountPaid === 0) {
    return "PENDING" as const;
  }

  if (amountPaid >= grandTotal) {
    return "PAID" as const;
  }

  return "PARTIALLY_PAID" as const;
};

export const createOfflineInvoice = async (
  storeOwnerId: string,
  createdBy: string,
  data: CreateOfflineInvoiceServiceInput
) => {
  const session = await mongoose.startSession();

  try {
    let invoiceSummary;

    await session.withTransaction(async () => {
      const store = await Store.findOne({
        ownerId: storeOwnerId,
        status: STORE_STATUS.APPROVED,
      }).session(session);

      if (!store) {
        throw new AppError("Only approved store owners can create invoices", 403);
      }

      const productIds = data.items.map((item) => item.productId);
      if (new Set(productIds).size !== productIds.length) {
        throw new AppError("Duplicate products are not allowed in an invoice", 400);
      }

      const [products, inventories] = await Promise.all([
        Product.find({
          productId: { $in: productIds },
          storeId: store.storeId,
          isActive: true,
        }).session(session),
        Inventory.find({ productId: { $in: productIds } }).session(session),
      ]);

      if (products.length !== productIds.length) {
        throw new AppError("One or more products do not belong to this store", 403);
      }

      const productMap = new Map(products.map((product) => [product.productId, product]));
      const inventoryMap = new Map(
        inventories.map((inventory) => [inventory.productId, inventory])
      );
      const invoiceItems = [] as Array<Record<string, unknown>>;
      const stockUpdates = [] as Array<{
        productId: string;
        quantity: number;
        previousQuantity: number;
      }>;

      let subtotal = 0;
      let discountAmount = 0;
      let totalItems = 0;

      for (const item of data.items) {
        const product = productMap.get(item.productId);
        const inventory = inventoryMap.get(item.productId);

        if (!product || !inventory) {
          throw new AppError(`Inventory not found for product ${item.productId}`, 404);
        }

        if (inventory.availableQuantity < item.quantity) {
          throw new AppError(`Insufficient inventory for ${product.name}`, 400);
        }

        const baseUnitPrice = product.price;
        const productDiscount =
          product.discountPrice > 0 ? Math.max(0, product.price - product.discountPrice) : 0;
        const itemDiscount = item.discount ?? 0;
        const discountPerUnit = Math.min(baseUnitPrice, productDiscount + itemDiscount);
        const lineSubtotal = roundMoney((baseUnitPrice - discountPerUnit) * item.quantity);

        subtotal += roundMoney(baseUnitPrice * item.quantity);
        discountAmount += roundMoney(discountPerUnit * item.quantity);
        totalItems += item.quantity;
        invoiceItems.push({
          productId: product.productId,
          productNameSnapshot: product.name,
          skuSnapshot: product.sku,
          categorySnapshot: product.categoryId,
          priceSnapshot: baseUnitPrice,
          discountSnapshot: discountPerUnit,
          quantity: item.quantity,
          subtotal: lineSubtotal,
        });
        stockUpdates.push({
          productId: product.productId,
          quantity: item.quantity,
          previousQuantity: inventory.availableQuantity,
        });
      }

      subtotal = roundMoney(subtotal);
      discountAmount = roundMoney(discountAmount);
      const grandTotal = roundMoney(subtotal - discountAmount);
      const requestedAmountPaid =
        data.amountPaid ?? (data.paymentMethod === "CREDIT" ? 0 : grandTotal);

      if (
        !Number.isFinite(requestedAmountPaid) ||
        requestedAmountPaid < 0 ||
        requestedAmountPaid > grandTotal
      ) {
        throw new AppError("Amount paid must be between 0 and the invoice total", 400);
      }

      const amountPaid = roundMoney(requestedAmountPaid);
      const remainingAmount = roundMoney(grandTotal - amountPaid);
      const today = new Date();
      const startOfToday = new Date(today);
      startOfToday.setHours(0, 0, 0, 0);
      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
      const todayCount = await OfflineInvoice.countDocuments({
        storeId: store.storeId,
        createdAt: { $gte: startOfToday, $lt: startOfTomorrow },
      }).session(session);
      const invoice = new OfflineInvoice({
        invoiceNumber: generateInvoiceNumber(store.storeId, today, todayCount + 1),
        storeId: store.storeId,
        customerId: data.customerId ?? null,
        walkInCustomerName: data.walkInCustomerName,
        walkInCustomerPhone: data.walkInCustomerPhone,
        paymentMethod: data.paymentMethod,
        paymentStatus: getPaymentStatus(amountPaid, grandTotal),
        subtotal,
        discountAmount,
        grandTotal,
        amountPaid,
        remainingAmount,
        totalItems,
        notes: data.notes,
        status: "COMPLETED",
        createdBy,
      });

      await invoice.save({ session });
      await OfflineInvoiceItem.insertMany(
        invoiceItems.map((item) => ({ ...item, invoiceId: invoice.invoiceId })),
        { session }
      );

      for (const stockUpdate of stockUpdates) {
        const updatedInventory = await Inventory.findOneAndUpdate(
          {
            productId: stockUpdate.productId,
            availableQuantity: { $gte: stockUpdate.quantity },
          },
          {
            $inc: {
              availableQuantity: -stockUpdate.quantity,
              soldQuantity: stockUpdate.quantity,
            },
            $set: { updatedBy: createdBy },
          },
          { new: true, session }
        );

        if (!updatedInventory) {
          throw new AppError("Inventory changed; please retry the invoice", 409);
        }

        await InventoryLedger.create(
          [
            {
              storeId: store.storeId,
              productId: stockUpdate.productId,
              movementType: "SALE_OFFLINE",
              referenceType: "OFFLINE_INVOICE",
              referenceId: invoice.invoiceId,
              quantityChange: -stockUpdate.quantity,
              previousQuantity: stockUpdate.previousQuantity,
              newQuantity: updatedInventory.availableQuantity,
              performedBy: createdBy,
            },
          ],
          { session }
        );
      }

      invoiceSummary = {
        invoiceId: invoice.invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        storeId: invoice.storeId,
        customerId: invoice.customerId,
        paymentMethod: invoice.paymentMethod,
        paymentStatus: invoice.paymentStatus,
        subtotal: invoice.subtotal,
        discountAmount: invoice.discountAmount,
        grandTotal: invoice.grandTotal,
        amountPaid: invoice.amountPaid,
        remainingAmount: invoice.remainingAmount,
        totalItems: invoice.totalItems,
        status: invoice.status,
        createdAt: invoice.createdAt,
      };
    });

    return invoiceSummary;
  } finally {
    await session.endSession();
  }
};

const getStoreForOwner = async (ownerId: string) => {
  const store = await Store.findOne({
    ownerId,
    status: STORE_STATUS.APPROVED,
  })
    .select("storeId")
    .lean();

  if (!store) {
    throw new AppError("Only approved store owners can access invoices", 403);
  }

  return store;
};

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseDateBoundary = (value: string, endOfDay: boolean): Date => {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00"}`)
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(`Invalid ${endOfDay ? "to" : "from"} date`, 400);
  }

  return date;
};

const buildInvoiceListQuery = (storeId: string, filters: BillingInvoiceListFilters) => {
  const query: Record<string, unknown> = { storeId };

  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }
  if (filters.paymentMethod) {
    query.paymentMethod = filters.paymentMethod;
  }
  if (filters.search) {
    const search = new RegExp(escapeRegex(filters.search), "i");
    query.$or = [
      { invoiceNumber: search },
      { walkInCustomerName: search },
      { walkInCustomerPhone: search },
    ];
  }
  if (filters.from || filters.to) {
    query.createdAt = {
      ...(filters.from ? { $gte: parseDateBoundary(filters.from, false) } : {}),
      ...(filters.to ? { $lte: parseDateBoundary(filters.to, true) } : {}),
    };
  }

  return query;
};

const getCustomerDisplayName = (invoice: {
  customerId?: string | null;
  walkInCustomerName?: string;
}): string =>
  invoice.walkInCustomerName || (invoice.customerId ? "Registered Customer" : "Walk-in Customer");

export const listInvoices = async (ownerId: string, filters: BillingInvoiceListFilters) => {
  const store = await getStoreForOwner(ownerId);
  const query = buildInvoiceListQuery(store.storeId, filters);
  const skip = (filters.page - 1) * filters.limit;

  const [invoices, total] = await Promise.all([
    OfflineInvoice.find(query)
      .select(
        "invoiceId invoiceNumber customerId walkInCustomerName paymentMethod paymentStatus grandTotal amountPaid remainingAmount totalItems status createdAt"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(filters.limit)
      .lean(),
    OfflineInvoice.countDocuments(query),
  ]);

  const customerIds = invoices
    .map((invoice) => invoice.customerId)
    .filter((customerId): customerId is string => Boolean(customerId));
  const customers = await User.find({ userId: { $in: customerIds } })
    .select("userId name")
    .lean();
  const customerMap = new Map(customers.map((customer) => [customer.userId, customer.name]));

  return {
    invoices: invoices.map((invoice) => ({
      invoiceId: invoice.invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      customerDisplayName:
        (invoice.customerId && customerMap.get(invoice.customerId)) ||
        getCustomerDisplayName(invoice),
      paymentMethod: invoice.paymentMethod,
      paymentStatus: invoice.paymentStatus,
      grandTotal: invoice.grandTotal,
      amountPaid: invoice.amountPaid,
      remainingAmount: invoice.remainingAmount,
      totalItems: invoice.totalItems,
      status: invoice.status,
      createdAt: invoice.createdAt,
    })),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
};

export const getInvoiceById = async (ownerId: string, invoiceId: string) => {
  const store = await getStoreForOwner(ownerId);
  const invoice = await OfflineInvoice.findOne({ invoiceId, storeId: store.storeId }).lean();

  if (!invoice) {
    throw new AppError("Invoice not found", 404);
  }

  const [items, customer] = await Promise.all([
    OfflineInvoiceItem.find({ invoiceId })
      .select(
        "invoiceItemId productId productNameSnapshot skuSnapshot categorySnapshot priceSnapshot discountSnapshot quantity subtotal"
      )
      .sort({ createdAt: 1 })
      .lean(),
    invoice.customerId
      ? User.findOne({ userId: invoice.customerId }).select("userId name email mobile").lean()
      : Promise.resolve(null),
  ]);

  return {
    invoice: {
      invoiceId: invoice.invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      storeId: invoice.storeId,
      customerId: invoice.customerId,
      paymentMethod: invoice.paymentMethod,
      paymentStatus: invoice.paymentStatus,
      subtotal: invoice.subtotal,
      discountAmount: invoice.discountAmount,
      grandTotal: invoice.grandTotal,
      amountPaid: invoice.amountPaid,
      remainingAmount: invoice.remainingAmount,
      totalItems: invoice.totalItems,
      status: invoice.status,
      notes: invoice.notes,
      createdAt: invoice.createdAt,
    },
    items,
    customer,
    walkIn: invoice.customerId
      ? null
      : {
          name: invoice.walkInCustomerName,
          phone: invoice.walkInCustomerPhone,
        },
    paymentSummary: {
      paymentMethod: invoice.paymentMethod,
      paymentStatus: invoice.paymentStatus,
      grandTotal: invoice.grandTotal,
      amountPaid: invoice.amountPaid,
      remainingAmount: invoice.remainingAmount,
    },
  };
};

export const cancelInvoice = async (): Promise<never> => {
  throw new AppError("TODO: cancelInvoice is not implemented yet", 501);
};

export const listPickupOrders = async (): Promise<never> => {
  throw new AppError("TODO: listPickupOrders is not implemented yet", 501);
};

export const completePickupPayment = async (
  ownerId: string,
  orderId: string,
  paymentMethod: "CASH" | "UPI" | "CREDIT"
) => {
  const store = await getStoreForOwner(ownerId);
  const order = await Order.findOne({ orderId }).lean();
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  const customer = await StoreCustomer.findOne({
    storeId: store.storeId,
    customerId: order.userId,
  }).lean();

  if (!customer || customer.customerId !== order.userId) {
    throw new AppError("Order does not belong to this store", 403);
  }

  if (order.status !== "READY_FOR_PICKUP") {
    throw new AppError("Only orders ready for pickup can be paid", 409);
  }

  if (order.paymentStatus !== "PENDING") {
    throw new AppError("Only pending orders can be paid", 409);
  }

  if (!customer.isPlusCustomer) {
    throw new AppError("Only PLUS customers can pay at pickup", 403);
  }

  const updatedOrder = await Order.findOneAndUpdate(
    {
      orderId,
      userId: order.userId,
      status: "READY_FOR_PICKUP",
      paymentStatus: "PENDING",
    },
    {
      $set: {
        paymentStatus: "PAID",
        paymentMethod,
        status: "PICKED_UP",
        ...(Order.schema.path("pickedUpAt") ? { pickedUpAt: new Date() } : {}),
      },
    },
    { new: true, runValidators: false }
  );

  if (!updatedOrder) {
    throw new AppError("Order changed before payment could be collected", 409);
  }

  return updatedOrder;
};

export const listStoreCustomers = async (): Promise<never> => {
  throw new AppError("TODO: listStoreCustomers is not implemented yet", 501);
};

export const updatePlusCustomer = async (): Promise<never> => {
  throw new AppError("TODO: updatePlusCustomer is not implemented yet", 501);
};
