package com.sheomart.mobile.data.model

// ── Analytics & Overview ──────────────────────────────────────────────────

data class AdminAnalyticsFilters(
    val from: String,
    val to: String,
    val timezone: String = "UTC"
)

data class AdminKpis(
    val customers: Int = 0,
    val stores: Int = 0,
    val products: Int = 0,
    val orders: Int = 0,
    val revenue: Double = 0.0
)

data class AdminTrendPoint(
    val date: String,
    val value: Double
)

data class AdminBreakdownPoint(
    val status: String,
    val count: Int
)

data class AdminAnalyticsTrends(
    val orders: List<AdminTrendPoint> = emptyList(),
    val revenue: List<AdminTrendPoint> = emptyList(),
    val newCustomers: List<AdminTrendPoint> = emptyList(),
    val newStores: List<AdminTrendPoint> = emptyList()
)

data class AdminAnalyticsBreakdowns(
    val ordersByStatus: List<AdminBreakdownPoint> = emptyList(),
    val storesByStatus: List<AdminBreakdownPoint> = emptyList(),
    val productsByStatus: List<AdminBreakdownPoint> = emptyList()
)

data class AdminAnalyticsRange(
    val from: String,
    val to: String,
    val timezone: String
)

data class AdminAnalyticsOverview(
    val range: AdminAnalyticsRange,
    val kpis: AdminKpis,
    val trends: AdminAnalyticsTrends,
    val breakdowns: AdminAnalyticsBreakdowns
)

// ── Store Management ──────────────────────────────────────────────────────

data class AdminStoreItem(
    val storeId: String,
    val storeName: String,
    val ownerId: String? = null,
    val ownerName: String? = null,
    val ownerMobile: String? = null,
    val ownerEmail: String? = null,
    val description: String? = null,
    val logo: String? = null,
    val banner: String? = null,
    val address: String? = null,
    val city: String? = null,
    val state: String? = null,
    val pincode: String? = null,
    val badge: String = "normal", // "normal", "verified", "royal"
    val status: String = "pending", // "pending", "approved", "rejected", "suspended"
    val deliveryEnabled: Boolean = true,
    val rating: Double? = null,
    val totalReviews: Int = 0,
    val createdAt: String? = null
) {
    val isPending: Boolean get() = status.equals("pending", ignoreCase = true)
    val isApproved: Boolean get() = status.equals("approved", ignoreCase = true)
    val isRejected: Boolean get() = status.equals("rejected", ignoreCase = true)
    val isSuspended: Boolean get() = status.equals("suspended", ignoreCase = true)
}

// ── Category Management ───────────────────────────────────────────────────

data class AdminCategoryItem(
    val categoryId: String,
    val name: String,
    val description: String? = null,
    val sortOrder: Int = 0,
    val isActive: Boolean = true,
    val imageUrl: String? = null,
    val createdAt: String? = null
)

// ── Product Management ────────────────────────────────────────────────────

data class AdminProductItem(
    val productId: String,
    val name: String,
    val description: String? = null,
    val brand: String? = "SheoMart",
    val sku: String? = null,
    val price: Double = 0.0,
    val discountPrice: Double? = null,
    val quantity: Int = 0,
    val storeId: String? = null,
    val storeName: String? = null,
    val categoryId: String? = null,
    val categoryName: String? = null,
    val thumbnail: String? = null,
    val images: List<String> = emptyList(),
    val rating: Double? = null,
    val isActive: Boolean = true,
    val isPublished: Boolean = true,
    val inventoryStatus: String = "in_stock", // "in_stock", "low_stock", "out_of_stock", "discontinued", "unavailable"
    val createdAt: String? = null
) {
    val displayPrice: Double get() = discountPrice ?: price
}

data class AdminProductPagination(
    val page: Int = 1,
    val limit: Int = 25,
    val total: Int = 0,
    val totalPages: Int = 0
)

data class AdminProductsResponse(
    val products: List<AdminProductItem> = emptyList(),
    val pagination: AdminProductPagination = AdminProductPagination()
)

// ── Promotion Management (Coupons & Offers) ───────────────────────────────

data class AdminCouponItem(
    val couponId: String,
    val code: String,
    val title: String,
    val discountType: String = "percentage", // "percentage", "flat"
    val discountValue: Double = 0.0,
    val minimumCartValue: Double = 0.0,
    val maximumDiscount: Double? = null,
    val usageLimit: Int? = null,
    val usageCount: Int = 0,
    val oncePerCustomer: Boolean = true,
    val startsAt: String? = null,
    val endsAt: String? = null,
    val isActive: Boolean = true,
    val createdAt: String? = null
) {
    val displayDiscount: String
        get() = if (discountType == "percentage") "${discountValue.toInt()}% OFF" else "₹${discountValue.toInt()} OFF"
}

data class AdminOfferItem(
    val offerId: String,
    val title: String,
    val festivalName: String? = null,
    val discountType: String = "percentage",
    val discountValue: Double = 0.0,
    val categoryIds: List<String> = emptyList(),
    val bannerImage: String? = null,
    val priority: Int = 0,
    val startsAt: String? = null,
    val endsAt: String? = null,
    val isActive: Boolean = true,
    val createdAt: String? = null
) {
    val displayDiscount: String
        get() = if (discountType == "percentage") "${discountValue.toInt()}% OFF" else "₹${discountValue.toInt()} OFF"
}

// ── User Management ───────────────────────────────────────────────────────

data class AdminUserItem(
    val userId: String,
    val name: String,
    val email: String,
    val mobile: String,
    val role: String, // "customer", "store_owner", "platform_admin"
    val isActive: Boolean = true,
    val emailVerified: Boolean = false,
    val phoneVerified: Boolean = false,
    val isCreditApproved: Boolean = false,
    val createdAt: String? = null
)

data class AdminUserPagination(
    val page: Int = 1,
    val limit: Int = 25,
    val total: Int = 0,
    val totalPages: Int = 0
)

data class AdminUsersResponse(
    val users: List<AdminUserItem> = emptyList(),
    val pagination: AdminUserPagination = AdminUserPagination()
)

// ── Platform Fee Settings ─────────────────────────────────────────────────

data class PlatformFeeConfig(
    val amount: Double = 10.0,
    val feeType: String = "FIXED", // "FIXED", "PERCENTAGE"
    val minimumOrderAmount: Double = 0.0,
    val maximumPlatformFee: Double? = null,
    val enabled: Boolean = true
)
