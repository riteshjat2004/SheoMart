package com.sheomart.mobile.data.model

data class Category(
    val categoryId: String,
    val name: String,
    val slug: String? = null,
    val icon: String? = null,
    val image: String? = null,
    val description: String? = null
)

data class Product(
    val productId: String,
    val name: String,
    val brand: String? = "SheoMart",
    val price: Double,
    val discount: Int? = null,
    val discountPrice: Double? = null,
    val thumbnail: String? = null,
    val images: List<String> = emptyList(),
    val rating: Double? = null,
    val unit: String? = "Standard pack",
    val quantity: Int = 0,
    val storeId: String? = null,
    val categoryId: String? = null
) {
    val displayPrice: Double
        get() = discountPrice ?: price

    val calculatedDiscountPercent: Int
        get() = discount ?: if (discountPrice != null && price > 0 && discountPrice < price) {
            (((price - discountPrice) / price) * 100).toInt()
        } else 0

    val isOutOfStock: Boolean
        get() = quantity <= 0
}

data class Store(
    val storeId: String,
    val storeName: String,
    val logo: String? = null,
    val banner: String? = null,
    val rating: Double? = null,
    val totalReviews: Int = 0,
    val address: String? = null,
    val city: String? = null,
    val badge: String = "normal", // "royal", "verified", "normal"
    val deliveryEnabled: Boolean = true,
    val pickupOpeningTime: String? = "09:00",
    val pickupClosingTime: String? = "21:00",
    val status: String? = null
)

data class HeroShowcaseItem(
    val id: String,
    val type: String, // "product", "category", "store", "offer"
    val name: String,
    val image: String,
    val productId: String? = null,
    val categoryId: String? = null,
    val storeId: String? = null,
    val rating: Double? = null,
    val deliveryEnabled: Boolean = false,
    val badge: String? = null
)

data class PromotionOffer(
    val offerId: String,
    val title: String,
    val festivalName: String? = null,
    val discountType: String = "percentage",
    val discountValue: Double = 0.0,
    val bannerImage: String? = null,
    val endsAt: String? = null
)


