import { Router } from "express";
import { getHeroCarousel, getTrendingProducts } from "../controllers/home.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/hero-carousel", asyncHandler(getHeroCarousel));
router.get("/trending-products", asyncHandler(getTrendingProducts));

export default router;
