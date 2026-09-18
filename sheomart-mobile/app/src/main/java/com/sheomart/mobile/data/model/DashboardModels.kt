package com.sheomart.mobile.data.model

data class CustomerProfile(
    val userId: String,
    val name: String,
    val email: String,
    val mobile: String,
    val role: String,
    val createdAt: String? = null,
    val emailVerified: Boolean = false,
    val phoneVerified: Boolean = false,
    val isCreditApproved: Boolean = false,
    val defaultAddress: String? = null
)

data class CustomerAccountSummary(
    val ordersCount: Int = 0,
    val wishlistCount: Int = 0,
    val cartCount: Int = 0,
    val savedAddressesCount: Int = 0,
    val activeOrdersCount: Int = 0
)

data class Coupon(
    val couponId: String,
    val code: String,
    val title: String,
    val discountType: String = "percentage",
    val discountValue: Double = 0.0,
    val minimumCartValue: Double = 0.0,
    val endsAt: String? = null
) {
    val displayDiscount: String
        get() = if (discountType == "percentage") {
            "${discountValue.toInt()}% OFF"
        } else {
            "₹${discountValue.toInt()} OFF"
        }
}

data class DashboardAction(
    val id: String,
    val title: String,
    val subtitle: String,
    val icon: String,
    val badgeCount: Int? = null,
    val route: String
)
