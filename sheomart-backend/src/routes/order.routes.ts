import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { USER_ROLES } from "../constants/roles";
import { createOrder, getOrder, getOrders, markPaymentReceived, updateSellerOrderStatus } from "../controllers/order.controller";

const router = Router();

router.use(authenticate);
router.post("/", authorize(USER_ROLES.CUSTOMER), asyncHandler(createOrder));
router.get("/", authorize(USER_ROLES.CUSTOMER), asyncHandler(getOrders));
router.get("/:orderId", authorize(USER_ROLES.CUSTOMER, USER_ROLES.STORE_OWNER), asyncHandler(getOrder));
router.patch(
	"/:orderId/status",
	authorize(USER_ROLES.STORE_OWNER),
	asyncHandler(updateSellerOrderStatus)
);
router.patch(
	"/:orderId/payment",
	authorize(USER_ROLES.STORE_OWNER),
	asyncHandler(markPaymentReceived)
);

export default router;
