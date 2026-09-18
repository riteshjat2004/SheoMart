package com.sheomart.mobile.data.model

// ── Product Details & Reviews ─────────────────────────────────────────────

data class ProductDetail(
    val productId: String,
    val name: String,
    val description: String? = null,
    val brand: String? = "SheoMart",
    val sku: String? = null,
    val price: Double = 0.0,
    val discountPrice: Double? = null,
    val quantity: Int = 0,
    val categoryId: String? = null,
    val categoryName: String? = null,
    val storeId: String? = null,
    val storeName: String? = null,
    val storeBadge: String = "normal", // "normal", "verified", "royal"
    val thumbnail: String? = null,
    val images: List<String> = emptyList(),
    val rating: Double? = null,
    val totalReviews: Int = 0,
    val isPublished: Boolean = true,
    val isActive: Boolean = true,
    val inventoryStatus: String = "in_stock", // "in_stock", "low_stock", "out_of_stock", "unavailable"
    val reviews: List<ProductReviewItem> = emptyList(),
    val similarProducts: List<Product> = emptyList()
) {
    val displayPrice: Double get() = discountPrice ?: price
    val hasDiscount: Boolean get() = discountPrice != null && discountPrice < price
    val discountPercent: Int get() = if (hasDiscount && price > 0) (((price - discountPrice!!) / price) * 100).toInt() else 0
    val isInStock: Boolean get() = quantity > 0 && inventoryStatus != "out_of_stock" && inventoryStatus != "unavailable"
}

data class ProductReviewItem(
    val reviewId: String,
    val rating: Int = 5,
    val comment: String? = null,
    val userName: String = "Shopper",
    val createdAt: String? = null
)

// ── Search & Explore ──────────────────────────────────────────────────────

data class SearchResults(
    val products: List<SearchProductItem> = emptyList(),
    val stores: List<SearchStoreItem> = emptyList(),
    val categories: List<SearchCategoryItem> = emptyList()
)

data class SearchProductItem(
    val productId: String,
    val name: String,
    val thumbnail: String? = null,
    val discountPrice: Double? = null,
    val categoryName: String? = null
)

data class SearchStoreItem(
    val storeId: String,
    val storeName: String,
    val logo: String? = null,
    val rating: Double? = null,
    val deliveryEnabled: Boolean = true
)

data class SearchCategoryItem(
    val categoryId: String,
    val name: String,
    val image: String? = null
)

// ── Cart ──────────────────────────────────────────────────────────────────

data class CartItem(
    val cartItemId: String,
    val productId: String,
    val productName: String,
    val thumbnail: String? = null,
    val price: Double = 0.0,
    val discountPrice: Double? = null,
    val quantity: Int = 1,
    val storeId: String? = null,
    val storeName: String? = null,
    val stockAvailable: Int = 99
) {
    val unitPrice: Double get() = discountPrice ?: price
    val totalPrice: Double get() = unitPrice * quantity
}

data class CartData(
    val cartId: String? = null,
    val items: List<CartItem> = emptyList(),
    val subtotal: Double = 0.0,
    val platformFee: Double = 10.0,
    val deliveryFee: Double = 0.0,
    val discountAmount: Double = 0.0,
    val totalAmount: Double = 0.0,
    val appliedCouponCode: String? = null
) {
    val totalItems: Int get() = items.sumOf { it.quantity }
}

// ── Wishlist ──────────────────────────────────────────────────────────────

data class WishlistItem(
    val wishlistItemId: String,
    val productId: String,
    val productName: String,
    val thumbnail: String? = null,
    val price: Double = 0.0,
    val discountPrice: Double? = null,
    val rating: Double? = null,
    val storeName: String? = null,
    val inStock: Boolean = true
) {
    val displayPrice: Double get() = discountPrice ?: price
}

// ── Addresses ─────────────────────────────────────────────────────────────

data class AddressItem(
    val addressId: String,
    val title: String = "Home", // "Home", "Work", "Other"
    val addressLine: String,
    val landmark: String? = null,
    val city: String = "Sheopur",
    val state: String = "Madhya Pradesh",
    val pincode: String = "476337",
    val receiverName: String? = null,
    val receiverMobile: String? = null,
    val isDefault: Boolean = false
)

// ── Orders & Checkout ─────────────────────────────────────────────────────

data class OrderItemRecord(
    val productId: String,
    val name: String,
    val quantity: Int,
    val price: Double,
    val thumbnail: String? = null
)

data class CustomerOrder(
    val orderId: String,
    val storeId: String? = null,
    val storeName: String = "SheoMart Local",
    val items: List<OrderItemRecord> = emptyList(),
    val totalAmount: Double = 0.0,
    val deliveryFee: Double = 0.0,
    val platformFee: Double = 10.0,
    val status: String = "pending", // "pending", "confirmed", "dispatched", "out_for_delivery", "delivered", "cancelled"
    val paymentStatus: String = "pending", // "pending", "paid", "failed"
    val paymentMethod: String = "COD", // "COD", "ONLINE"
    val deliveryAddress: String? = null,
    val estimatedDeliveryEta: String? = null,
    val createdAt: String? = null
) {
    val isDelivered: Boolean get() = status.equals("delivered", ignoreCase = true)
    val isCancelled: Boolean get() = status.equals("cancelled", ignoreCase = true)
    val isActiveOrder: Boolean get() = !isDelivered && !isCancelled
}

// ── Notifications ─────────────────────────────────────────────────────────

data class NotificationItem(
    val notificationId: String,
    val title: String,
    val message: String,
    val type: String = "order", // "order", "offer", "system"
    val isRead: Boolean = false,
    val createdAt: String? = null
)
