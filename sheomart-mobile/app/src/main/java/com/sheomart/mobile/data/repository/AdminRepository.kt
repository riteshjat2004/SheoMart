package com.sheomart.mobile.data.repository

import com.sheomart.mobile.data.api.ApiConfig
import com.sheomart.mobile.data.model.*
import com.sheomart.mobile.utils.SecureTokenStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

class AdminRepository(private val tokenStore: SecureTokenStore) {

    // ── 1. Analytics & Overview ───────────────────────────────────────────

    suspend fun getAnalyticsOverview(from: String, to: String, timezone: String = "UTC"): Result<AdminAnalyticsOverview> =
        withContext(Dispatchers.IO) {
            runCatching {
                val qFrom = URLEncoder.encode(from, "UTF-8")
                val qTo = URLEncoder.encode(to, "UTF-8")
                val qTz = URLEncoder.encode(timezone, "UTF-8")
                val json = request("/analytics/admin/overview?from=$qFrom&to=$qTo&timezone=$qTz", "GET")
                val data = json.getJSONObject("data")

                val rangeObj = data.getJSONObject("range")
                val range = AdminAnalyticsRange(
                    from = rangeObj.getString("from"),
                    to = rangeObj.getString("to"),
                    timezone = rangeObj.getString("timezone")
                )

                val kpiObj = data.getJSONObject("kpis")
                val kpis = AdminKpis(
                    customers = kpiObj.optInt("customers", 0),
                    stores = kpiObj.optInt("stores", 0),
                    products = kpiObj.optInt("products", 0),
                    orders = kpiObj.optInt("orders", 0),
                    revenue = kpiObj.optDouble("revenue", 0.0)
                )

                val trendsObj = data.optJSONObject("trends")
                val trends = AdminAnalyticsTrends(
                    orders = parseTrendPoints(trendsObj?.optJSONArray("orders")),
                    revenue = parseTrendPoints(trendsObj?.optJSONArray("revenue")),
                    newCustomers = parseTrendPoints(trendsObj?.optJSONArray("newCustomers")),
                    newStores = parseTrendPoints(trendsObj?.optJSONArray("newStores"))
                )

                val breakdownsObj = data.optJSONObject("breakdowns")
                val breakdowns = AdminAnalyticsBreakdowns(
                    ordersByStatus = parseBreakdownPoints(breakdownsObj?.optJSONArray("ordersByStatus")),
                    storesByStatus = parseBreakdownPoints(breakdownsObj?.optJSONArray("storesByStatus")),
                    productsByStatus = parseBreakdownPoints(breakdownsObj?.optJSONArray("productsByStatus"))
                )

                AdminAnalyticsOverview(range, kpis, trends, breakdowns)
            }
        }

    private fun parseTrendPoints(array: JSONArray?): List<AdminTrendPoint> {
        if (array == null) return emptyList()
        val list = mutableListOf<AdminTrendPoint>()
        for (i in 0 until array.length()) {
            val obj = array.getJSONObject(i)
            list.add(AdminTrendPoint(obj.optString("date", ""), obj.optDouble("value", 0.0)))
        }
        return list
    }

    private fun parseBreakdownPoints(array: JSONArray?): List<AdminBreakdownPoint> {
        if (array == null) return emptyList()
        val list = mutableListOf<AdminBreakdownPoint>()
        for (i in 0 until array.length()) {
            val obj = array.getJSONObject(i)
            list.add(AdminBreakdownPoint(obj.optString("status", ""), obj.optInt("count", 0)))
        }
        return list
    }

    // ── 2. Store Management ───────────────────────────────────────────────

    suspend fun getAdminStores(): Result<List<AdminStoreItem>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/stores/admin", "GET")
            val array = json.getJSONObject("data").getJSONArray("stores")
            val list = mutableListOf<AdminStoreItem>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                val ownerObj = obj.optJSONObject("owner") ?: obj.optJSONObject("ownerId")
                list.add(
                    AdminStoreItem(
                        storeId = obj.optString("storeId", obj.optString("_id", "$i")),
                        storeName = obj.optString("storeName", obj.optString("name", "Store")),
                        ownerId = ownerObj?.optString("userId", ownerObj.optString("_id")),
                        ownerName = ownerObj?.optString("name"),
                        ownerMobile = ownerObj?.optString("mobile"),
                        ownerEmail = ownerObj?.optString("email"),
                        description = obj.optString("description").takeIf { it.isNotBlank() },
                        logo = obj.optString("logo").takeIf { it.isNotBlank() },
                        banner = obj.optString("banner").takeIf { it.isNotBlank() },
                        address = obj.optString("address").takeIf { it.isNotBlank() },
                        city = obj.optString("city").takeIf { it.isNotBlank() },
                        state = obj.optString("state").takeIf { it.isNotBlank() },
                        pincode = obj.optString("pincode").takeIf { it.isNotBlank() },
                        badge = obj.optString("badge", "normal"),
                        status = obj.optString("status", "pending"),
                        deliveryEnabled = obj.optBoolean("deliveryEnabled", true),
                        rating = if (obj.has("rating")) obj.optDouble("rating") else null,
                        totalReviews = obj.optInt("totalReviews", 0),
                        createdAt = obj.optString("createdAt").takeIf { it.isNotBlank() }
                    )
                )
            }
            list
        }
    }

    suspend fun updateStoreStatus(storeId: String, status: String): Result<Boolean> =
        withContext(Dispatchers.IO) {
            runCatching {
                val body = JSONObject().put("status", status)
                request("/stores/$storeId/status", "PATCH", body)
                true
            }
        }

    suspend fun updateStoreBadge(storeId: String, badge: String): Result<Boolean> =
        withContext(Dispatchers.IO) {
            runCatching {
                val body = JSONObject().put("badge", badge)
                request("/stores/$storeId/badge", "PATCH", body)
                true
            }
        }

    // ── 3. Category Management ────────────────────────────────────────────

    suspend fun getCategories(): Result<List<AdminCategoryItem>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/categories", "GET")
            val array = when {
                json.optJSONObject("data")?.optJSONArray("categories") != null ->
                    json.getJSONObject("data").getJSONArray("categories")
                json.optJSONArray("data") != null -> json.getJSONArray("data")
                else -> JSONArray()
            }
            val list = mutableListOf<AdminCategoryItem>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                list.add(
                    AdminCategoryItem(
                        categoryId = obj.optString("categoryId", obj.optString("_id", "$i")),
                        name = obj.getString("name"),
                        description = obj.optString("description").takeIf { it.isNotBlank() },
                        sortOrder = obj.optInt("sortOrder", 0),
                        isActive = obj.optBoolean("isActive", true),
                        imageUrl = obj.optString("imageUrl", obj.optString("image", "")).takeIf { it.isNotBlank() },
                        createdAt = obj.optString("createdAt").takeIf { it.isNotBlank() }
                    )
                )
            }
            list
        }
    }

    suspend fun createCategory(
        name: String,
        description: String,
        sortOrder: Int,
        isActive: Boolean,
        imageUrl: String?
    ): Result<AdminCategoryItem> = withContext(Dispatchers.IO) {
        runCatching {
            val body = JSONObject().apply {
                put("name", name)
                put("description", description)
                put("sortOrder", sortOrder)
                put("isActive", isActive)
                if (!imageUrl.isNullOrBlank()) put("imageUrl", imageUrl)
            }
            val json = request("/categories", "POST", body)
            val catObj = json.getJSONObject("data").getJSONObject("category")
            AdminCategoryItem(
                categoryId = catObj.optString("categoryId", catObj.optString("_id", "")),
                name = catObj.getString("name"),
                description = catObj.optString("description"),
                sortOrder = catObj.optInt("sortOrder", 0),
                isActive = catObj.optBoolean("isActive", true),
                imageUrl = catObj.optString("imageUrl", catObj.optString("image", "")).takeIf { it.isNotBlank() }
            )
        }
    }

    suspend fun updateCategory(
        categoryId: String,
        name: String,
        description: String,
        sortOrder: Int,
        isActive: Boolean,
        imageUrl: String?
    ): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            val body = JSONObject().apply {
                put("name", name)
                put("description", description)
                put("sortOrder", sortOrder)
                put("isActive", isActive)
                if (!imageUrl.isNullOrBlank()) put("imageUrl", imageUrl)
            }
            request("/categories/$categoryId", "PATCH", body)
            true
        }
    }

    suspend fun deleteCategory(categoryId: String): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            request("/categories/$categoryId", "DELETE")
            true
        }
    }

    suspend fun updateCategoryStatus(categoryId: String, isActive: Boolean): Result<Boolean> =
        withContext(Dispatchers.IO) {
            runCatching {
                val body = JSONObject().put("isActive", isActive)
                request("/categories/$categoryId/status", "PATCH", body)
                true
            }
        }

    // ── 4. Product Catalog & Inventory ────────────────────────────────────

    suspend fun getAdminProducts(
        search: String? = null,
        storeId: String? = null,
        categoryId: String? = null,
        inventoryStatus: String? = null,
        isActive: Boolean? = null,
        isPublished: Boolean? = null,
        page: Int = 1,
        limit: Int = 25
    ): Result<AdminProductsResponse> = withContext(Dispatchers.IO) {
        runCatching {
            val params = mutableListOf("page=$page", "limit=$limit")
            if (!search.isNullOrBlank()) params.add("search=${URLEncoder.encode(search, "UTF-8")}")
            if (!storeId.isNullOrBlank()) params.add("storeId=$storeId")
            if (!categoryId.isNullOrBlank()) params.add("categoryId=$categoryId")
            if (!inventoryStatus.isNullOrBlank()) params.add("inventoryStatus=$inventoryStatus")
            if (isActive != null) params.add("isActive=$isActive")
            if (isPublished != null) params.add("isPublished=$isPublished")

            val queryString = params.joinToString("&")
            val json = request("/products/admin?$queryString", "GET")
            val data = json.getJSONObject("data")

            val array = data.getJSONArray("products")
            val list = mutableListOf<AdminProductItem>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                val storeObj = obj.optJSONObject("store") ?: obj.optJSONObject("storeId")
                val categoryObj = obj.optJSONObject("category") ?: obj.optJSONObject("categoryId")

                val imagesList = mutableListOf<String>()
                val imgArr = obj.optJSONArray("images")
                if (imgArr != null) {
                    for (j in 0 until imgArr.length()) {
                        imagesList.add(imgArr.optString(j, ""))
                    }
                }

                list.add(
                    AdminProductItem(
                        productId = obj.optString("productId", obj.optString("_id", "$i")),
                        name = obj.getString("name"),
                        description = obj.optString("description").takeIf { it.isNotBlank() },
                        brand = obj.optString("brand", "SheoMart"),
                        sku = obj.optString("sku").takeIf { it.isNotBlank() },
                        price = obj.optDouble("price", 0.0),
                        discountPrice = if (obj.has("discountPrice")) obj.optDouble("discountPrice") else null,
                        quantity = obj.optInt("quantity", 0),
                        storeId = storeObj?.optString("storeId", storeObj.optString("_id")),
                        storeName = storeObj?.optString("storeName", storeObj.optString("name")),
                        categoryId = categoryObj?.optString("categoryId", categoryObj.optString("_id")),
                        categoryName = categoryObj?.optString("name"),
                        thumbnail = obj.optString("thumbnail", obj.optString("imageUrl", "")).takeIf { it.isNotBlank() },
                        images = imagesList,
                        rating = if (obj.has("rating")) obj.optDouble("rating") else null,
                        isActive = obj.optBoolean("isActive", true),
                        isPublished = obj.optBoolean("isPublished", true),
                        inventoryStatus = obj.optString("inventoryStatus", "in_stock"),
                        createdAt = obj.optString("createdAt").takeIf { it.isNotBlank() }
                    )
                )
            }

            val pagObj = data.optJSONObject("pagination")
            val pagination = AdminProductPagination(
                page = pagObj?.optInt("page", page) ?: page,
                limit = pagObj?.optInt("limit", limit) ?: limit,
                total = pagObj?.optInt("total", list.size) ?: list.size,
                totalPages = pagObj?.optInt("totalPages", 1) ?: 1
            )

            AdminProductsResponse(products = list, pagination = pagination)
        }
    }

    suspend fun updateProductStatus(productId: String, isActive: Boolean): Result<Boolean> =
        withContext(Dispatchers.IO) {
            runCatching {
                val body = JSONObject().put("isActive", isActive)
                request("/products/$productId/status", "PATCH", body)
                true
            }
        }

    suspend fun updateInventory(productId: String, quantity: Int): Result<Boolean> =
        withContext(Dispatchers.IO) {
            runCatching {
                val body = JSONObject().put("quantity", quantity)
                request("/inventory/$productId", "PATCH", body)
                true
            }
        }

    suspend fun updateInventoryStatus(productId: String, status: String): Result<Boolean> =
        withContext(Dispatchers.IO) {
            runCatching {
                val body = JSONObject().put("status", status)
                request("/inventory/$productId/status", "PATCH", body)
                true
            }
        }

    // ── 5. Promotions: Coupons & Offers ───────────────────────────────────

    suspend fun getAdminCoupons(): Result<List<AdminCouponItem>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/promotions/admin/coupons", "GET")
            val array = when {
                json.optJSONObject("data")?.optJSONArray("coupons") != null ->
                    json.getJSONObject("data").getJSONArray("coupons")
                json.optJSONArray("data") != null -> json.getJSONArray("data")
                else -> JSONArray()
            }
            val list = mutableListOf<AdminCouponItem>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                list.add(
                    AdminCouponItem(
                        couponId = obj.optString("couponId", obj.optString("_id", "$i")),
                        code = obj.getString("code"),
                        title = obj.optString("title", "Coupon"),
                        discountType = obj.optString("discountType", "percentage"),
                        discountValue = obj.optDouble("discountValue", 0.0),
                        minimumCartValue = obj.optDouble("minimumCartValue", 0.0),
                        maximumDiscount = if (obj.has("maximumDiscount")) obj.optDouble("maximumDiscount") else null,
                        usageLimit = if (obj.has("usageLimit")) obj.optInt("usageLimit") else null,
                        usageCount = obj.optInt("usageCount", 0),
                        oncePerCustomer = obj.optBoolean("oncePerCustomer", true),
                        startsAt = obj.optString("startsAt").takeIf { it.isNotBlank() },
                        endsAt = obj.optString("endsAt").takeIf { it.isNotBlank() },
                        isActive = obj.optBoolean("isActive", true),
                        createdAt = obj.optString("createdAt").takeIf { it.isNotBlank() }
                    )
                )
            }
            list
        }
    }

    suspend fun createCoupon(
        title: String,
        code: String,
        discountType: String,
        discountValue: Double,
        minimumCartValue: Double,
        maximumDiscount: Double?,
        usageLimit: Int?,
        oncePerCustomer: Boolean,
        startsAt: String,
        endsAt: String,
        isActive: Boolean
    ): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            val body = JSONObject().apply {
                put("title", title)
                put("code", code.uppercase())
                put("discountType", discountType)
                put("discountValue", discountValue)
                put("minimumCartValue", minimumCartValue)
                if (maximumDiscount != null) put("maximumDiscount", maximumDiscount)
                if (usageLimit != null) put("usageLimit", usageLimit)
                put("oncePerCustomer", oncePerCustomer)
                put("startsAt", startsAt)
                put("endsAt", endsAt)
                put("isActive", isActive)
            }
            request("/promotions/admin/coupons", "POST", body)
            true
        }
    }

    suspend fun updateCoupon(couponId: String, body: JSONObject): Result<Boolean> =
        withContext(Dispatchers.IO) {
            runCatching {
                request("/promotions/admin/coupons/$couponId", "PATCH", body)
                true
            }
        }

    suspend fun deleteCoupon(couponId: String): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            request("/promotions/admin/coupons/$couponId", "DELETE")
            true
        }
    }

    suspend fun getAdminOffers(): Result<List<AdminOfferItem>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/promotions/admin/offers", "GET")
            val array = when {
                json.optJSONObject("data")?.optJSONArray("offers") != null ->
                    json.getJSONObject("data").getJSONArray("offers")
                json.optJSONArray("data") != null -> json.getJSONArray("data")
                else -> JSONArray()
            }
            val list = mutableListOf<AdminOfferItem>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                val catIds = mutableListOf<String>()
                val catArr = obj.optJSONArray("categoryIds")
                if (catArr != null) {
                    for (j in 0 until catArr.length()) catIds.add(catArr.optString(j))
                }
                list.add(
                    AdminOfferItem(
                        offerId = obj.optString("offerId", obj.optString("_id", "$i")),
                        title = obj.getString("title"),
                        festivalName = obj.optString("festivalName").takeIf { it.isNotBlank() },
                        discountType = obj.optString("discountType", "percentage"),
                        discountValue = obj.optDouble("discountValue", 0.0),
                        categoryIds = catIds,
                        bannerImage = obj.optString("bannerImage").takeIf { it.isNotBlank() },
                        priority = obj.optInt("priority", 0),
                        startsAt = obj.optString("startsAt").takeIf { it.isNotBlank() },
                        endsAt = obj.optString("endsAt").takeIf { it.isNotBlank() },
                        isActive = obj.optBoolean("isActive", true),
                        createdAt = obj.optString("createdAt").takeIf { it.isNotBlank() }
                    )
                )
            }
            list
        }
    }

    suspend fun createOffer(
        title: String,
        festivalName: String,
        discountType: String,
        discountValue: Double,
        categoryIds: List<String>,
        bannerImage: String,
        priority: Int,
        startsAt: String,
        endsAt: String,
        isActive: Boolean
    ): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            val body = JSONObject().apply {
                put("title", title)
                put("festivalName", festivalName)
                put("discountType", discountType)
                put("discountValue", discountValue)
                put("categoryIds", JSONArray(categoryIds))
                put("bannerImage", bannerImage)
                put("priority", priority)
                put("startsAt", startsAt)
                put("endsAt", endsAt)
                put("isActive", isActive)
            }
            request("/promotions/admin/offers", "POST", body)
            true
        }
    }

    suspend fun updateOffer(offerId: String, body: JSONObject): Result<Boolean> =
        withContext(Dispatchers.IO) {
            runCatching {
                request("/promotions/admin/offers/$offerId", "PATCH", body)
                true
            }
        }

    suspend fun deleteOffer(offerId: String): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            request("/promotions/admin/offers/$offerId", "DELETE")
            true
        }
    }

    // ── 6. User Management ────────────────────────────────────────────────

    suspend fun getAdminUsers(
        search: String? = null,
        role: String? = null,
        isActive: Boolean? = null,
        emailVerified: Boolean? = null,
        phoneVerified: Boolean? = null,
        page: Int = 1,
        limit: Int = 25
    ): Result<AdminUsersResponse> = withContext(Dispatchers.IO) {
        runCatching {
            val params = mutableListOf("page=$page", "limit=$limit")
            if (!search.isNullOrBlank()) params.add("search=${URLEncoder.encode(search, "UTF-8")}")
            if (!role.isNullOrBlank()) params.add("role=$role")
            if (isActive != null) params.add("isActive=$isActive")
            if (emailVerified != null) params.add("emailVerified=$emailVerified")
            if (phoneVerified != null) params.add("phoneVerified=$phoneVerified")

            val queryString = params.joinToString("&")
            val json = request("/users/admin?$queryString", "GET")
            val data = json.getJSONObject("data")

            val array = data.getJSONArray("users")
            val list = mutableListOf<AdminUserItem>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                list.add(
                    AdminUserItem(
                        userId = obj.optString("userId", obj.optString("_id", "$i")),
                        name = obj.optString("name", "User"),
                        email = obj.optString("email", ""),
                        mobile = obj.optString("mobile", ""),
                        role = obj.optString("role", "customer"),
                        isActive = obj.optBoolean("isActive", true),
                        emailVerified = obj.optBoolean("emailVerified", false),
                        phoneVerified = obj.optBoolean("phoneVerified", false),
                        isCreditApproved = obj.optBoolean("isCreditApproved", false),
                        createdAt = obj.optString("createdAt").takeIf { it.isNotBlank() }
                    )
                )
            }

            val pagObj = data.optJSONObject("pagination")
            val pagination = AdminUserPagination(
                page = pagObj?.optInt("page", page) ?: page,
                limit = pagObj?.optInt("limit", limit) ?: limit,
                total = pagObj?.optInt("total", list.size) ?: list.size,
                totalPages = pagObj?.optInt("totalPages", 1) ?: 1
            )

            AdminUsersResponse(users = list, pagination = pagination)
        }
    }

    // ── 7. Profile, Password & Platform Fee ───────────────────────────────

    suspend fun updateProfile(name: String, mobile: String, avatar: String?): Result<Boolean> =
        withContext(Dispatchers.IO) {
            runCatching {
                val body = JSONObject().apply {
                    put("name", name)
                    put("mobile", mobile)
                    if (!avatar.isNullOrBlank()) put("avatar", avatar)
                }
                request("/users/profile", "PATCH", body)
                true
            }
        }

    suspend fun changePassword(currentPass: String, newPass: String, confirmPass: String): Result<Boolean> =
        withContext(Dispatchers.IO) {
            runCatching {
                val body = JSONObject().apply {
                    put("currentPassword", currentPass)
                    put("newPassword", newPass)
                    put("confirmPassword", confirmPass)
                }
                request("/users/change-password", "PATCH", body)
                true
            }
        }

    suspend fun getPlatformFeeConfig(): Result<PlatformFeeConfig> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/platform-fee", "GET")
            val obj = json.getJSONObject("data").optJSONObject("config") ?: json.getJSONObject("data")
            PlatformFeeConfig(
                amount = obj.optDouble("amount", 10.0),
                feeType = obj.optString("feeType", "FIXED"),
                minimumOrderAmount = obj.optDouble("minimumOrderAmount", 0.0),
                maximumPlatformFee = if (obj.has("maximumPlatformFee")) obj.optDouble("maximumPlatformFee") else null,
                enabled = obj.optBoolean("enabled", true)
            )
        }
    }

    suspend fun updatePlatformFeeConfig(config: PlatformFeeConfig): Result<Boolean> =
        withContext(Dispatchers.IO) {
            runCatching {
                val body = JSONObject().apply {
                    put("amount", config.amount)
                    put("feeType", config.feeType)
                    put("minimumOrderAmount", config.minimumOrderAmount)
                    if (config.maximumPlatformFee != null) put("maximumPlatformFee", config.maximumPlatformFee)
                    put("enabled", config.enabled)
                }
                request("/platform-fee", "PATCH", body)
                true
            }
        }

    // ── Network helper ────────────────────────────────────────────────────

    private fun request(path: String, method: String, body: JSONObject? = null): JSONObject {
        val cleanPath = if (path.startsWith("/")) path else "/$path"
        val url = URL("${ApiConfig.BASE_URL}$cleanPath")
        val token = tokenStore.accessToken()

        val connection = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 12000
            readTimeout = 12000
            setRequestProperty("Accept", "application/json")
            if (!token.isNullOrBlank()) {
                setRequestProperty("Authorization", "Bearer $token")
            }
            if (body != null) {
                doOutput = true
                setRequestProperty("Content-Type", "application/json; charset=utf-8")
                outputStream.use { it.write(body.toString().toByteArray(StandardCharsets.UTF_8)) }
            }
        }

        return try {
            val responseCode = connection.responseCode
            val stream = if (responseCode in 200..299) connection.inputStream else connection.errorStream
            val raw = stream?.bufferedReader()?.use { it.readText() }.orEmpty().ifBlank { "{}" }
            val json = JSONObject(raw)
            if (responseCode !in 200..299) {
                throw ApiException(responseCode, json.optString("message", "Request failed with code $responseCode"))
            }
            json
        } catch (error: ApiException) {
            throw error
        } catch (_: IOException) {
            throw ApiException(0, "Unable to connect to SheoMart backend. Check network.")
        } finally {
            connection.disconnect()
        }
    }
}
