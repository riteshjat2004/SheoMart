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
import java.nio.charset.StandardCharsets

class HomeRepository(private val tokenStore: SecureTokenStore? = null) {

    suspend fun getHeroCarousel(): Result<List<HeroShowcaseItem>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/api/home/hero-carousel", "GET")
            val itemsArray = when {
                json.optJSONArray("data") != null -> json.getJSONArray("data")
                json.optJSONObject("data")?.optJSONArray("items") != null -> json.getJSONObject("data").getJSONArray("items")
                else -> JSONArray()
            }
            val list = mutableListOf<HeroShowcaseItem>()
            for (i in 0 until itemsArray.length()) {
                val itemObj = itemsArray.getJSONObject(i)
                list.add(
                    HeroShowcaseItem(
                        id = itemObj.optString("id", itemObj.optString("_id", "$i")),
                        type = itemObj.optString("type", "product"),
                        name = itemObj.optString("name", "Special Pick"),
                        image = itemObj.optString("image", ""),
                        productId = itemObj.optString("productId").takeIf { it.isNotBlank() },
                        categoryId = itemObj.optString("categoryId").takeIf { it.isNotBlank() },
                        storeId = itemObj.optString("storeId").takeIf { it.isNotBlank() },
                        rating = if (itemObj.has("rating")) itemObj.optDouble("rating") else null,
                        deliveryEnabled = itemObj.optBoolean("deliveryEnabled", false),
                        badge = itemObj.optString("badge").takeIf { it.isNotBlank() }
                    )
                )
            }
            list
        }
    }

    suspend fun getCategories(): Result<List<Category>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/categories", "GET")
            val categoriesArray = when {
                json.optJSONObject("data")?.optJSONArray("categories") != null ->
                    json.getJSONObject("data").getJSONArray("categories")
                json.optJSONArray("data") != null ->
                    json.getJSONArray("data")
                else -> JSONArray()
            }
            val list = mutableListOf<Category>()
            for (i in 0 until categoriesArray.length()) {
                val obj = categoriesArray.getJSONObject(i)
                val catId = obj.optString("categoryId", obj.optString("_id", ""))
                val name = obj.optString("name", "")
                if (catId.isNotBlank() && name.isNotBlank()) {
                    list.add(
                        Category(
                            categoryId = catId,
                            name = name,
                            slug = obj.optString("slug").takeIf { it.isNotBlank() },
                            icon = obj.optString("icon").takeIf { it.isNotBlank() },
                            image = obj.optString("image").takeIf { it.isNotBlank() },
                            description = obj.optString("description").takeIf { it.isNotBlank() }
                        )
                    )
                }
            }
            list
        }
    }

    suspend fun getTrendingProducts(): Result<List<Product>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/api/home/trending-products", "GET")
            val productsArray = when {
                json.optJSONObject("data")?.optJSONArray("products") != null ->
                    json.getJSONObject("data").getJSONArray("products")
                json.optJSONArray("data") != null ->
                    json.getJSONArray("data")
                else -> JSONArray()
            }
            parseProducts(productsArray)
        }
    }

    suspend fun getAllProducts(): Result<List<Product>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/products", "GET")
            val productsArray = when {
                json.optJSONObject("data")?.optJSONArray("products") != null ->
                    json.getJSONObject("data").getJSONArray("products")
                json.optJSONArray("data") != null ->
                    json.getJSONArray("data")
                else -> JSONArray()
            }
            parseProducts(productsArray)
        }
    }

    suspend fun getStores(): Result<List<Store>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/stores", "GET")
            val storesArray = when {
                json.optJSONObject("data")?.optJSONArray("stores") != null ->
                    json.getJSONObject("data").getJSONArray("stores")
                json.optJSONArray("data") != null ->
                    json.getJSONArray("data")
                else -> JSONArray()
            }
            val list = mutableListOf<Store>()
            for (i in 0 until storesArray.length()) {
                val obj = storesArray.getJSONObject(i)
                val storeId = obj.optString("storeId", obj.optString("_id", ""))
                val storeName = obj.optString("storeName", obj.optString("name", ""))
                if (storeId.isNotBlank() && storeName.isNotBlank()) {
                    list.add(
                        Store(
                            storeId = storeId,
                            storeName = storeName,
                            logo = obj.optString("logo").takeIf { it.isNotBlank() },
                            banner = obj.optString("banner").takeIf { it.isNotBlank() },
                            rating = if (obj.has("rating") && !obj.isNull("rating")) obj.optDouble("rating") else null,
                            totalReviews = obj.optInt("totalReviews", 0),
                            address = obj.optString("address").takeIf { it.isNotBlank() },
                            city = obj.optString("city").takeIf { it.isNotBlank() },
                            badge = obj.optString("badge", "normal").lowercase(),
                            deliveryEnabled = obj.optBoolean("deliveryEnabled", true),
                            pickupOpeningTime = obj.optString("pickupOpeningTime", "09:00"),
                            pickupClosingTime = obj.optString("pickupClosingTime", "21:00"),
                            status = obj.optString("status").takeIf { it.isNotBlank() }
                        )
                    )
                }
            }
            list
        }
    }

    suspend fun getActiveOffers(): Result<List<PromotionOffer>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/promotions/offers/active", "GET")
            val offersArray = when {
                json.optJSONObject("data")?.optJSONArray("offers") != null ->
                    json.getJSONObject("data").getJSONArray("offers")
                json.optJSONArray("data") != null ->
                    json.getJSONArray("data")
                else -> JSONArray()
            }
            val list = mutableListOf<PromotionOffer>()
            for (i in 0 until offersArray.length()) {
                val obj = offersArray.getJSONObject(i)
                list.add(
                    PromotionOffer(
                        offerId = obj.optString("offerId", obj.optString("_id", "")),
                        title = obj.optString("title", "Festival Offer"),
                        festivalName = obj.optString("festivalName").takeIf { it.isNotBlank() },
                        discountType = obj.optString("discountType", "percentage"),
                        discountValue = obj.optDouble("discountValue", 0.0),
                        bannerImage = obj.optString("bannerImage").takeIf { it.isNotBlank() },
                        endsAt = obj.optString("endsAt").takeIf { it.isNotBlank() }
                    )
                )
            }
            list
        }
    }

    private fun parseProducts(array: JSONArray): List<Product> {
        val list = mutableListOf<Product>()
        for (i in 0 until array.length()) {
            val obj = array.getJSONObject(i)
            val id = obj.optString("productId", obj.optString("_id", ""))
            val name = obj.optString("name", "")
            if (id.isNotBlank() && name.isNotBlank()) {
                val imagesArray = obj.optJSONArray("images")
                val imagesList = mutableListOf<String>()
                if (imagesArray != null) {
                    for (j in 0 until imagesArray.length()) {
                        val img = imagesArray.optString(j)
                        if (img.isNotBlank()) imagesList.add(img)
                    }
                }
                val thumbnail = obj.optString("thumbnail").takeIf { it.isNotBlank() }
                    ?: obj.optJSONObject("image")?.optString("url")?.takeIf { it.isNotBlank() }
                    ?: imagesList.firstOrNull()

                val price = obj.optDouble("price", 0.0)
                val discountPrice = if (obj.has("discountPrice") && !obj.isNull("discountPrice")) obj.optDouble("discountPrice") else null
                val discount = if (obj.has("discount") && !obj.isNull("discount")) obj.optInt("discount") else null

                list.add(
                    Product(
                        productId = id,
                        name = name,
                        brand = obj.optString("brand", "SheoMart"),
                        price = price,
                        discount = discount,
                        discountPrice = discountPrice,
                        thumbnail = thumbnail,
                        images = imagesList,
                        rating = if (obj.has("rating") && !obj.isNull("rating")) obj.optDouble("rating") else null,
                        unit = obj.optString("unit", "Standard pack"),
                        quantity = obj.optInt("quantity", 10),
                        storeId = obj.optString("storeId").takeIf { it.isNotBlank() },
                        categoryId = obj.optString("categoryId").takeIf { it.isNotBlank() }
                    )
                )
            }
        }
        return list
    }

    private fun request(path: String, method: String): JSONObject {
        val urlString = when {
            path.startsWith("/api/") -> {
                val baseUrlWithoutV1 = ApiConfig.BASE_URL.substringBefore("/api/v1")
                "$baseUrlWithoutV1$path"
            }
            path.startsWith("http://") || path.startsWith("https://") -> path
            else -> {
                val cleanPath = if (path.startsWith("/")) path else "/$path"
                "${ApiConfig.BASE_URL}$cleanPath"
            }
        }

        val token = tokenStore?.accessToken()
        val connection = (URL(urlString).openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 10000
            readTimeout = 10000
            setRequestProperty("Accept", "application/json")
            if (!token.isNullOrBlank()) {
                setRequestProperty("Authorization", "Bearer $token")
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
            throw ApiException(0, "Unable to connect to SheoMart. Check network.")
        } finally {
            connection.disconnect()
        }
    }
}
