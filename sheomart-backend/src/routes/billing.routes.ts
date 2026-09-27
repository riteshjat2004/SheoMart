import { Router } from "express";

import { USER_ROLES } from "../constants/roles";
import {
  cancelInvoice,
  completePickupPayment,
  createOfflineInvoice,
  getInvoiceById,
  getPosCatalog,
  getStoreCustomer,
  getStoreCustomerOrders,
  getStoreCustomersAnalytics,
  getStoreCustomersSummary,
  listInvoices,
  listPickupOrders,
  listStoreCustomers,
  updatePlusCustomer,
  updateStoreCustomerNotes,
} from "../controllers/billing.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// POS Catalog — single aggregated endpoint replacing N+1 inventory calls
router.get(
  "/pos-catalog",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(getPosCatalog)
);

router.post(
  "/invoices",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(createOfflineInvoice)
);

router.get(
  "/invoices",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(listInvoices)
);

router.get(
  "/invoices/:invoiceId",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(getInvoiceById)
);

router.patch(
  "/invoices/:invoiceId/cancel",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(cancelInvoice)
);

router.get(
  "/pickup-orders",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(listPickupOrders)
);

router.patch(
  "/pickup-orders/:orderId/pay",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(completePickupPayment)
);

router.get(
  "/customers",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(listStoreCustomers)
);

router.get(
  "/customers/summary",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(getStoreCustomersSummary)
);

router.get(
  "/customers/analytics",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(getStoreCustomersAnalytics)
);

router.get(
  "/customers/:customerId/orders",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(getStoreCustomerOrders)
);

router.patch(
  "/customers/:customerId/notes",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(updateStoreCustomerNotes)
);

router.get(
  "/customers/:customerId",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER, USER_ROLES.CUSTOMER),
  asyncHandler(getStoreCustomer)
);

router.patch(
  "/customers/:customerId/plus",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(updatePlusCustomer)
);

export default router;
