import { AppError } from "../errors/AppError";
import { Inventory, INVENTORY_STATUS } from "../models/inventory.model";
import { Product } from "../models/product.model";
import { Store } from "../models/store.model";
import { STORE_STATUS } from "../constants/store";
import { UpdateInventoryInput, UpdateInventoryStatusInput } from "../validators/inventory.validator";

export class InventoryService {
  private static async ensureInventory(productId: string) {
    const inventory = await Inventory.findOne({ productId });

    if (!inventory) {
      throw new AppError("Inventory not found", 404);
    }

    return inventory;
  }

  private static async validateOwnership(productId: string, userId: string, role?: string) {
    if (role === "platform_admin") {
      return;
    }

    const product = await Product.findOne({ productId, isActive: true });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const store = await Store.findOne({ ownerId: userId, storeId: product.storeId, status: STORE_STATUS.APPROVED });

    if (!store) {
      throw new AppError("Unauthorized", 403);
    }
  }

  private static updateStatus(inventory: { availableQuantity: number; lowStockThreshold: number; status: string }) {
    if (inventory.status === INVENTORY_STATUS.DISCONTINUED) {
      return inventory.status;
    }

    if (inventory.availableQuantity === 0) {
      inventory.status = INVENTORY_STATUS.OUT_OF_STOCK;
    } else if (inventory.availableQuantity <= inventory.lowStockThreshold) {
      inventory.status = INVENTORY_STATUS.LOW_STOCK;
    } else {
      inventory.status = INVENTORY_STATUS.IN_STOCK;
    }

    return inventory.status;
  }

  private static async syncProductStock(productId: string, availableQuantity: number, userId: string) {
    // Inventory is the source of truth for availability; mirror it to the product document
    // so customer endpoints and cart/checkout flows stay consistent.
    const normalizedQuantity = Math.max(0, availableQuantity);

    await Product.updateOne(
      { productId },
      { $set: { quantity: normalizedQuantity, updatedBy: userId } }
    );
  }

  static async createInventoryForProduct(productId: string, userId: string, initialQuantity = 0) {
    const existing = await Inventory.findOne({ productId });

    if (existing) {
      await this.syncProductStock(productId, existing.availableQuantity, userId);
      return existing;
    }

    const normalizedQuantity = Math.max(0, initialQuantity);
    const inventory = await Inventory.create({
      productId,
      availableQuantity: normalizedQuantity,
      reservedQuantity: 0,
      soldQuantity: 0,
      lowStockThreshold: 5,
      status: this.updateStatus({
        availableQuantity: normalizedQuantity,
        lowStockThreshold: 5,
        status: INVENTORY_STATUS.IN_STOCK,
      }),
      createdBy: userId,
      updatedBy: userId,
    });

    await this.syncProductStock(productId, inventory.availableQuantity, userId);
    return inventory;
  }

  static async getInventory(productId: string, userId: string, role?: string) {
    await this.validateOwnership(productId, userId, role);
    const inventory = await this.ensureInventory(productId);
    return inventory;
  }

  static async updateInventory(productId: string, data: UpdateInventoryInput, userId: string, role?: string) {
    await this.validateOwnership(productId, userId, role);
    const inventory = await this.ensureInventory(productId);

    if (data.availableQuantity !== undefined && data.availableQuantity < 0) {
      throw new AppError("Invalid quantity", 400);
    }

    if (data.reservedQuantity !== undefined && data.reservedQuantity < 0) {
      throw new AppError("Invalid quantity", 400);
    }

    if (data.soldQuantity !== undefined && data.soldQuantity < 0) {
      throw new AppError("Invalid quantity", 400);
    }

    if (data.lowStockThreshold !== undefined && data.lowStockThreshold < 0) {
      throw new AppError("Invalid quantity", 400);
    }

    if (
      data.reservedQuantity !== undefined &&
      data.availableQuantity !== undefined &&
      data.reservedQuantity > data.availableQuantity
    ) {
      throw new AppError("Invalid quantity", 400);
    }

    if (data.soldQuantity !== undefined && data.soldQuantity < inventory.soldQuantity) {
      throw new AppError("Invalid quantity", 400);
    }

    if (data.availableQuantity !== undefined) {
      inventory.availableQuantity = data.availableQuantity;
    }

    if (data.reservedQuantity !== undefined) {
      inventory.reservedQuantity = data.reservedQuantity;
    }

    if (data.soldQuantity !== undefined) {
      inventory.soldQuantity = data.soldQuantity;
    }

    if (data.lowStockThreshold !== undefined) {
      inventory.lowStockThreshold = data.lowStockThreshold;
    }

    if (data.status !== undefined) {
      if (data.status === INVENTORY_STATUS.DISCONTINUED) {
        inventory.status = INVENTORY_STATUS.DISCONTINUED;
      } else {
        inventory.status = data.status;
      }
    } else {
      inventory.status = this.updateStatus(inventory);
    }

    inventory.updatedBy = userId;
    await inventory.save();
    await this.syncProductStock(productId, inventory.availableQuantity, userId);

    return inventory;
  }

  static async updateInventoryStatus(productId: string, data: UpdateInventoryStatusInput, userId: string, role?: string) {
    await this.validateOwnership(productId, userId, role);
    const inventory = await this.ensureInventory(productId);

    if (data.status === INVENTORY_STATUS.DISCONTINUED) {
      inventory.status = INVENTORY_STATUS.DISCONTINUED;
    } else {
      inventory.status = this.updateStatus({
        availableQuantity: inventory.availableQuantity,
        lowStockThreshold: inventory.lowStockThreshold,
        status: inventory.status,
      });
    }

    inventory.updatedBy = userId;
    await inventory.save();
    await this.syncProductStock(productId, inventory.availableQuantity, userId);

    return inventory;
  }
}
