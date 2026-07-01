import type { CategoryItem, ProductItem, StoreItem } from "@/types/marketplace";

export const mockCategories: CategoryItem[] = [
  { name: "Fresh Fruits", description: "Daily harvest", icon: "🍎", image: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=900&q=80" },
  { name: "Vegetables", description: "Crisp picks", icon: "🥕", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80" },
  { name: "Pantry", description: "Kitchen essentials", icon: "🫙", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80" },
  { name: "Beverages", description: "Cool refreshment", icon: "🥤", image: "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&w=900&q=80" },
];

export const mockProducts: ProductItem[] = [
  { name: "Golden Mangoes", price: 179, discount: 15, rating: 4.7, thumbnail: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=80", unit: "kg" },
  { name: "Organic Spinach", price: 49, discount: 10, rating: 4.8, thumbnail: "https://images.unsplash.com/photo-1576045051385-7570b7d2f7d6?auto=format&fit=crop&w=900&q=80", unit: "bunch" },
  { name: "Cold-Pressed Almond Milk", price: 129, discount: 8, rating: 4.6, thumbnail: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=900&q=80", unit: "1L" },
  { name: "Artisan Bread", price: 89, discount: 12, rating: 4.5, thumbnail: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80", unit: "loaf" },
];

export const mockStores: StoreItem[] = [
  { name: "Verdant Fresh", rating: 4.9, deliveryTime: "15-20 min", address: "North Avenue" },
  { name: "Home Pantry Co.", rating: 4.8, deliveryTime: "20-25 min", address: "Main Market" },
  { name: "Daily Basket", rating: 4.7, deliveryTime: "12-18 min", address: "Green Park" },
];
