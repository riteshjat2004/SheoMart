import { AppError } from "../errors/AppError";
import { CartItem } from "../models/cart.model";
import { Inventory } from "../models/inventory.model";
import { Product } from "../models/product.model";
import { AddCartItemInput, UpdateCartItemInput } from "../validators/cart.validator";

export class CartService {
  private static buildAvailability(product: { productId: string; isActive?: boolean; isPublished?: boolean } | null | undefined, inventory: { availableQuantity: number } | null | undefined, requestedQuantity: number) {
    if (!product) {
      return {
        isAvailable: false,
        availabilityMessage: "Unavailable",
        maxAvailableQuantity: 0,
      };
    }

    if (!product.isActive || !product.isPublished) {
      return {
        isAvailable: false,
        availabilityMessage: "Unavailable",
        maxAvailableQuantity: 0,
      };
    }

    if (!inventory) {
      return {
        isAvailable: false,
        availabilityMessage: "Out of Stock",
        maxAvailableQuantity: 0,
      };
    }

    const maxAvailableQuantity = Math.max(0, inventory.availableQuantity);

    if (maxAvailableQuantity === 0) {
      return {
        isAvailable: false,
        availabilityMessage: "Out of Stock",
        maxAvailableQuantity: 0,
      };
    }

    if (requestedQuantity > maxAvailableQuantity) {
      return {
        isAvailable: false,
        availabilityMessage: `Only ${maxAvailableQuantity} left`,
        maxAvailableQuantity,
      };
    }

    return {
      isAvailable: true,
      availabilityMessage: maxAvailableQuantity <= 5 ? `Only ${maxAvailableQuantity} left` : "In stock",
      maxAvailableQuantity,
    };
  }

  private static buildCartSummary(cartItems: Array<{ quantity: number; product: { price: number; discountPrice?: number } | null; isAvailable: boolean }>) {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.product?.discountPrice ?? item.product?.price ?? 0;
      return sum + price * item.quantity;
    }, 0);
    const totalProducts = cartItems.length;
    const estimatedSavings = cartItems.reduce((sum, item) => {
      const price = item.product?.price ?? 0;
      const discountPrice = item.product?.discountPrice ?? price;
      return sum + Math.max(0, price - discountPrice) * item.quantity;
    }, 0);

    return {
      totalItems,
      subtotal,
      totalProducts,
      estimatedSavings,
      hasUnavailableItems: cartItems.some((item) => !item.isAvailable),
    };
  }

  static async getCartForUser(userId: string) {
    const cartItems = await CartItem.find({ userId }).sort({ updatedAt: -1 });
    const productIds = cartItems.map((item) => item.productId);
    const products = await Product.find({ productId: { $in: productIds } });
    const productMap = new Map(products.map((product) => [product.productId, product]));
    const inventories = await Inventory.find({ productId: { $in: productIds } });
    const inventoryMap = new Map(inventories.map((inventory) => [inventory.productId, inventory]));

    const enrichedCartItems = cartItems
      .map((item) => {
        const product = productMap.get(item.productId);
        const inventory = inventoryMap.get(item.productId);
        const availability = this.buildAvailability(product, inventory, item.quantity);

        if (!product) {
          return null;
        }

        return {
          cartItemId: item.cartItemId,
          quantity: item.quantity,
          product,
          isAvailable: availability.isAvailable,
          availabilityMessage: availability.availabilityMessage,
          maxAvailableQuantity: availability.maxAvailableQuantity,
        };
      })
      .filter((item): item is { cartItemId: string; quantity: number; product: typeof products[number]; isAvailable: boolean; availabilityMessage: string; maxAvailableQuantity: number } => item !== null);

    return {
      cartItems: enrichedCartItems,
      summary: this.buildCartSummary(enrichedCartItems),
    };
  }

  static async addCartItem(userId: string, data: AddCartItemInput) {
    const product = await Product.findOne({ productId: data.productId });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const inventory = await Inventory.findOne({ productId: data.productId });
    const quantity = data.quantity ?? 1;
    const availability = this.buildAvailability(product, inventory, quantity);

    if (!availability.isAvailable) {
      return {
        cartItem: null,
        availability,
      };
    }

    const existingCartItem = await CartItem.findOne({ userId, productId: data.productId });

    if (existingCartItem) {
      const updatedQuantity = existingCartItem.quantity + quantity;
      const updatedAvailability = this.buildAvailability(product, inventory, updatedQuantity);

      if (!updatedAvailability.isAvailable) {
        return {
          cartItem: null,
          availability: updatedAvailability,
        };
      }

      existingCartItem.quantity = updatedQuantity;
      await existingCartItem.save();
      return {
        cartItem: existingCartItem,
        availability: updatedAvailability,
      };
    }

    const cartItem = await CartItem.create({
      userId,
      productId: data.productId,
      quantity,
    });

    return {
      cartItem,
      availability,
    };
  }

  static async updateCartItem(cartItemId: string, userId: string, data: UpdateCartItemInput) {
    const cartItem = await CartItem.findOne({ cartItemId, userId });

    if (!cartItem) {
      throw new AppError("Cart item not found", 404);
    }

    const product = await Product.findOne({ productId: cartItem.productId });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const inventory = await Inventory.findOne({ productId: cartItem.productId });
    const availability = this.buildAvailability(product, inventory, data.quantity);

    if (!availability.isAvailable) {
      return {
        cartItem: null,
        availability,
      };
    }

    cartItem.quantity = data.quantity;
    await cartItem.save();

    return {
      cartItem,
      availability,
    };
  }

  static async removeCartItem(cartItemId: string, userId: string) {
    const cartItem = await CartItem.findOne({ cartItemId, userId });

    if (!cartItem) {
      throw new AppError("Cart item not found", 404);
    }

    await cartItem.deleteOne();
    return cartItem;
  }

  static async clearCart(userId: string) {
    await CartItem.deleteMany({ userId });
    return {
      cartItems: [],
      summary: {
        totalItems: 0,
        subtotal: 0,
        totalProducts: 0,
        estimatedSavings: 0,
        hasUnavailableItems: false,
      },
    };
  }
}
