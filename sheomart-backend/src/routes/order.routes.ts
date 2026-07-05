import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { USER_ROLES } from "../constants/roles";
import { createOrder, getOrder, getOrders } from "../controllers/order.controller";

const router = Router();

router.use(authenticate, authorize(USER_ROLES.CUSTOMER));
router.post("/", asyncHandler(createOrder));
router.get("/", asyncHandler(getOrders));
router.get("/:orderId", asyncHandler(getOrder));

export default router;
