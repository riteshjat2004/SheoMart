import { AppError } from "../errors/AppError";
import { STORE_STATUS, StoreStatus } from "../constants/store";
import { USER_ROLES } from "../constants/roles";
import { Store, STORE_BADGE } from "../models/store.model";
import { User } from "../models/user.model";
import { allowedStoreUpdateFields } from "../validators/store.validator";

interface StoreCreateInput {
  storeName?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export class StoreService {
  static toFulfillmentResponse(source: object, activeSlotsOnly = false): Record<string, unknown> {
    const store = source as Record<string, unknown>;
    const supportsPickup = typeof store.supportsPickup === "boolean" ? store.supportsPickup : store.pickupEnabled !== false;
    const supportsDelivery = typeof store.supportsDelivery === "boolean" ? store.supportsDelivery : store.deliveryEnabled === true;
    const rawSlots = Array.isArray(store.deliverySlots) ? store.deliverySlots : [];
    return {
      ...store,
      supportsPickup,
      supportsDelivery,
      pickupEnabled: supportsPickup,
      deliveryEnabled: supportsDelivery,
      deliveryFee: typeof store.deliveryFee === "number" ? store.deliveryFee : 0,
      freeDeliveryAbove: typeof store.freeDeliveryAbove === "number" ? store.freeDeliveryAbove : typeof store.freeDeliveryThreshold === "number" ? store.freeDeliveryThreshold : 0,
      freeDeliveryThreshold: typeof store.freeDeliveryThreshold === "number" ? store.freeDeliveryThreshold : typeof store.freeDeliveryAbove === "number" ? store.freeDeliveryAbove : 0,
      deliveryRadiusKm: typeof store.deliveryRadiusKm === "number" ? store.deliveryRadiusKm : 0,
      preparationTimeMinutes: typeof store.preparationTimeMinutes === "number" ? store.preparationTimeMinutes : 30,
      pickupInstructions: typeof store.pickupInstructions === "string" ? store.pickupInstructions : "",
      pickupAddress: typeof store.pickupAddress === "string" ? store.pickupAddress : "",
      deliverySlots: rawSlots.map((slot) => { const value = slot as Record<string, unknown>; const id = typeof value.id === "string" ? value.id : value.slotId; const active = typeof value.active === "boolean" ? value.active : value.isActive === true; return { ...value, id, slotId: id, active, isActive: active }; }).filter((slot) => !activeSlotsOnly || slot.active === true),
    };
  }
  private static generateSlug(storeName: string) {
    const baseSlug = storeName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    return baseSlug || "store";
  }

  private static async buildUniqueSlug(storeName: string) {
    const baseSlug = this.generateSlug(storeName);
    let slug = baseSlug;

    while (await Store.findOne({ slug })) {
      const randomSuffix = Math.random().toString(36).slice(2, 8);
      slug = `${baseSlug}-${randomSuffix}`;
    }

    return slug;
  }

  static async createStore(userId: string, data: StoreCreateInput) {
    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    const existingUser = await User.findOne({ userId });

    if (!existingUser) {
      throw new AppError("User not found", 404);
    }

    const existingStore = await Store.findOne({ ownerId: userId });

    if (existingStore) {
      throw new AppError("You already own a store", 409);
    }

    const storeName = typeof data.storeName === "string" ? data.storeName : "";
    const description = typeof data.description === "string" ? data.description : "";
    const email = typeof data.email === "string" ? data.email : "";
    const phone = typeof data.phone === "string" ? data.phone : "";
    const address = typeof data.address === "string" ? data.address : "";
    const city = typeof data.city === "string" ? data.city : "";
    const state = typeof data.state === "string" ? data.state : "";
    const pincode = typeof data.pincode === "string" ? data.pincode : "";

    const slug = await this.buildUniqueSlug(storeName);

    const store = await Store.create({
      ownerId: userId,
      storeName,
      slug,
      description,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      status: STORE_STATUS.PENDING,
      isVerified: false,
      rating: 0,
      totalReviews: 0,
    });

    return StoreService.toFulfillmentResponse(store.toObject()) as unknown as typeof store;
  }

  static async getMyStore(userId: string) {
    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    const store = await Store.findOne({ ownerId: userId });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    return StoreService.toFulfillmentResponse(store.toObject()) as unknown as typeof store;
  }

  static async updateMyStore(userId: string, data: Record<string, unknown>) {
    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    const store = await Store.findOne({ ownerId: userId });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    for (const key of Object.keys(data)) {
      if (!allowedStoreUpdateFields.includes(key as (typeof allowedStoreUpdateFields)[number])) {
        continue;
      }

      (store as unknown as Record<string, unknown>)[key] = data[key];
    }

    const pickupEnabled = data.supportsPickup ?? data.pickupEnabled ?? store.pickupEnabled;
    const deliveryEnabled = data.supportsDelivery ?? data.deliveryEnabled ?? store.deliveryEnabled;
    if (pickupEnabled === false && deliveryEnabled === false) {
      throw new AppError("Enable pickup or delivery before saving store settings", 400);
    }
    const slots = Array.isArray(data.deliverySlots) ? data.deliverySlots as Array<{ startTime: string; endTime: string }> : store.deliverySlots;
    for (let index = 0; index < slots.length; index += 1) {
      if (slots[index].startTime >= slots[index].endTime) throw new AppError("Delivery slot end time must be after start time", 400);
      for (let otherIndex = index + 1; otherIndex < slots.length; otherIndex += 1) {
        if (slots[index].startTime < slots[otherIndex].endTime && slots[otherIndex].startTime < slots[index].endTime) throw new AppError("Delivery slots cannot overlap", 400);
      }
    }
    store.pickupEnabled = Boolean(pickupEnabled);
    store.deliveryEnabled = Boolean(deliveryEnabled);
    store.supportsPickup = Boolean(pickupEnabled);
    store.supportsDelivery = Boolean(deliveryEnabled);

    await store.save();

    return StoreService.toFulfillmentResponse(store.toObject()) as unknown as typeof store;
  }

  static async getStoreById(storeId: string) {
    const store = await Store.findOne({ storeId });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    return StoreService.toFulfillmentResponse(store.toObject(), true) as unknown as typeof store;
  }

  static async getAllStores(location?: { pincode?: string; city?: string; state?: string }) {
    const stores = await Store.find({ status: STORE_STATUS.APPROVED })
      .sort({ createdAt: -1 })
      .lean();
    const pincode = location?.pincode?.trim().toLowerCase();

    const normalizedStores = stores.map((store) => StoreService.toFulfillmentResponse(store, true));
    if (!pincode) return normalizedStores;

    return normalizedStores.filter((store) => typeof store.pincode === "string" && store.pincode.trim().toLowerCase() === pincode);
  }

  static async getAdminStores() {
    const stores = await Store.find({}).sort({ createdAt: -1 }).lean();
    return stores.map((store) => StoreService.toFulfillmentResponse(store, true));
  }

  static async updateStoreBadge(storeId: string, badge: STORE_BADGE) {
    const store = await Store.findOne({ storeId });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    store.badge = badge;
    await store.save();

    return store;
  }

  static async updateStoreStatus(storeId: string, status: string, adminUserId?: string) {
    const allowedStatuses = Object.values(STORE_STATUS);

    if (!allowedStatuses.includes(status as StoreStatus)) {
      throw new AppError("Invalid store status", 400);
    }

    const store = await Store.findOne({ storeId });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    if (status === STORE_STATUS.APPROVED) {
      store.status = STORE_STATUS.APPROVED;
      store.approvedAt = new Date();
      store.approvedBy = adminUserId ?? null;

      const owner = await User.findOne({ userId: store.ownerId });

      if (!owner) {
        throw new AppError("Store owner not found", 404);
      }

      owner.role = USER_ROLES.STORE_OWNER;
      await owner.save();
    } else {
      store.status = status as StoreStatus;
      store.approvedAt = null;
      store.approvedBy = null;
    }

    await store.save();

    return store;
  }
}
