import { Router } from "express";
import {
  createReview,
  deleteReview,
  getAdminReviews,
  getProductReviews,
  getReview,
  updateReview,
  updateVisibility,
} from "../controllers/review.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { USER_ROLES } from "../constants/roles";

const router = Router();

router.get(
  "/reviews/admin",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(getAdminReviews)
);
router.get("/products/:productId/reviews", asyncHandler(getProductReviews));
router.get("/reviews/:reviewId", asyncHandler(getReview));

router.post(
  "/products/:productId/reviews",
  authenticate,
  authorize(USER_ROLES.CUSTOMER),
  asyncHandler(createReview)
);
router.patch(
  "/reviews/:reviewId",
  authenticate,
  authorize(USER_ROLES.CUSTOMER),
  asyncHandler(updateReview)
);
router.delete(
  "/reviews/:reviewId",
  authenticate,
  authorize(USER_ROLES.CUSTOMER),
  asyncHandler(deleteReview)
);
router.patch(
  "/reviews/:reviewId/visibility",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(updateVisibility)
);

export default router;
