package com.sheomart.mobile.navigation

/**
 * Centralized navigation route constants for the SheoMart application (Customer + Admin + Seller).
 *
 * All nav-graph composable() registrations and navigate() calls must
 * reference these constants instead of inline string literals.
 */
object Routes {

    // ── Auth ──────────────────────────────────────────────────────────────
    const val Login    = "login"
    const val Register = "register"

    // ── Main customer tabs ─────────────────────────────────────────────────
    const val Home     = "home"
    const val Explore  = "explore"
    const val Cart     = "cart"
    const val Wishlist = "wishlist"
    const val Profile  = "profile"

    // ── Customer Detail / action destinations ──────────────────────────────
    const val Search        = "search"
    const val Checkout      = "checkout"
    const val Orders        = "orders"
    const val Addresses     = "addresses"
    const val Coupons       = "coupons"
    const val Notifications = "notifications"
    const val Support       = "support"
    const val About         = "about"
    const val EditProfile   = "edit_profile"

    // ── Customer Parameterised routes ──────────────────────────────────────
    const val CategoryRoute = "category/{categoryId}"
    const val ProductRoute  = "product/{productId}"
    const val StoreRoute    = "store/{storeId}"

    // ── Seller Merchant routes ─────────────────────────────────────────────
    const val SellerDashboard = "seller_dashboard"
    const val SellerProducts  = "seller_products"
    const val SellerOrders    = "seller_orders"
    const val SellerInventory = "seller_inventory"

    // ── Admin Workspace routes ─────────────────────────────────────────────
    const val AdminDashboard  = "admin_dashboard"
    const val AdminStores     = "admin_stores"
    const val AdminCategories = "admin_categories"
    const val AdminProducts   = "admin_products"
    const val AdminCoupons    = "admin_coupons"
    const val AdminOffers     = "admin_offers"
    const val AdminUsers      = "admin_users"
    const val AdminAnalytics  = "admin_analytics"
    const val AdminSettings   = "admin_settings"

    // ── Route builders (for navigate() call-sites) ─────────────────────────
    fun category(id: String) = "category/$id"
    fun product(id: String)  = "product/$id"
    fun store(id: String)    = "store/$id"
}
