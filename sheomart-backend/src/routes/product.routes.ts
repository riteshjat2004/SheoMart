import { Router } from "express";
import {
  addImages,
  createProduct,
  deleteProduct,
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

const router = Router();

router.get("/", asyncHandler(getProducts));
router.get("/:productId", asyncHandler(getProductById));

router.post(
  "/",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(createProduct)
);
router.patch(
  "/:productId",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
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
