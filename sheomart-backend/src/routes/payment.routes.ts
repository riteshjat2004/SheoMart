import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { USER_ROLES } from "../constants/roles";
import { asyncHandler } from "../utils/asyncHandler";
import { createPaymentOrder } from "../controllers/payment.controller";
import { verifyPayment } from "../controllers/payment.controller";

const router = Router();

router.post(
  "/create-order",
  authenticate,
  authorize(USER_ROLES.CUSTOMER),
  asyncHandler(createPaymentOrder)
);

router.post(
  "/verify",
  authenticate,
  authorize(USER_ROLES.CUSTOMER),
  asyncHandler(verifyPayment)
);

export default router;