import { Router } from "express";
import {
  getInventory,
  syncStoreInventory,
  updateInventory,
  updateInventoryStatus,
} from "../controllers/inventory.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { USER_ROLES } from "../constants/roles";

const router = Router();

router.get(
  "/sync",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(syncStoreInventory)
);

router.get(
  "/:productId",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER, USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(getInventory)
);
router.patch(
  "/:productId",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER, USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(updateInventory)
);
router.patch(
  "/:productId/status",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER, USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(updateInventoryStatus)
);

export default router;
