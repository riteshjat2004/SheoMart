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
                val prodObj = obj.optJSONObject("product") ?: obj.optJSONObject("productId")
                val pId = prodObj?.optString("productId", prodObj.optString("_id", "$i")) ?: obj.optString("productId", "$i")
                val pName = prodObj?.optString("name", obj.optString("name", "Product")) ?: "Product"
                val pThumb = (prodObj?.optString("thumbnail") ?: prodObj?.optString("imageUrl", obj.optString("thumbnail", ""))).takeIf { !it.isNullOrBlank() }
                val pPrice = prodObj?.optDouble("price", obj.optDouble("price", 0.0)) ?: 0.0
                val pDiscPrice = if (prodObj != null && prodObj.has("discountPrice")) prodObj.optDouble("discountPrice") else if (obj.has("discountPrice")) obj.optDouble("discountPrice") else null
                val wId = obj.optString("wishlistItemId", obj.optString("_id", "$pId-$i"))

                list.add(
                    WishlistItem(
                        wishlistItemId = wId,
                        productId = pId,
                        productName = pName,
                        thumbnail = pThumb?.takeIf { it.isNotBlank() },
                        price = pPrice,
                        discountPrice = pDiscPrice,
                        rating = if (prodObj != null && prodObj.has("rating")) prodObj.optDouble("rating") else null,
                        storeName = prodObj?.optString("storeName"),
                        inStock = prodObj?.optBoolean("isActive", true) ?: true
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

    suspend fun addWishlistItem(productId: String): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            val body = JSONObject().put("productId", productId)
            request("/wishlist", "POST", body)
            true
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
