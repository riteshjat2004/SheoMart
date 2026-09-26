import { Router } from "express";
import {
  getPublicSettings,
  getAdminSettings,
  updateAdminSettings,
  getAdminAuditLogs,
  createBackup,
  downloadBackupSnapshot,
  getSystemHealth,
  exportPlatformDataset,
  uploadBrandingAsset,
} from "../controllers/settings.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { USER_ROLES } from "../constants/roles";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

// Public route for storefront configuration & announcement banner
router.get("/public", asyncHandler(getPublicSettings));

// Admin Protected Routes (PLATFORM_ADMIN only)
router.get("/admin", authenticate, authorize(USER_ROLES.PLATFORM_ADMIN), asyncHandler(getAdminSettings));
router.patch("/admin", authenticate, authorize(USER_ROLES.PLATFORM_ADMIN), asyncHandler(updateAdminSettings));
router.post("/admin/branding/upload", authenticate, authorize(USER_ROLES.PLATFORM_ADMIN), upload.single("image"), asyncHandler(uploadBrandingAsset));
router.get("/admin/audit-logs", authenticate, authorize(USER_ROLES.PLATFORM_ADMIN), asyncHandler(getAdminAuditLogs));
router.post("/admin/backup/create", authenticate, authorize(USER_ROLES.PLATFORM_ADMIN), asyncHandler(createBackup));
router.get("/admin/backup/download", authenticate, authorize(USER_ROLES.PLATFORM_ADMIN), asyncHandler(downloadBackupSnapshot));
router.get("/admin/health", authenticate, authorize(USER_ROLES.PLATFORM_ADMIN), asyncHandler(getSystemHealth));
router.get("/admin/export", authenticate, authorize(USER_ROLES.PLATFORM_ADMIN), asyncHandler(exportPlatformDataset));

export default router;
