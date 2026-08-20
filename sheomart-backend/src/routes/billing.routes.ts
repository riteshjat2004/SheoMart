import { Router } from "express";

import { USER_ROLES } from "../constants/roles";
import {
  cancelInvoice,
  completePickupPayment,
  createOfflineInvoice,
  getInvoiceById,
  listInvoices,
  listPickupOrders,
  listStoreCustomers,
  updatePlusCustomer,
} from "../controllers/billing.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

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

router.patch(
  "/customers/:customerId/plus",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(updatePlusCustomer)
);

export default router;
