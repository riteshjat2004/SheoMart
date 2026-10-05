import { Router } from "express";
import {
  addImages,
  bulkProductAction,
  createBulkProducts,
  createProduct,
  deleteProduct,
  duplicateProduct,
  getMyProducts,
  getAdminProducts,
  getProductById,
  getProducts,
  removeImage,
  restoreProduct,
  updateProduct,
  updateProductStatus,
  updateThumbnail,
  toggleProductFeatured,
  updateProductFeaturedPriority,
  cloneProductsToStore,
} from "../controllers/product.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { USER_ROLES } from "../constants/roles";
import { uploadProductImage } from "../middleware/upload.middleware";

const router = Router();

router.get(
  "/admin",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(getAdminProducts)
);
router.post(
  "/admin/bulk-action",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(bulkProductAction)
);
router.post(
  "/admin/clone-to-store",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(cloneProductsToStore)
);
router.patch(
  "/admin/:productId/feature",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(toggleProductFeatured)
);
router.patch(
  "/admin/:productId/featured-priority",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(updateProductFeaturedPriority)
);
router.get("/", asyncHandler(getProducts));
router.get(
  "/me",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(getMyProducts)
);
router.get("/:productId", asyncHandler(getProductById));

router.post(
  "/bulk",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER, USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(createBulkProducts)
);
router.post(
  "/",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER, USER_ROLES.PLATFORM_ADMIN),
  uploadProductImage,
  asyncHandler(createProduct)
);
router.post(
  "/:productId/duplicate",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER, USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(duplicateProduct)
);
router.patch(
  "/:productId",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER, USER_ROLES.PLATFORM_ADMIN),
  uploadProductImage,
  asyncHandler(updateProduct)
);
router.delete(
  "/:productId",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER, USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(deleteProduct)
);
router.patch(
  "/:productId/restore",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER, USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(restoreProduct)
);
router.patch(
  "/:productId/status",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER, USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(updateProductStatus)
);
router.post(
  "/:productId/images",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER, USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(addImages)
);
router.delete(
  "/:productId/images",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER, USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(removeImage)
);
router.patch(
  "/:productId/thumbnail",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER, USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(updateThumbnail)
);

export default router;
