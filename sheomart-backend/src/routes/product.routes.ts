import { Router } from "express";
import {
  addImages,
  createBulkProducts,
  createProduct,
  deleteProduct,
  getMyProducts,
  getAdminProducts,
  getProductById,
  getProducts,
  removeImage,
  updateProduct,
  updateProductStatus,
  updateThumbnail,
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
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(createBulkProducts)
);
router.post(
  "/",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  uploadProductImage,
  asyncHandler(createProduct)
);
router.patch(
  "/:productId",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  uploadProductImage,
  asyncHandler(updateProduct)
);
router.delete(
  "/:productId",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(deleteProduct)
);
router.patch(
  "/:productId/status",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
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
