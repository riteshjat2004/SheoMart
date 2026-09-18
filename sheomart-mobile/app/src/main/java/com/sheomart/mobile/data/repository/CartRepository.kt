package com.sheomart.mobile.data.repository

import com.sheomart.mobile.data.api.ApiConfig
import com.sheomart.mobile.data.model.ApiException
import com.sheomart.mobile.data.model.CartData
import com.sheomart.mobile.data.model.CartItem
import com.sheomart.mobile.utils.SecureTokenStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.nio.charset.StandardCharsets

class CartRepository(private val tokenStore: SecureTokenStore) {

    /** Returns the full cart data with items and price summary. */
    suspend fun getCart(): Result<CartData> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/cart", "GET")
            val dataObj = json.optJSONObject("data")
            val cartObj = dataObj?.optJSONObject("cart") ?: dataObj

            val itemsList = mutableListOf<CartItem>()
            val itemsArr = cartObj?.optJSONArray("cartItems") ?: cartObj?.optJSONArray("items")
            if (itemsArr != null) {
                for (i in 0 until itemsArr.length()) {
                    val obj = itemsArr.getJSONObject(i)
                    val prodObj = obj.optJSONObject("product") ?: obj.optJSONObject("productId")
                    val pId = prodObj?.optString("productId", prodObj.optString("_id", "$i")) ?: obj.optString("productId", "$i")
                    val pName = prodObj?.optString("name", obj.optString("name", "Product")) ?: "Product"
                    val pThumb = (prodObj?.optString("thumbnail") ?: prodObj?.optString("imageUrl", obj.optString("thumbnail", ""))).takeIf { !it.isNullOrBlank() }
                    val pPrice = prodObj?.optDouble("price", obj.optDouble("price", 0.0)) ?: 0.0
                    val pDiscPrice = if (prodObj != null && prodObj.has("discountPrice")) prodObj.optDouble("discountPrice") else if (obj.has("discountPrice")) obj.optDouble("discountPrice") else null
                    val qty = obj.optInt("quantity", 1)
                    val cId = obj.optString("cartItemId", obj.optString("_id", "$pId-$i"))

                    itemsList.add(
                        CartItem(
                            cartItemId = cId,
                            productId = pId,
                            productName = pName,
                            thumbnail = pThumb?.takeIf { it.isNotBlank() },
                            price = pPrice,
                            discountPrice = pDiscPrice,
                            quantity = qty,
                            storeId = prodObj?.optString("storeId"),
                            storeName = prodObj?.optString("storeName")
                        )
                    )
                }
            }

            val subtotal = itemsList.sumOf { it.totalPrice }
            val platformFee = cartObj?.optDouble("platformFee", 10.0) ?: 10.0
            val deliveryFee = cartObj?.optDouble("deliveryFee", if (subtotal >= 499.0 || subtotal == 0.0) 0.0 else 40.0) ?: 0.0
            val discountAmount = cartObj?.optDouble("discountAmount", 0.0) ?: 0.0
            val total = (subtotal + platformFee + deliveryFee - discountAmount).coerceAtLeast(0.0)

            CartData(
                cartId = cartObj?.optString("cartId", cartObj.optString("_id")),
                items = itemsList,
                subtotal = subtotal,
                platformFee = platformFee,
                deliveryFee = deliveryFee,
                discountAmount = discountAmount,
                totalAmount = total,
                appliedCouponCode = cartObj?.optString("couponCode")?.takeIf { it.isNotBlank() }
            )
        }
    }

    /** Returns the number of items currently in the cart. */
    suspend fun getCartItemCount(): Result<Int> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/cart", "GET")
            val cartData = json.optJSONObject("data")?.optJSONObject("cart")
            val cartItems = cartData?.optJSONArray("cartItems") ?: cartData?.optJSONArray("items")
            cartItems?.length() ?: cartData?.optInt("totalItems", 0) ?: 0
        }
    }

    suspend fun addCartItem(productId: String, quantity: Int = 1): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            val body = JSONObject().apply {
                put("productId", productId)
                put("quantity", quantity)
            }
            request("/cart", "POST", body)
            true
        }
    }

    suspend fun updateCartItem(cartItemId: String, quantity: Int): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            val body = JSONObject().put("quantity", quantity)
            request("/cart/$cartItemId", "PATCH", body)
            true
        }
    }

    suspend fun removeCartItem(cartItemId: String): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            request("/cart/$cartItemId", "DELETE")
            true
        }
    }

    suspend fun clearCart(): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            request("/cart", "DELETE")
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
