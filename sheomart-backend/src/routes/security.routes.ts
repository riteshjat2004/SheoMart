import { Router } from "express";
import {
  getAdminSessions,
  revokeSession,
  logoutOtherSessions,
  getSecurityStatus,
} from "../controllers/security.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { USER_ROLES } from "../constants/roles";

const router = Router();

router.get(
  "/sessions",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(getAdminSessions)
);

router.delete(
  "/sessions/:sessionId",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(revokeSession)
);

router.post(
  "/sessions/logout-other",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(logoutOtherSessions)
);

router.get(
  "/status",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(getSecurityStatus)
);

export default router;
