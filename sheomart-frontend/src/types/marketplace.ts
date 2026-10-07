export interface CategoryItem {
  _id?: string;
  categoryId?: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  image?: string | { url: string; publicId: string };
  isActive?: boolean;
  isDeleted?: boolean;
  productCount?: number;
  activeProductCount?: number;
  parentCategory?: string | null;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  variantId: string;
  label: string; // e.g. "250 gm", "500 gm", "1 kg", "500 ml", "1 L"
  unit: string; // "gm", "kg", "ml", "L", "piece", etc.
  value: number;
  price: number;
  discountPrice?: number;
  sku?: string;
  stock?: number;
  packQuantity?: number;
}

export interface NutritionalInfo {
  servingSize?: string;
  energy?: string;
  protein?: string;
  carbs?: string;
  fats?: string;
}

export interface ProductItem {
  _id?: string;
  productId?: string;
  sourceProductId?: string;
  storeId?: string;
  categoryId?: string;
  name: string;
  description?: string;
  price: number;
  discount?: number;
  discountPrice?: number;
  sellingType?: "PIECE" | "WEIGHT" | "VOLUME";
  baseUnit?: string;
  unitLabel?: string;
  minQuantity?: number;
  stepQuantity?: number;
  allowCustomQuantity?: boolean;
  stockTrackingMode?: "SEPARATE" | "SHARED";
  hasNutritionalInfo?: boolean;
  nutritionalInfo?: NutritionalInfo | null;
  variants?: ProductVariant[];
  thumbnail?: string;
  images?: string[];
  image?: {
    url: string;
    publicId: string;
  };
  rating?: number;
  unit?: string;
  sku?: string;
  brand?: string;
  quantity?: number;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  isPublished?: boolean;
  isDeleted?: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isTrending?: boolean;
  inventoryStatus?: string;
  category?: string;
  store?: string;
  storeName?: string;
  storePincode?: string;
  storeCity?: string;
}

export interface CartItem {
  cartItemId: string;
  quantity: number;
  variantId?: string;
  variantLabel?: string;
  unitPrice?: number;
  unitDiscountPrice?: number;
  storeId?: string;
  product: ProductItem;
  isAvailable?: boolean;
  availabilityMessage?: string;
  maxAvailableQuantity?: number;
}

export interface WishlistItem {
  wishlistItemId: string;
  product: ProductItem;
}

export type StoreBadge = "normal" | "verified" | "royal";

export interface StoreItem {
  _id?: string;
  storeId?: string;
  slug?: string;
  ownerId?: string;
  name?: string;
  storeName?: string;
  description?: string;
  logo?: string;
  banner?: string;
  email?: string;
  phone?: string;
  rating?: number;
  totalReviews?: number;
  pickupOpeningTime?: string;
  pickupClosingTime?: string;
  pickupEnabled?: boolean;
  deliveryEnabled?: boolean;
  supportsPickup?: boolean;
  supportsDelivery?: boolean;
  deliveryFee?: number;
  freeDeliveryAbove?: number;
  freeDeliveryThreshold?: number;
  deliveryRadiusKm?: number;
  preparationTimeMinutes?: number;
  pickupInstructions?: string;
  pickupAddress?: string;
  latitude?: number;
  longitude?: number;
  deliverySlots?: import("@/services/store").DeliverySlot[];
  deliveryTime?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  badge: StoreBadge;
  status?: string;
  isVerified?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  approvedAt?: string | null;
  approvedBy?: string | null;
  seller?: {
    name?: string;
    email?: string;
    phone?: string;
    registeredAt?: string;
  } | null;
  stats?: {
    totalProducts: number;
    activeProducts: number;
    outOfStockProducts: number;
    totalCategories: number;
  };
  createdAt?: string;
  updatedAt?: string;
}
