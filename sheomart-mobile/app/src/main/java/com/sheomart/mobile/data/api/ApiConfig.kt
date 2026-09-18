package com.sheomart.mobile.data.api

/**
 * Centralized API configuration for SheoMart Mobile.
 *
 * Single source of truth for backend endpoints.
 * Production Base URL: https://sheomart.onrender.com/api/v1
 */
object ApiConfig {
    const val PRODUCTION_ROOT_URL = "https://sheomart.onrender.com"
    const val BASE_URL = "https://sheomart.onrender.com/api/v1"

    /**
     * Resolves an API path to a full URL.
     * If the path starts with "/api/" (such as "/api/home/..."), it routes via the root domain.
     * Otherwise it routes via BASE_URL (/api/v1).
     */
    fun urlFor(path: String): String {
        val cleanPath = if (path.startsWith("/")) path else "/$path"
        return if (cleanPath.startsWith("/api/")) {
            "$PRODUCTION_ROOT_URL$cleanPath"
        } else {
            "$BASE_URL$cleanPath"
        }
    }
}