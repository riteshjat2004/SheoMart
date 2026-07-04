import { Router } from "express";
import {
  createCategory,
  createBulkCategories,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
} from "../controllers/category.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { USER_ROLES } from "../constants/roles";

const router = Router();

router.get("/", asyncHandler(getCategories));
router.get("/:categoryId", asyncHandler(getCategoryById));

router.post(
  "/",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(createCategory)
);
router.post(
  "/bulk",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(createBulkCategories)
);
router.patch(
  "/:categoryId",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(updateCategory)
);
router.delete(
  "/:categoryId",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(deleteCategory)
);
router.patch(
  "/:categoryId/status",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(updateCategoryStatus)
);

export default router;
