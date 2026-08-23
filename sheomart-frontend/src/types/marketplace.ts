export interface CategoryItem {
  _id?: string;
  categoryId?: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  image?: string;
  isActive?: boolean;
  parentCategory?: string | null;
  sortOrder?: number;
}

export interface ProductItem {
  _id?: string;
  productId?: string;
  storeId?: string;
  categoryId?: string;
  name: string;
  description?: string;
  price: number;
  discount?: number;
  discountPrice?: number;
  thumbnail?: string;
  images?: string[];
  rating?: number;
  unit?: string;
  sku?: string;
  brand?: string;
  quantity?: number;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  isPublished?: boolean;
  category?: string;
}

export interface CartItem {
  cartItemId: string;
  quantity: number;
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

export interface StoreItem {
  _id?: string;
  storeId?: string;
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
  deliveryTime?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status?: string;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
