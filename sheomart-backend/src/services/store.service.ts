import { AppError } from "../errors/AppError";
import { STORE_STATUS, StoreStatus } from "../constants/store";
import { Store } from "../models/store.model";
import { User } from "../models/user.model";

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

    return store;
  }

  static async getMyStore(userId: string) {
    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    const store = await Store.findOne({ ownerId: userId });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    return store;
  }

  static async updateMyStore(userId: string, data: Record<string, unknown>) {
    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    const store = await Store.findOne({ ownerId: userId });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    const allowedFields = [
      "description",
      "logo",
      "banner",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];

    for (const key of Object.keys(data)) {
      if (!allowedFields.includes(key)) {
        continue;
      }

      (store as unknown as Record<string, unknown>)[key] = data[key];
    }

    await store.save();

    return store;
  }

  static async getStoreById(storeId: string) {
    const store = await Store.findOne({ storeId });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    return store;
  }

  static async getAllStores() {
    return Store.find({ status: STORE_STATUS.APPROVED }).sort({ createdAt: -1 });
  }

  static async updateStoreStatus(storeId: string, status: string) {
    const allowedStatuses = Object.values(STORE_STATUS);

    if (!allowedStatuses.includes(status as StoreStatus)) {
      throw new AppError("Invalid store status", 400);
    }

    const store = await Store.findOne({ storeId });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    store.status = status as StoreStatus;
    await store.save();

    return store;
  }
}
