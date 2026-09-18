package com.sheomart.mobile.data.repository

import com.sheomart.mobile.data.model.*
import com.sheomart.mobile.utils.SecureTokenStore

/**
 * Aggregator repository for the Customer Dashboard screen.
 *
 * Does NOT own any network logic — it composes the individual feature repositories:
 *   UserRepository        → profile
 *   AddressesRepository   → saved address count
 *   WishlistRepository    → wishlist item count
 *   CartRepository        → cart item count
 *   OrdersRepository      → orders + active-orders counts
 *   PromotionsRepository  → active coupons & offers
 *
 * This keeps each feature repo independently reusable (e.g., CartRepository
 * will be used directly by the Cart screen) while DashboardRepository remains
 * the single injection point for DashboardViewModel.
 */
class DashboardRepository(private val tokenStore: SecureTokenStore) {

    private val userRepo        = UserRepository(tokenStore)
    private val addressesRepo   = AddressesRepository(tokenStore)
    private val wishlistRepo    = WishlistRepository(tokenStore)
    private val cartRepo        = CartRepository(tokenStore)
    private val ordersRepo      = OrdersRepository(tokenStore)
    private val promotionsRepo  = PromotionsRepository(tokenStore)

    // ── Delegated calls ────────────────────────────────────────────────────

    suspend fun getProfile(): Result<CustomerProfile> =
        userRepo.getProfile()

    suspend fun getActiveCoupons(): Result<List<Coupon>> =
        promotionsRepo.getActiveCoupons()

    suspend fun getActiveOffers(): Result<List<PromotionOffer>> =
        promotionsRepo.getActiveOffers()

    /**
     * Assembles the CustomerAccountSummary by querying all 4 sub-services.
     *
     * Every sub-fetch is individually try/catched: a 403 from /addresses or
     * a 500 from /orders must not prevent the rest of the summary from loading.
     * Failures silently default each field to 0.
     */
    suspend fun getAccountSummary(): Result<CustomerAccountSummary> =
        runCatching {
            var addressesCount = 0
            var wishlistCount  = 0
            var cartCount      = 0
            var ordersCount    = 0
            var activeOrders   = 0

            addressesRepo.getAddressCount()
                .onSuccess { addressesCount = it }

            wishlistRepo.getWishlistItemCount()
                .onSuccess { wishlistCount = it }

            cartRepo.getCartItemCount()
                .onSuccess { cartCount = it }

            ordersRepo.getOrderCounts().onSuccess { counts ->
                ordersCount  = counts.total
                activeOrders = counts.active
            }

            CustomerAccountSummary(
                ordersCount          = ordersCount,
                wishlistCount        = wishlistCount,
                cartCount            = cartCount,
                savedAddressesCount  = addressesCount,
                activeOrdersCount    = activeOrders
            )
        }
}
