import { Router } from "express";
import {
  getHeroCarousel,
  getTrendingProducts,
  getMarketplaceStats,
  getFeaturedReviews,
} from "../controllers/home.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/hero-carousel", asyncHandler(getHeroCarousel));
router.get("/trending-products", asyncHandler(getTrendingProducts));
router.get("/stats", asyncHandler(getMarketplaceStats));
router.get("/reviews", asyncHandler(getFeaturedReviews));

export default router;
