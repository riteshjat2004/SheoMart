package com.sheomart.mobile.data.model

data class SellerStoreProfile(
    val storeId: String,
    val storeName: String,
    val description: String? = null,
    val logo: String? = null,
    val banner: String? = null,
    val address: String? = null,
    val city: String? = null,
    val state: String? = null,
    val pincode: String? = null,
    val badge: String = "normal", // "normal", "verified", "royal"
    val status: String = "approved", // "pending", "approved", "suspended"
    val deliveryEnabled: Boolean = true,
    val rating: Double? = null,
    val totalReviews: Int = 0
)

data class SellerDashboardStats(
    val todaysRevenue: Double = 0.0,
    val pendingOrdersCount: Int = 0,
    val lowStockCount: Int = 0,
    val activeProductsCount: Int = 0
)

data class SellerProductItem(
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
    val thumbnail: String? = null,
    val isActive: Boolean = true,
    val isPublished: Boolean = true,
    val inventoryStatus: String = "in_stock"
) {
    val displayPrice: Double get() = discountPrice ?: price
}

data class SellerOrderItem(
    val orderId: String,
    val customerName: String? = "Customer",
    val customerMobile: String? = null,
    val items: List<OrderItemRecord> = emptyList(),
    val totalAmount: Double = 0.0,
    val status: String = "pending", // "pending", "confirmed", "dispatched", "delivered", "cancelled"
    val paymentStatus: String = "pending",
    val deliveryEta: String? = null,
    val createdAt: String? = null
)

data class SellerInventoryItem(
    val productId: String,
    val productName: String,
    val sku: String? = null,
    val quantity: Int = 0,
    val status: String = "in_stock",
    val thumbnail: String? = null,
    val price: Double = 0.0
)
