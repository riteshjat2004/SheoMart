import { AppError } from "../errors/AppError";
import { STORE_STATUS, StoreStatus } from "../constants/store";
import { USER_ROLES } from "../constants/roles";
import { Store } from "../models/store.model";
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

    for (const key of Object.keys(data)) {
      if (!allowedStoreUpdateFields.includes(key as (typeof allowedStoreUpdateFields)[number])) {
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

  static async getAllStores(location?: { pincode?: string; city?: string; state?: string }) {
    const stores = await Store.find({ status: STORE_STATUS.APPROVED }).sort({ createdAt: -1 }).lean();
    const normalized = {
      pincode: location?.pincode?.trim().toLowerCase(),
      city: location?.city?.trim().toLowerCase(),
      state: location?.state?.trim().toLowerCase(),
    };

    if (!normalized.pincode && !normalized.city && !normalized.state) return stores.slice(0, 6);

    const rank = (store: (typeof stores)[number]) => {
      if (normalized.pincode && store.pincode?.trim().toLowerCase() === normalized.pincode) return 0;
      if (normalized.city && store.city?.trim().toLowerCase() === normalized.city) return 1;
      if (normalized.state && store.state?.trim().toLowerCase() === normalized.state) return 3;
      return 4;
    };

    return stores.filter((store) => rank(store) < 4).sort((first, second) => rank(first) - rank(second)).slice(0, 6);
  }

  static async getAdminStores() {
    return Store.find({}).sort({ createdAt: -1 });
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
