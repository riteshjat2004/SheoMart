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

class ProductRepository(private val tokenStore: SecureTokenStore? = null) {

    suspend fun getProductById(productId: String): Result<ProductDetail> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/products/$productId", "GET")
            val obj = json.getJSONObject("data").optJSONObject("product") ?: json.getJSONObject("data")

            val storeObj = obj.optJSONObject("store") ?: obj.optJSONObject("storeId")
            val categoryObj = obj.optJSONObject("category") ?: obj.optJSONObject("categoryId")

            val imgList = mutableListOf<String>()
            val imgArr = obj.optJSONArray("images")
            if (imgArr != null) {
                for (i in 0 until imgArr.length()) {
                    imgList.add(imgArr.optString(i))
                }
            }

            val thumb = obj.optString("thumbnail", obj.optString("imageUrl", "")).takeIf { it.isNotBlank() }
            if (thumb != null && !imgList.contains(thumb)) {
                imgList.add(0, thumb)
            }

            // Reviews
            val reviewsList = mutableListOf<ProductReviewItem>()
            val revArr = obj.optJSONArray("reviews")
            if (revArr != null) {
                for (i in 0 until revArr.length()) {
                    val rObj = revArr.getJSONObject(i)
                    val userObj = rObj.optJSONObject("user") ?: rObj.optJSONObject("userId")
                    reviewsList.add(
                        ProductReviewItem(
                            reviewId = rObj.optString("reviewId", rObj.optString("_id", "$i")),
                            rating = rObj.optInt("rating", 5),
                            comment = rObj.optString("comment").takeIf { it.isNotBlank() },
                            userName = userObj?.optString("name", "Shopper") ?: "Shopper",
                            createdAt = rObj.optString("createdAt").takeIf { it.isNotBlank() }
                        )
                    )
                }
            }

            ProductDetail(
                productId = obj.optString("productId", obj.optString("_id", productId)),
                name = obj.getString("name"),
                description = obj.optString("description").takeIf { it.isNotBlank() },
                brand = obj.optString("brand", "SheoMart"),
                sku = obj.optString("sku").takeIf { it.isNotBlank() },
                price = obj.optDouble("price", 0.0),
                discountPrice = if (obj.has("discountPrice")) obj.optDouble("discountPrice") else null,
                quantity = obj.optInt("quantity", 10),
                categoryId = categoryObj?.optString("categoryId", categoryObj.optString("_id")),
                categoryName = categoryObj?.optString("name"),
                storeId = storeObj?.optString("storeId", storeObj.optString("_id")),
                storeName = storeObj?.optString("storeName", storeObj.optString("name", "Local Store")),
                storeBadge = storeObj?.optString("badge", "normal") ?: "normal",
                thumbnail = thumb,
                images = imgList,
                rating = if (obj.has("rating")) obj.optDouble("rating") else null,
                totalReviews = obj.optInt("totalReviews", reviewsList.size),
                isPublished = obj.optBoolean("isPublished", true),
                isActive = obj.optBoolean("isActive", true),
                inventoryStatus = obj.optString("inventoryStatus", "in_stock"),
                reviews = reviewsList
            )
        }
    }

    suspend fun getProducts(categoryId: String? = null, search: String? = null, storeId: String? = null): Result<List<Product>> =
        withContext(Dispatchers.IO) {
            runCatching {
                val params = mutableListOf<String>()
                if (!categoryId.isNullOrBlank()) params.add("categoryId=$categoryId")
                if (!search.isNullOrBlank()) params.add("search=${URLEncoder.encode(search, "UTF-8")}")
                if (!storeId.isNullOrBlank()) params.add("storeId=$storeId")

                val query = if (params.isNotEmpty()) "?${params.joinToString("&")}" else ""
                val json = request("/products$query", "GET")
                val array = json.getJSONObject("data").optJSONArray("products") ?: json.optJSONArray("data") ?: JSONArray()

                val list = mutableListOf<Product>()
                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    list.add(
                        Product(
                            productId = obj.optString("productId", obj.optString("_id", "$i")),
                            name = obj.getString("name"),
                            brand = obj.optString("brand", "SheoMart"),
                            price = obj.optDouble("price", 0.0),
                            discount = if (obj.has("discount")) obj.optInt("discount") else null,
                            discountPrice = if (obj.has("discountPrice")) obj.optDouble("discountPrice") else null,
                            thumbnail = obj.optString("thumbnail", obj.optString("imageUrl", "")).takeIf { it.isNotBlank() },
                            rating = if (obj.has("rating")) obj.optDouble("rating") else null,
                            unit = obj.optString("unit", "Standard pack"),
                            quantity = obj.optInt("quantity", 1),
                            storeId = obj.optString("storeId"),
                            categoryId = obj.optString("categoryId")
                        )
                    )
                }
                list
            }
        }

    suspend fun search(query: String): Result<SearchResults> = withContext(Dispatchers.IO) {
        runCatching {
            val q = URLEncoder.encode(query.trim(), "UTF-8")
            val json = request("/search?q=$q", "GET")
            val data = json.getJSONObject("data")

            val products = mutableListOf<SearchProductItem>()
            val prodArr = data.optJSONArray("products")
            if (prodArr != null) {
                for (i in 0 until prodArr.length()) {
                    val p = prodArr.getJSONObject(i)
                    products.add(
                        SearchProductItem(
                            productId = p.optString("productId", p.optString("_id", "$i")),
                            name = p.getString("name"),
                            thumbnail = p.optString("thumbnail").takeIf { it.isNotBlank() },
                            discountPrice = if (p.has("discountPrice")) p.optDouble("discountPrice") else null,
                            categoryName = p.optString("categoryName")
                        )
                    )
                }
            }

            val stores = mutableListOf<SearchStoreItem>()
            val storeArr = data.optJSONArray("stores")
            if (storeArr != null) {
                for (i in 0 until storeArr.length()) {
                    val s = storeArr.getJSONObject(i)
                    stores.add(
                        SearchStoreItem(
                            storeId = s.optString("storeId", s.optString("_id", "$i")),
                            storeName = s.getString("storeName"),
                            logo = s.optString("logo").takeIf { it.isNotBlank() },
                            rating = if (s.has("rating")) s.optDouble("rating") else null,
                            deliveryEnabled = s.optBoolean("deliveryEnabled", true)
                        )
                    )
                }
            }

            val categories = mutableListOf<SearchCategoryItem>()
            val catArr = data.optJSONArray("categories")
            if (catArr != null) {
                for (i in 0 until catArr.length()) {
                    val c = catArr.getJSONObject(i)
                    categories.add(
                        SearchCategoryItem(
                            categoryId = c.optString("categoryId", c.optString("_id", "$i")),
                            name = c.getString("name"),
                            image = c.optString("image").takeIf { it.isNotBlank() }
                        )
                    )
                }
            }

            SearchResults(products, stores, categories)
        }
    }

    private fun request(path: String, method: String, body: JSONObject? = null): JSONObject {
        val url = URL(ApiConfig.urlFor(path))
        val token = tokenStore?.accessToken()
        val connection = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 10000
            readTimeout = 10000
            setRequestProperty("Accept", "application/json")
            if (!token.isNullOrBlank()) setRequestProperty("Authorization", "Bearer $token")
            if (body != null) {
                doOutput = true
                setRequestProperty("Content-Type", "application/json; charset=utf-8")
                outputStream.use { it.write(body.toString().toByteArray(StandardCharsets.UTF_8)) }
            }
        }
        return try {
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val raw = stream?.bufferedReader()?.use { it.readText() }.orEmpty().ifBlank { "{}" }
            val json = JSONObject(raw)
            if (code !in 200..299) throw ApiException(code, json.optString("message", "Request failed ($code)"))
            json
        } catch (e: ApiException) { throw e
        } catch (_: IOException) { throw ApiException(0, "Unable to connect to SheoMart. Check network.")
        } finally { connection.disconnect() }
    }
}
