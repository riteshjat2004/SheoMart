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
}

export interface ProductItem {
  _id?: string;
  productId?: string;
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
  isActive?: boolean;
  isPublished?: boolean;
  category?: string;
}

export interface StoreItem {
  _id?: string;
  storeId?: string;
  name?: string;
  storeName?: string;
  description?: string;
  logo?: string;
  banner?: string;
  rating?: number;
  totalReviews?: number;
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
