import { Router } from "express";
import {
  bulkReviewAction,
  createReview,
  deleteReview,
  getAdminReviewDetails,
  getAdminReviews,
  getAdminReviewStats,
  getMyReviews,
  getProductReviews,
  getReview,
  markSpamOrAbuse,
  moderateReview,
  reportReview,
  restoreAdminReview,
  softDeleteAdminReview,
  updateReview,
  updateVisibility,
  getStoreReviewsHandler,
  replyToStoreReviewHandler,
  reportStoreReviewHandler,
} from "../controllers/review.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { USER_ROLES } from "../constants/roles";

const router = Router();

// Admin Review Moderation Routes
router.get(
  "/reviews/admin",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(getAdminReviews)
);

router.get(
  "/reviews/admin/stats",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(getAdminReviewStats)
);

router.post(
  "/reviews/admin/bulk-action",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(bulkReviewAction)
);

router.get(
  "/reviews/admin/:reviewId",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(getAdminReviewDetails)
);

router.patch(
  "/reviews/admin/:reviewId/moderate",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(moderateReview)
);

router.delete(
  "/reviews/admin/:reviewId",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(softDeleteAdminReview)
);

router.patch(
  "/reviews/admin/:reviewId/restore",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(restoreAdminReview)
);

router.post(
  "/reviews/admin/:reviewId/flag",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(markSpamOrAbuse)
);

// Public / Customer Review Routes
router.get("/products/:productId/reviews", asyncHandler(getProductReviews));
router.get(
  "/reviews/me",
  authenticate,
  authorize(USER_ROLES.CUSTOMER),
  asyncHandler(getMyReviews)
);
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

router.post(
  "/reviews/:reviewId/report",
  authenticate,
  asyncHandler(reportReview)
);

// Seller Store Review Routes
router.get(
  "/reviews/store/all",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(getStoreReviewsHandler)
);

router.get(
  "/store/reviews",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(getStoreReviewsHandler)
);

router.post(
  "/reviews/:reviewId/store-reply",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(replyToStoreReviewHandler)
);

router.post(
  "/reviews/:reviewId/store-report",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(reportStoreReviewHandler)
);

export default router;

