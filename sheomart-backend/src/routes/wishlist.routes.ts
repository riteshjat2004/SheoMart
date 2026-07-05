import { Router } from "express";
import {
  addWishlistItem,
  getWishlist,
  removeWishlistItem,
} from "../controllers/wishlist.controller";
import { authenticate } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(getWishlist));
router.post("/", asyncHandler(addWishlistItem));
router.delete("/:wishlistItemId", asyncHandler(removeWishlistItem));

export default router;
