import { Router } from "express";

import { getProfile } from "../controllers/user.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.get(
  "/profile",
  authenticate,
  authorize("customer", "store_owner", "platform_admin"),
  asyncHandler(getProfile)
);

export default router;