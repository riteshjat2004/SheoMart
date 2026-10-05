import { AppError } from "../errors/AppError";
import mongoose from "mongoose";

import { STORE_STATUS } from "../constants/store";
import { Category } from "../models/category.model";
import { Inventory, INVENTORY_STATUS } from "../models/inventory.model";
import { InventoryLedger } from "../models/inventoryLedger.model";
import { OfflineInvoice } from "../models/offlineInvoice.model";
import { OfflineInvoiceItem } from "../models/offlineInvoiceItem.model";
import { Product } from "../models/product.model";
import { Store } from "../models/store.model";
import { StoreCustomer } from "../models/storeCustomer.model";
import { Order, ORDER_STATUS } from "../models/order.model";
import { User } from "../models/user.model";
import type {
  ConfirmInvoicePaymentInput,
  CreateOfflineInvoiceInput,
} from "../validators/billing.validator";
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
  orderStatus?: string;
}

export interface BillingOrderListFilters {
  page: number;
  limit: number;
  search?: string;
  orderStatus?: string;
  paymentStatus?: string;
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

      const itemKeys = data.items.map((item) => `${item.productId}_${item.variantId || ""}`);
      if (new Set(itemKeys).size !== itemKeys.length) {
        throw new AppError("Duplicate product items are not allowed in an invoice", 400);
      }

      const productIds = Array.from(new Set(data.items.map((item) => item.productId)));

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
      const stockDeductions = new Map<string, number>();

      let subtotal = 0;
      let discountAmount = 0;
      let totalItems = 0;

      for (const item of data.items) {
        const product = productMap.get(item.productId);
        const inventory = inventoryMap.get(item.productId);

        if (!product || !inventory) {
          throw new AppError(`Inventory not found for product ${item.productId}`, 404);
        }

        const currentRequested = (stockDeductions.get(item.productId) ?? 0) + item.quantity;
        if (inventory.availableQuantity < currentRequested) {
          throw new AppError(`Insufficient inventory for ${product.name}`, 400);
        }
        stockDeductions.set(item.productId, currentRequested);

        let baseUnitPrice = product.price;
        let productDiscount =
          product.discountPrice > 0 ? Math.max(0, product.price - product.discountPrice) : 0;
        let variantLabel = item.variantLabel || "";
        let variantSku = product.sku;

        if (item.variantId && product.variants?.length) {
          const v = product.variants.find((variant) => variant.variantId === item.variantId);
          if (v) {
            baseUnitPrice = v.price;
            productDiscount =
              v.discountPrice && v.discountPrice > 0 ? Math.max(0, v.price - v.discountPrice) : 0;
            variantLabel = v.label;
            if (v.sku) variantSku = v.sku;

            if (product.stockTrackingMode === "SEPARATE" && typeof v.stock === "number" && v.stock < item.quantity) {
              throw new AppError(`Insufficient stock for ${product.name} (${v.label}). Available: ${v.stock}`, 400);
            }
          }
        }

        const itemDiscount = item.discount ?? 0;
        const discountPerUnit = Math.min(baseUnitPrice, productDiscount + itemDiscount);
        const lineSubtotal = roundMoney((baseUnitPrice - discountPerUnit) * item.quantity);

        subtotal += roundMoney(baseUnitPrice * item.quantity);
        discountAmount += roundMoney(discountPerUnit * item.quantity);
        totalItems += item.quantity;
        invoiceItems.push({
          productId: product.productId,
          variantId: item.variantId || "",
          variantLabel,
          productNameSnapshot: variantLabel ? `${product.name} (${variantLabel})` : product.name,
          skuSnapshot: variantSku || product.sku,
          categorySnapshot: product.categoryId,
          priceSnapshot: baseUnitPrice,
          discountSnapshot: discountPerUnit,
          quantity: item.quantity,
          subtotal: lineSubtotal,
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

      for (const [productId, deductQuantity] of stockDeductions.entries()) {
        const currentInv = inventoryMap.get(productId);
        const prevQty = currentInv?.availableQuantity ?? 0;
        const updatedInventory = await Inventory.findOneAndUpdate(
          {
            productId,
            availableQuantity: { $gte: deductQuantity },
          },
          {
            $inc: {
              availableQuantity: -deductQuantity,
              soldQuantity: deductQuantity,
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
              productId,
              movementType: "SALE_OFFLINE",
              referenceType: "OFFLINE_INVOICE",
              referenceId: invoice.invoiceId,
              quantityChange: -deductQuantity,
              previousQuantity: prevQty,
              newQuantity: updatedInventory.availableQuantity,
              performedBy: createdBy,
            },
          ],
          { session }
        );

        // Synchronize Product model quantity and variant stocks
        const product = productMap.get(productId);
        if (product) {
          const productItemsForThisProduct = data.items.filter((it) => it.productId === productId);

          if (product.stockTrackingMode === "SEPARATE" && product.variants?.length) {
            for (const it of productItemsForThisProduct) {
              if (it.variantId) {
                await Product.findOneAndUpdate(
                  {
                    productId,
                    storeId: store.storeId,
                    "variants.variantId": it.variantId,
                  },
                  {
                    $inc: { "variants.$.stock": -it.quantity },
                  },
                  { session }
                );
              }
            }
          }

          await Product.findOneAndUpdate(
            { productId, storeId: store.storeId },
            { $set: { quantity: updatedInventory.availableQuantity, updatedBy: createdBy } },
            { session }
          );
        }
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

export const confirmInvoicePayment = async (
  ownerId: string,
  invoiceId: string,
  input: ConfirmInvoicePaymentInput
) => {
  const store = await getStoreForOwner(ownerId);
  const invoice = await OfflineInvoice.findOne({
    invoiceId,
    storeId: store.storeId,
  });

  if (!invoice) {
    throw new AppError("Invoice not found", 404);
  }

  if (invoice.status === "CANCELLED") {
    throw new AppError("Cannot collect payment for a cancelled invoice", 400);
  }

  if (invoice.paymentStatus === "PAID" && invoice.remainingAmount <= 0) {
    throw new AppError("This invoice has already been fully paid", 400);
  }

  const payAmount = input.amount !== undefined ? input.amount : invoice.remainingAmount;

  if (payAmount <= 0) {
    throw new AppError("Payment amount must be greater than 0", 400);
  }

  if (payAmount > invoice.remainingAmount) {
    throw new AppError(
      `Payment amount cannot exceed remaining balance of ₹${invoice.remainingAmount}`,
      400
    );
  }

  invoice.amountPaid = Number((invoice.amountPaid + payAmount).toFixed(2));
  invoice.remainingAmount = Number(Math.max(0, invoice.grandTotal - invoice.amountPaid).toFixed(2));
  invoice.paymentStatus = invoice.remainingAmount === 0 ? "PAID" : "PARTIALLY_PAID";

  if (input.paymentMethod) {
    invoice.paymentMethod = input.paymentMethod;
  }
  if (input.notes) {
    invoice.notes = invoice.notes ? `${invoice.notes}; ${input.notes}` : input.notes;
  }

  await invoice.save();

  return {
    invoiceId: invoice.invoiceId,
    invoiceNumber: invoice.invoiceNumber,
    paymentMethod: invoice.paymentMethod,
    paymentStatus: invoice.paymentStatus,
    grandTotal: invoice.grandTotal,
    amountPaid: invoice.amountPaid,
    remainingAmount: invoice.remainingAmount,
    updatedAt: invoice.updatedAt,
  };
};

export const listPickupOrders = async (ownerId: string, filters: BillingOrderListFilters) => {
  const store = await getStoreForOwner(ownerId);
  const query: Record<string, unknown> = {
    storeId: store.storeId,
    status: { $ne: "DRAFT" },
  };

  if (filters.orderStatus) {
    query.pickupStatus = filters.orderStatus;
  }
  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }
  if (filters.from || filters.to) {
    query.createdAt = {
      ...(filters.from ? { $gte: parseDateBoundary(filters.from, false) } : {}),
      ...(filters.to ? { $lte: parseDateBoundary(filters.to, true) } : {}),
    };
  }

  if (filters.search) {
    const search = new RegExp(escapeRegex(filters.search), "i");
    const customers = await User.find({
      $or: [{ name: search }, { mobile: search }, { email: search }],
    })
      .select("userId")
      .lean();
    query.$or = [
      { orderId: search },
      { userId: { $in: customers.map((customer) => customer.userId) } },
    ];
  }

  const skip = (filters.page - 1) * filters.limit;
  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(filters.limit).lean(),
    Order.countDocuments(query),
  ]);

  const customerIds = [...new Set(orders.map((order) => order.userId))];
  const customers = await User.find({ userId: { $in: customerIds } })
    .select("userId name mobile email")
    .lean();
  const customerMap = new Map(customers.map((customer) => [customer.userId, customer]));

  return {
    orders: orders.map((order) => ({
      ...order,
      orderStatus: order.pickupStatus,
      customer: customerMap.get(order.userId) ?? null,
    })),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
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

export interface StoreCustomerQueryFilters {
  page?: number | string;
  limit?: number | string;
  search?: string;
  isPlusCustomer?: boolean;
  isVerified?: boolean;
  type?: "all" | "new" | "repeat" | "vip" | "frequent";
  sortBy?: "highest_spend" | "most_orders" | "recent_purchase" | "alphabetical";
  spendingMin?: number;
  spendingMax?: number;
}

export const listStoreCustomers = async (
  ownerId: string,
  filters: StoreCustomerQueryFilters
) => {
  const store = await getStoreForOwner(ownerId);
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(filters.limit) || 20));

  // 1. Aggregate Order metrics for this store
  const orderAgg = await Order.aggregate([
    {
      $match: {
        storeId: store.storeId,
        status: { $ne: ORDER_STATUS.DRAFT },
      },
    },
    {
      $group: {
        _id: "$userId",
        totalOrders: { $sum: 1 },
        completedOrders: {
          $sum: {
            $cond: [{ $in: ["$status", ["DELIVERED", "PICKED_UP"]] }, 1, 0],
          },
        },
        cancelledOrders: {
          $sum: {
            $cond: [{ $in: ["$status", ["CANCELLED", "FAILED"]] }, 1, 0],
          },
        },
        pendingOrders: {
          $sum: {
            $cond: [
              {
                $in: [
                  "$status",
                  [
                    "ORDER_PLACED",
                    "CONFIRMED",
                    "PROCESSING",
                    "PACKED",
                    "OUT_FOR_DELIVERY",
                    "READY_FOR_PICKUP",
                    "PENDING_PAYMENT",
                  ],
                ],
              },
              1,
              0,
            ],
          },
        },
        totalOnlinePurchases: {
          $sum: {
            $cond: [{ $in: ["$status", ["CANCELLED", "FAILED"]] }, 0, "$grandTotal"],
          },
        },
        lastPurchaseAt: { $max: "$createdAt" },
        firstPurchaseAt: { $min: "$createdAt" },
      },
    },
  ]);

  // 2. Fetch StoreCustomer records for this store
  const storeCustomers = await StoreCustomer.find({ storeId: store.storeId }).lean();

  // 3. Collect all unique customer IDs
  const allCustomerIds = new Set<string>();
  orderAgg.forEach((item) => {
    if (item._id) allCustomerIds.add(String(item._id));
  });
  storeCustomers.forEach((sc) => {
    if (sc.customerId) allCustomerIds.add(String(sc.customerId));
  });

  const customerIdList = Array.from(allCustomerIds);

  // 4. Fetch Users
  const users = await User.find({ userId: { $in: customerIdList } })
    .select("userId name email mobile avatar isEmailVerified isPhoneVerified status createdAt")
    .lean();

  const userMap = new Map(users.map((u) => [u.userId, u]));
  const orderMap = new Map(orderAgg.map((o) => [String(o._id), o]));
  const scMap = new Map(storeCustomers.map((sc) => [String(sc.customerId), sc]));

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 5. Construct enriched customer objects
  const allEnrichedCustomers = customerIdList.map((customerId) => {
    const user = userMap.get(customerId);
    const orderData = (orderMap.get(customerId) || {}) as Record<string, any>;
    const scData = (scMap.get(customerId) || {}) as Record<string, any>;

    const totalOrders = Number(orderData.totalOrders) || 0;
    const completedOrders = Number(orderData.completedOrders) || 0;
    const cancelledOrders = Number(orderData.cancelledOrders) || 0;
    const pendingOrders = Number(orderData.pendingOrders) || 0;
    const totalOnlinePurchases = Number(orderData.totalOnlinePurchases) || 0;
    const totalOfflinePurchases = Number(scData.totalOfflinePurchases) || 0;
    const totalSpend = totalOnlinePurchases + totalOfflinePurchases;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalSpend / totalOrders) : 0;
    const lastPurchaseAt = orderData.lastPurchaseAt || scData.lastPurchaseAt || null;
    const firstPurchaseAt = orderData.firstPurchaseAt || scData.joinedAt || user?.createdAt || null;
    const emailVerified = Boolean(user?.emailVerified);
    const phoneVerified = Boolean(user?.phoneVerified);
    const isVerifiedCustomer = Boolean(user?.isVerifiedCustomer);
    const isVerified = isVerifiedCustomer || emailVerified || phoneVerified;
    const isPlusCustomer = Boolean(scData.isPlusCustomer);
    const notes = String(scData.notes || "");

    const isVip = totalOrders >= 5 || totalSpend >= 5000;
    const isFrequent = totalOrders >= 3;
    const isRepeat = totalOrders > 1;
    const isNew = totalOrders <= 1;

    let statusBadge: "VIP" | "Frequent Buyer" | "Repeat Customer" | "New Customer" | "Inactive" = "New Customer";
    if (isVip) statusBadge = "VIP";
    else if (isFrequent) statusBadge = "Frequent Buyer";
    else if (isRepeat) statusBadge = "Repeat Customer";
    else if (lastPurchaseAt && new Date(lastPurchaseAt) < thirtyDaysAgo && totalOrders > 0) statusBadge = "Inactive";
    else statusBadge = "New Customer";

    const userStatus = user?.isSuspended ? "suspended" : user?.isActive === false ? "inactive" : "active";

    return {
      customerId,
      storeCustomerId: scData.storeCustomerId,
      name: user?.name || "Customer",
      email: user?.email || "",
      mobile: user?.mobile || "",
      avatar: user?.avatar || null,
      isEmailVerified: emailVerified,
      isPhoneVerified: phoneVerified,
      isVerified,
      customerSince: user?.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
      isPlusCustomer,
      notes,
      totalOrders,
      completedOrders,
      cancelledOrders,
      pendingOrders,
      totalOnlinePurchases,
      totalOfflinePurchases,
      totalSpend,
      averageOrderValue,
      lastPurchaseAt: lastPurchaseAt ? new Date(lastPurchaseAt).toISOString() : null,
      firstPurchaseAt: firstPurchaseAt ? new Date(firstPurchaseAt).toISOString() : null,
      isVip,
      isRepeat,
      isNew,
      isFrequent,
      statusBadge,
      status: userStatus,
    };
  });

  // Calculate live summary counts on all customers
  const summary = {
    totalCustomers: allEnrichedCustomers.length,
    activeCustomers: allEnrichedCustomers.filter(
      (c) => c.lastPurchaseAt && new Date(c.lastPurchaseAt) >= thirtyDaysAgo
    ).length,
    newCustomersThisMonth: allEnrichedCustomers.filter(
      (c) => c.firstPurchaseAt && new Date(c.firstPurchaseAt) >= startOfCurrentMonth
    ).length,
    repeatCustomers: allEnrichedCustomers.filter((c) => c.isRepeat).length,
    verifiedCustomers: allEnrichedCustomers.filter((c) => c.isVerified).length,
    vipCustomers: allEnrichedCustomers.filter((c) => c.isVip).length,
  };

  // Filter
  let filtered = allEnrichedCustomers;

  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        c.customerId.toLowerCase().includes(q)
    );
  }

  if (filters.isPlusCustomer !== undefined) {
    filtered = filtered.filter((c) => c.isPlusCustomer === filters.isPlusCustomer);
  }

  if (filters.isVerified !== undefined) {
    filtered = filtered.filter((c) => c.isVerified === filters.isVerified);
  }

  if (filters.type && filters.type !== "all") {
    if (filters.type === "vip") filtered = filtered.filter((c) => c.isVip);
    else if (filters.type === "repeat") filtered = filtered.filter((c) => c.isRepeat);
    else if (filters.type === "new") filtered = filtered.filter((c) => c.isNew);
    else if (filters.type === "frequent") filtered = filtered.filter((c) => c.isFrequent);
  }

  if (filters.spendingMin !== undefined) {
    filtered = filtered.filter((c) => c.totalSpend >= (filters.spendingMin || 0));
  }

  if (filters.spendingMax !== undefined) {
    filtered = filtered.filter((c) => c.totalSpend <= (filters.spendingMax || Infinity));
  }

  // Sort
  const sortBy = filters.sortBy || "recent_purchase";
  filtered.sort((a, b) => {
    if (sortBy === "highest_spend") {
      return b.totalSpend - a.totalSpend;
    }
    if (sortBy === "most_orders") {
      return b.totalOrders - a.totalOrders;
    }
    if (sortBy === "alphabetical") {
      return a.name.localeCompare(b.name);
    }
    // Default: recent_purchase
    const timeA = a.lastPurchaseAt ? new Date(a.lastPurchaseAt).getTime() : 0;
    const timeB = b.lastPurchaseAt ? new Date(b.lastPurchaseAt).getTime() : 0;
    return timeB - timeA;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return {
    customers: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    summary,
  };
};

export const getStoreCustomersSummary = async (ownerId: string) => {
  const result = await listStoreCustomers(ownerId, { page: 1, limit: 1 });
  return result.summary;
};

export const getStoreCustomersAnalytics = async (ownerId: string) => {
  const store = await getStoreForOwner(ownerId);
  const listResult = await listStoreCustomers(ownerId, { page: 1, limit: 1000, sortBy: "highest_spend" });
  const customers = listResult.customers;

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpend, 0);
  const averageCustomerSpend = customers.length > 0 ? Math.round(totalRevenue / customers.length) : 0;
  const repeatCount = customers.filter((c) => c.isRepeat).length;
  const newCount = customers.filter((c) => c.isNew).length;
  const repeatPurchaseRate = customers.length > 0 ? Math.round((repeatCount / customers.length) * 100) : 0;

  // Monthly Spending Trend (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyAgg = await Order.aggregate([
    {
      $match: {
        storeId: store.storeId,
        createdAt: { $gte: sixMonthsAgo },
        status: { $nin: ["CANCELLED", "FAILED", ORDER_STATUS.DRAFT] },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$grandTotal" },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const spendingTrend = monthlyAgg.map((m) => ({
    month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
    revenue: m.revenue,
    orders: m.orderCount,
  }));

  // Top 10 Customers
  const top10Customers = customers.slice(0, 10).map((c) => ({
    customerId: c.customerId,
    name: c.name,
    email: c.email,
    mobile: c.mobile,
    totalOrders: c.totalOrders,
    totalSpend: c.totalSpend,
    isVip: c.isVip,
    isVerified: c.isVerified,
    lastPurchaseAt: c.lastPurchaseAt,
  }));

  // Category Spending breakdown for this store
  const categoryAgg = await Order.aggregate([
    {
      $match: {
        storeId: store.storeId,
        status: { $nin: ["CANCELLED", "FAILED", ORDER_STATUS.DRAFT] },
      },
    },
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.categorySnapshot",
        category: { $first: "$orderItems.categorySnapshot" },
        spending: { $sum: "$orderItems.totalPrice" },
        quantity: { $sum: "$orderItems.quantity" },
      },
    },
    { $sort: { spending: -1 } },
    { $limit: 8 },
  ]);

  return {
    cards: {
      totalRevenue,
      averageCustomerSpend,
      repeatPurchaseRate,
      newCustomersCount: newCount,
      repeatCustomersCount: repeatCount,
      totalCustomers: customers.length,
    },
    spendingTrend,
    topCustomers: top10Customers,
    categorySpending: categoryAgg.map((c) => ({
      category: c.category || "General",
      spending: c.spending,
      quantity: c.quantity,
    })),
  };
};

export const getStoreCustomer = async (
  ownerId: string,
  customerId: string,
  storeId?: string
) => {
  const ownerStore = await getStoreForOwner(ownerId);
  const targetStoreId = storeId ?? ownerStore.storeId;

  // 1. Verify seller ownership relation: Customer must have placed an order OR be in StoreCustomer for this store
  const [hasOrder, storeCustomerDoc, user] = await Promise.all([
    Order.findOne({ storeId: targetStoreId, userId: customerId, status: { $ne: ORDER_STATUS.DRAFT } }).lean(),
    StoreCustomer.findOne({ storeId: targetStoreId, customerId }).lean(),
    User.findOne({ userId: customerId })
      .select("userId name email mobile avatar isEmailVerified isPhoneVerified status createdAt")
      .lean(),
  ]);

  if (!hasOrder && !storeCustomerDoc) {
    throw new AppError("Customer not found for this store", 404);
  }

  // 2. Aggregate orders for this customer at this store
  const orderStats = await Order.aggregate([
    {
      $match: {
        storeId: targetStoreId,
        userId: customerId,
        status: { $ne: ORDER_STATUS.DRAFT },
      },
    },
    {
      $group: {
        _id: "$userId",
        totalOrders: { $sum: 1 },
        completedOrders: {
          $sum: { $cond: [{ $in: ["$status", ["DELIVERED", "PICKED_UP"]] }, 1, 0] },
        },
        cancelledOrders: {
          $sum: { $cond: [{ $in: ["$status", ["CANCELLED", "FAILED"]] }, 1, 0] },
        },
        pendingOrders: {
          $sum: {
            $cond: [
              {
                $in: [
                  "$status",
                  [
                    "ORDER_PLACED",
                    "CONFIRMED",
                    "PROCESSING",
                    "PACKED",
                    "OUT_FOR_DELIVERY",
                    "READY_FOR_PICKUP",
                    "PENDING_PAYMENT",
                  ],
                ],
              },
              1,
              0,
            ],
          },
        },
        totalOnlinePurchases: {
          $sum: { $cond: [{ $in: ["$status", ["CANCELLED", "FAILED"]] }, 0, "$grandTotal"] },
        },
        couponsUsed: {
          $sum: { $cond: [{ $or: [{ $gt: ["$couponDiscount", 0] }, { $ne: ["$couponCode", null] }] }, 1, 0] },
        },
        totalItemsCount: { $sum: "$totalItems" },
        lastPurchaseAt: { $max: "$createdAt" },
        firstPurchaseAt: { $min: "$createdAt" },
      },
    },
  ]);

  const stats = orderStats[0] || {
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    pendingOrders: 0,
    totalOnlinePurchases: 0,
    couponsUsed: 0,
    totalItemsCount: 0,
    lastPurchaseAt: null,
    firstPurchaseAt: null,
  };

  const totalOfflinePurchases = storeCustomerDoc?.totalOfflinePurchases || 0;
  const totalSpend = stats.totalOnlinePurchases + totalOfflinePurchases;
  const averageOrderValue = stats.totalOrders > 0 ? Math.round(totalSpend / stats.totalOrders) : 0;
  const averageBasketSize = stats.totalOrders > 0 ? Math.round((stats.totalItemsCount / stats.totalOrders) * 10) / 10 : 0;

  // 3. Top 5 favorite products from this seller
  const favoriteProducts = await Order.aggregate([
    {
      $match: {
        storeId: targetStoreId,
        userId: customerId,
        status: { $nin: ["CANCELLED", "FAILED", ORDER_STATUS.DRAFT] },
      },
    },
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.productId",
        productId: { $first: "$orderItems.productId" },
        name: { $first: "$orderItems.name" },
        sku: { $first: "$orderItems.sku" },
        quantity: { $sum: "$orderItems.quantity" },
        totalSpent: { $sum: "$orderItems.totalPrice" },
      },
    },
    { $sort: { quantity: -1, totalSpent: -1 } },
    { $limit: 5 },
  ]);

  // 4. Favorite categories from this seller
  const favoriteCategories = await Order.aggregate([
    {
      $match: {
        storeId: targetStoreId,
        userId: customerId,
        status: { $nin: ["CANCELLED", "FAILED", ORDER_STATUS.DRAFT] },
      },
    },
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.categorySnapshot",
        category: { $first: "$orderItems.categorySnapshot" },
        quantity: { $sum: "$orderItems.quantity" },
        totalSpent: { $sum: "$orderItems.totalPrice" },
      },
    },
    { $sort: { quantity: -1 } },
    { $limit: 5 },
  ]);

  // 5. Recent 5 orders for timeline
  const recentOrders = await Order.find({
    storeId: targetStoreId,
    userId: customerId,
    status: { $ne: ORDER_STATUS.DRAFT },
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("orderId invoiceNumber createdAt status pickupStatus fulfillmentType grandTotal paymentMethod paymentStatus totalItems orderItems")
    .lean();

  const emailVerified = Boolean(user?.emailVerified);
  const phoneVerified = Boolean(user?.phoneVerified);
  const isVerifiedCustomer = Boolean(user?.isVerifiedCustomer);
  const isVerified = isVerifiedCustomer || emailVerified || phoneVerified;
  const isVip = stats.totalOrders >= 5 || totalSpend >= 5000;
  const isPlusCustomer = Boolean(storeCustomerDoc?.isPlusCustomer);

  return {
    customer: {
      customerId,
      storeCustomerId: storeCustomerDoc?.storeCustomerId,
      name: user?.name || "Customer",
      email: user?.email || "",
      mobile: user?.mobile || "",
      avatar: user?.avatar || null,
      isEmailVerified: emailVerified,
      isPhoneVerified: phoneVerified,
      isVerified,
      customerSince: user?.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
      isPlusCustomer,
      notes: storeCustomerDoc?.notes || "",
      isVip,
    },
    sellerRelationship: {
      totalOrders: stats.totalOrders,
      completedOrders: stats.completedOrders,
      cancelledOrders: stats.cancelledOrders,
      pendingOrders: stats.pendingOrders,
      totalSpending: totalSpend,
      totalOnlinePurchases: stats.totalOnlinePurchases,
      totalOfflinePurchases,
      averageOrderValue,
      lastPurchase: stats.lastPurchaseAt ? new Date(stats.lastPurchaseAt).toISOString() : null,
      firstPurchase: stats.firstPurchaseAt ? new Date(stats.firstPurchaseAt).toISOString() : null,
    },
    favoriteProducts,
    favoriteCategories: favoriteCategories.map((c) => ({
      category: c.category || "General",
      quantity: c.quantity,
      totalSpent: c.totalSpent,
    })),
    timeline: recentOrders.map((order) => {
      const itemsCount = (order as any).orderItems?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || (order as any).orderItems?.length || 0;
      return {
        orderId: order.orderId,
        invoiceNumber: order.invoiceNumber,
        date: order.createdAt,
        status: order.pickupStatus || order.status,
        fulfillmentType: order.fulfillmentType,
        grandTotal: order.grandTotal,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        totalItems: itemsCount,
        productsCount: (order as any).orderItems?.length || 0,
      };
    }),
    insights: {
      mostPurchasedProduct: favoriteProducts[0]?.name || "N/A",
      favoriteCategory: favoriteCategories[0]?.category || "General",
      averageBasketSize,
      lifetimeSpend: totalSpend,
      couponUsageCount: stats.couponsUsed,
      lastActiveDate: stats.lastPurchaseAt ? new Date(stats.lastPurchaseAt).toISOString() : null,
    },
    isPlusCustomer,
    outstandingAmount: 0,
    purchases: recentOrders.map((o) => ({
      orderId: o.orderId,
      invoiceId: o.invoiceNumber,
      date: o.createdAt,
      type: o.fulfillmentType === "pickup" ? "PICKUP" : "DELIVERY",
      amount: o.grandTotal,
      paymentStatus: o.paymentStatus,
    })),
  };
};

export const updateStoreCustomerNotes = async (
  ownerId: string,
  customerId: string,
  notes: string
) => {
  const store = await getStoreForOwner(ownerId);

  // Validate customer belongs to this store
  const [hasOrder, storeCustomerDoc] = await Promise.all([
    Order.findOne({ storeId: store.storeId, userId: customerId, status: { $ne: ORDER_STATUS.DRAFT } }).lean(),
    StoreCustomer.findOne({ storeId: store.storeId, customerId }).lean(),
  ]);

  if (!hasOrder && !storeCustomerDoc) {
    throw new AppError("Customer not found for this store", 404);
  }

  const updated = await StoreCustomer.findOneAndUpdate(
    { storeId: store.storeId, customerId },
    {
      $set: { notes },
      $setOnInsert: {
        storeId: store.storeId,
        customerId,
        isPlusCustomer: false,
        joinedAt: new Date(),
        totalOfflinePurchases: 0,
        totalOnlinePurchases: 0,
      },
    },
    { upsert: true, new: true, runValidators: true }
  ).lean();

  return { success: true, notes: updated.notes };
};

export const getStoreCustomerOrders = async (
  ownerId: string,
  customerId: string,
  filters: {
    page?: number | string;
    limit?: number | string;
    orderStatus?: string;
    paymentStatus?: string;
    sortBy?: string;
  }
) => {
  const store = await getStoreForOwner(ownerId);

  // Verify relation
  const [hasOrder, storeCustomerDoc] = await Promise.all([
    Order.findOne({ storeId: store.storeId, userId: customerId, status: { $ne: ORDER_STATUS.DRAFT } }).lean(),
    StoreCustomer.findOne({ storeId: store.storeId, customerId }).lean(),
  ]);

  if (!hasOrder && !storeCustomerDoc) {
    throw new AppError("Customer not found for this store", 404);
  }

  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));

  const query: Record<string, unknown> = {
    storeId: store.storeId,
    userId: customerId,
    status: { $ne: ORDER_STATUS.DRAFT },
  };

  if (filters.orderStatus) {
    query.$or = [{ pickupStatus: filters.orderStatus }, { status: filters.orderStatus }];
  }
  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }

  const sortOrder: Record<string, 1 | -1> = filters.sortBy === "amount_desc"
    ? { grandTotal: -1 }
    : filters.sortBy === "amount_asc"
    ? { grandTotal: 1 }
    : { createdAt: -1 };

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort(sortOrder)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(query),
  ]);

  return {
    orders: orders.map((order) => ({
      orderId: order.orderId,
      invoiceNumber: order.invoiceNumber,
      createdAt: order.createdAt,
      status: order.pickupStatus || order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      fulfillmentType: order.fulfillmentType,
      grandTotal: order.grandTotal,
      couponCode: order.couponCode,
      couponDiscount: order.couponDiscount,
      totalItems: order.orderItems?.reduce((sum, item) => sum + (item.quantity || 1), 0) || order.orderItems?.length || 0,
      orderItems: order.orderItems,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getStoreCustomerForUser = async (
  customerId: string,
  storeId: string
) => {
  const store = await Store.findOne({
    storeId,
    status: STORE_STATUS.APPROVED,
  })
    .select("storeId")
    .lean();

  if (!store) {
    throw new AppError("Store not found", 404);
  }

  await linkPendingPlusMember(storeId, customerId);

  const customer = await StoreCustomer.findOne({ storeId, customerId }).lean();
  if (!customer) {
    throw new AppError("Store customer not found", 404);
  }

  return { customer, isPlusCustomer: customer.isPlusCustomer };
};

export const updatePlusCustomer = async (
  ownerId: string,
  customerId: string,
  isPlusCustomer: boolean
) => {
  const store = await getStoreForOwner(ownerId);
  const customer = await StoreCustomer.findOneAndUpdate(
    { storeId: store.storeId, customerId },
    { $set: { isPlusCustomer } },
    { new: true, runValidators: true }
  ).lean();

  if (!customer) {
    throw new AppError("Store customer not found", 404);
  }

  return customer;
};

const normalizeMemberIdentifier = (value: string) => value.includes("@") ? value.trim().toLowerCase() : value.replace(/\s+/g, "");

export const linkPendingPlusMember = async (storeId: string, customerId: string) => {
  const user = await User.findOne({ userId: customerId }).select("userId email mobile").lean();
  if (!user) return null;
  const member = await StoreCustomer.findOne({ storeId, customerId: null, isPlusCustomer: true, $or: [{ pendingEmail: user.email.toLowerCase() }, { pendingPhone: user.mobile.replace(/\s+/g, "") }] });
  if (!member) return null;
  member.customerId = user.userId;
  member.pendingEmail = null;
  member.pendingPhone = null;
  member.linkedAt = new Date();
  await member.save();
  return member;
};

export const addPlusMember = async (ownerId: string, identifier: string) => {
  const store = await getStoreForOwner(ownerId);
  const normalized = normalizeMemberIdentifier(identifier);
  const isEmail = normalized.includes("@");
  const user = await User.findOne(isEmail ? { email: normalized } : { mobile: normalized }).select("userId name email mobile").lean();
  const existing = await StoreCustomer.findOne({ storeId: store.storeId, ...(user ? { customerId: user.userId } : isEmail ? { pendingEmail: normalized } : { pendingPhone: normalized }) });
  if (existing) {
    if (existing.isPlusCustomer) throw new AppError("This customer is already a Plus member", 409);
    existing.isPlusCustomer = true;
    existing.grantedBySeller = ownerId;
    existing.grantedAt = new Date();
    await existing.save();
    return existing.toObject();
  }
  const member = await StoreCustomer.create({ storeId: store.storeId, customerId: user?.userId ?? null, pendingEmail: user ? null : isEmail ? normalized : null, pendingPhone: user ? null : isEmail ? null : normalized, isPlusCustomer: true, grantedBySeller: ownerId, grantedAt: new Date(), linkedAt: user ? new Date() : null });
  return { ...member.toObject(), user };
};

export const listPlusMembers = async (ownerId: string, search?: string) => {
  const store = await getStoreForOwner(ownerId);
  const query: Record<string, unknown> = { storeId: store.storeId, isPlusCustomer: true };
  if (search?.trim()) {
    const value = escapeRegex(search.trim());
    const regex = new RegExp(value, "i");
    const users = await User.find({ $or: [{ email: regex }, { mobile: regex }, { name: regex }] }).select("userId").lean();
    query.$or = [{ customerId: { $in: users.map((user) => user.userId) } }, { pendingEmail: regex }, { pendingPhone: regex }];
  }
  const members = await StoreCustomer.find(query).sort({ grantedAt: -1 }).lean();
  const users = await User.find({ userId: { $in: members.flatMap((member) => member.customerId ? [member.customerId] : []) } }).select("userId name email mobile").lean();
  const userMap = new Map(users.map((user) => [user.userId, user]));
  return members.map((member) => ({ ...member, user: member.customerId ? userMap.get(member.customerId) ?? null : null }));
};

export const removePlusMember = async (ownerId: string, storeCustomerId: string) => {
  const store = await getStoreForOwner(ownerId);
  const member = await StoreCustomer.findOneAndUpdate({ storeId: store.storeId, storeCustomerId }, { $set: { isPlusCustomer: false } }, { new: true }).lean();
  if (!member) throw new AppError("Plus member not found", 404);
  return member;
};

export const getPosCatalog = async (ownerId: string) => {
  const store = await Store.findOne({
    ownerId,
    status: STORE_STATUS.APPROVED,
    isDeleted: { $ne: true },
  })
    .select("storeId storeName")
    .lean();

  if (!store) {
    throw new AppError("Only approved store owners can access POS catalog", 403);
  }

  const products = await Product.find({
    storeId: store.storeId,
    isActive: true,
    isDeleted: { $ne: true },
  })
    .select(
      "productId name sku brand price discountPrice quantity sellingType baseUnit unitLabel minQuantity stepQuantity allowCustomQuantity stockTrackingMode variants thumbnail images categoryId"
    )
    .lean();

  const productIds = products.map((p) => p.productId);

  const inventories = await Inventory.find({
    productId: { $in: productIds },
  })
    .select("productId availableQuantity lowStockThreshold status")
    .lean();

  const inventoryMap = new Map(
    inventories.map((inv) => [inv.productId, inv])
  );

  const missingProducts = products.filter((p) => !inventoryMap.has(p.productId));
  if (missingProducts.length > 0) {
    try {
      const createdInventories = await Promise.all(
        missingProducts.map((p) => {
          const initialQty = Math.max(0, p.quantity ?? 0);
          return Inventory.create({
            productId: p.productId,
            availableQuantity: initialQty,
            reservedQuantity: 0,
            soldQuantity: 0,
            lowStockThreshold: 5,
            status:
              initialQty > 5
                ? INVENTORY_STATUS.IN_STOCK
                : initialQty > 0
                ? INVENTORY_STATUS.LOW_STOCK
                : INVENTORY_STATUS.OUT_OF_STOCK,
            createdBy: ownerId,
            updatedBy: ownerId,
          });
        })
      );
      createdInventories.forEach((inv) => inventoryMap.set(inv.productId, inv));
    } catch {
      // Ignore conflict if created concurrently
    }
  }

  const categoryIds = Array.from(new Set(products.map((p) => p.categoryId).filter(Boolean)));
  const categories = await Category.find({
    categoryId: { $in: categoryIds },
    isDeleted: { $ne: true },
  })
    .select("categoryId name")
    .lean();

  const categoryMap = new Map(categories.map((c) => [c.categoryId, c.name]));

  const mappedProducts = products.map((product) => {
    const inv = inventoryMap.get(product.productId);
    const availableQuantity =
      inv !== undefined ? (inv.availableQuantity ?? 0) : Math.max(0, product.quantity ?? 0);
    const lowStockThreshold = inv?.lowStockThreshold ?? 5;

    let stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" = "OUT_OF_STOCK";
    if (availableQuantity > lowStockThreshold) {
      stockStatus = "IN_STOCK";
    } else if (availableQuantity > 0) {
      stockStatus = "LOW_STOCK";
    } else {
      stockStatus = "OUT_OF_STOCK";
    }

    return {
      productId: product.productId,
      name: product.name,
      sku: product.sku || "",
      brand: product.brand || "",
      price: product.price,
      discountPrice: product.discountPrice ?? 0,
      sellingType: product.sellingType || "PIECE",
      baseUnit: product.baseUnit || "piece",
      unitLabel: product.unitLabel || "",
      minQuantity: product.minQuantity || 1,
      stepQuantity: product.stepQuantity || 1,
      allowCustomQuantity: product.allowCustomQuantity || false,
      variants: product.variants || [],
      stockTrackingMode: product.stockTrackingMode || "SEPARATE",
      availableQuantity,
      lowStockThreshold,
      stockStatus,
      categoryId: product.categoryId,
      categoryName: categoryMap.get(product.categoryId) || "Uncategorized",
      thumbnail: product.thumbnail || (product.images && product.images[0]) || "",
      images: product.images || [],
    };
  });

  const categoryList = categories.map((cat) => ({
    categoryId: cat.categoryId,
    name: cat.name,
  }));

  return {
    products: mappedProducts,
    categories: categoryList,
    store: {
      storeId: store.storeId,
      storeName: store.storeName,
    },
  };
};
