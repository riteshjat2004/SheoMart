import { Router } from "express";
import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../controllers/cart.controller";
import { authenticate } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(getCart));
router.post("/", asyncHandler(addCartItem));
router.patch("/:cartItemId", asyncHandler(updateCartItem));
router.delete("/:cartItemId", asyncHandler(removeCartItem));
router.delete("/", asyncHandler(clearCart));

export default router;
