package com.sheomart.mobile.data.repository

import com.sheomart.mobile.data.api.ApiConfig
import com.sheomart.mobile.data.model.ApiException
import com.sheomart.mobile.data.model.WishlistItem
import com.sheomart.mobile.utils.SecureTokenStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.nio.charset.StandardCharsets

class WishlistRepository(private val tokenStore: SecureTokenStore) {

    /** Returns the full wishlist items list. */
    suspend fun getWishlist(): Result<List<WishlistItem>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/wishlist", "GET")
            val wishData = json.optJSONObject("data")
            val wishArray = when {
                wishData?.optJSONArray("wishlist") != null -> wishData.getJSONArray("wishlist")
                wishData?.optJSONArray("items") != null    -> wishData.getJSONArray("items")
                else                                       -> JSONArray()
            }

            val list = mutableListOf<WishlistItem>()
            for (i in 0 until wishArray.length()) {
                val obj = wishArray.getJSONObject(i)
                val wId = obj.optString("wishlistItemId", obj.optString("_id", "$i"))
                val addedAt = obj.optString("createdAt").takeIf { it.isNotBlank() }

                // Backend returns { wishlistItemId, product: { full product object } }
                val prodObj = obj.optJSONObject("product") ?: obj
                val pId = prodObj.optString("productId", prodObj.optString("_id", "$i"))
                val pName = prodObj.optString("name", "Product")

                // Store info — nested storeId object or plain fields
                val storeObj = prodObj.optJSONObject("storeId")
                val storeId = storeObj?.optString("storeId") ?: storeObj?.optString("_id")
                    ?: prodObj.optString("storeId").takeIf { it.isNotBlank() }
                val storeName = storeObj?.optString("storeName")
                    ?: prodObj.optString("storeName").takeIf { it.isNotBlank() }
                val storeBadge = storeObj?.optString("badge", "normal")
                    ?: prodObj.optString("storeBadge", "normal")
                val storeRating = if (storeObj?.has("rating") == true) storeObj.optDouble("rating") else null

                val price = prodObj.optDouble("price", obj.optDouble("price", 0.0))
                val discountPrice = when {
                    prodObj.has("discountPrice") && !prodObj.isNull("discountPrice") -> prodObj.optDouble("discountPrice")
                    obj.has("discountPrice") && !obj.isNull("discountPrice") -> obj.optDouble("discountPrice")
                    else -> null
                }
                val discount = if (prodObj.has("discount") && !prodObj.isNull("discount")) prodObj.optInt("discount") else null
                val rating = if (prodObj.has("rating") && !prodObj.isNull("rating")) prodObj.optDouble("rating") else null
                val inStock = prodObj.optInt("quantity", 1) > 0 &&
                        prodObj.optBoolean("isActive", true) &&
                        prodObj.optBoolean("isPublished", true)

                list.add(
                    WishlistItem(
                        wishlistItemId = wId,
                        productId = pId,
                        productName = pName,
                        thumbnail = prodObj.optString("thumbnail").takeIf { it.isNotBlank() },
                        price = price,
                        discountPrice = discountPrice,
                        discount = discount,
                        rating = rating,
                        storeId = storeId,
                        storeName = storeName,
                        storeBadge = storeBadge ?: "normal",
                        storeRating = storeRating,
                        brand = prodObj.optString("brand").takeIf { it.isNotBlank() },
                        categoryId = prodObj.optString("categoryId").takeIf { it.isNotBlank() },
                        inStock = inStock,
                        addedAt = addedAt
                    )
                )
            }
            list
        }
    }

    /** Returns the count of items in the wishlist. */
    suspend fun getWishlistItemCount(): Result<Int> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/wishlist", "GET")
            val wishData = json.optJSONObject("data")
            val wishArray = when {
                wishData?.optJSONArray("wishlist") != null -> wishData.getJSONArray("wishlist")
                wishData?.optJSONArray("items") != null    -> wishData.getJSONArray("items")
                else                                       -> JSONArray()
            }
            wishArray.length()
        }
    }

    /** Adds a product to the wishlist. Returns the new wishlistItemId on success. */
    suspend fun addWishlistItem(productId: String): Result<String> = withContext(Dispatchers.IO) {
        runCatching {
            val body = JSONObject().put("productId", productId)
            val json = request("/wishlist", "POST", body)
            val item = json.optJSONObject("data")?.optJSONObject("wishlistItem")
            item?.optString("wishlistItemId") ?: productId
        }
    }

    suspend fun removeWishlistItem(wishlistItemId: String): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            request("/wishlist/$wishlistItemId", "DELETE")
            true
        }
    }


    private fun request(path: String, method: String, body: JSONObject? = null): JSONObject {
        val url = URL(ApiConfig.urlFor(path))
        val token = tokenStore.accessToken()
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
