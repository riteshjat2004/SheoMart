import { Router } from "express";
import {
  createStore,
  getAdminStores,
  getAllStores,
  getMyStore,
  getStoreById,
  updateMyStore,
  updateStoreBadge,
  updateStoreStatus,
} from "../controllers/store.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { USER_ROLES } from "../constants/roles";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(USER_ROLES.CUSTOMER),
  asyncHandler(createStore)
);
router.get(
  "/me",
  authenticate,
  authorize(USER_ROLES.CUSTOMER, USER_ROLES.STORE_OWNER),
  asyncHandler(getMyStore)
);
router.patch(
  "/me",
  authenticate,
  authorize(USER_ROLES.CUSTOMER, USER_ROLES.STORE_OWNER),
  asyncHandler(updateMyStore)
);
router.get(
  "/admin",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(getAdminStores)
);
router.get("/", asyncHandler(getAllStores));
router.patch(
  "/:storeId/badge",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(updateStoreBadge)
);
router.get("/:storeId", asyncHandler(getStoreById));
router.patch(
  "/:storeId/status",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(updateStoreStatus)
);

export default router;
