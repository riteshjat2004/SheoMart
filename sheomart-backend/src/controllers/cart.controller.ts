import { Response } from "express";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/apiResponse";
import { CartService } from "../services/cart.service";
import { addCartItemSchema, updateCartItemSchema } from "../validators/cart.validator";

export const getCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const cart = await CartService.getCartForUser(req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "Cart fetched successfully", { cart })
  );
};

export const addCartItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const result = addCartItemSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid cart item payload";
    throw new AppError(message, 400);
  }

  const resultData = await CartService.addCartItem(req.user?.userId as string, result.data);

  res.status(201).json(
    new ApiResponse(true, "Product added to cart successfully", resultData)
  );
};

export const updateCartItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const cartItemId = Array.isArray(req.params.cartItemId) ? req.params.cartItemId[0] : req.params.cartItemId;
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const result = updateCartItemSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid cart update payload";
    throw new AppError(message, 400);
  }

  const cartItem = await CartService.updateCartItem(cartItemId, req.user?.userId as string, result.data);

  res.status(200).json(
    new ApiResponse(true, "Cart item updated successfully", { cartItem })
  );
};

export const removeCartItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const cartItemId = Array.isArray(req.params.cartItemId) ? req.params.cartItemId[0] : req.params.cartItemId;
  const cartItem = await CartService.removeCartItem(cartItemId, req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "Cart item removed successfully", { cartItem })
  );
};

export const clearCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  await CartService.clearCart(req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "Cart cleared successfully", {})
  );
};
