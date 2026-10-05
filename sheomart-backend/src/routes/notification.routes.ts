import { Router } from "express";
import {
  getStoreNotifications,
  markNotificationAsRead,
  markAllStoreNotificationsAsRead,
  getStoreUnreadCount,
} from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { USER_ROLES } from "../constants/roles";

const router = Router();

router.use(authenticate);
router.use(authorize(USER_ROLES.STORE_OWNER, USER_ROLES.CUSTOMER, USER_ROLES.PLATFORM_ADMIN));

router.get("/store", asyncHandler(getStoreNotifications));
router.get("/store/unread-count", asyncHandler(getStoreUnreadCount));
router.patch("/store/mark-all-read", asyncHandler(markAllStoreNotificationsAsRead));
router.patch("/:notificationId/read", asyncHandler(markNotificationAsRead));

export default router;
