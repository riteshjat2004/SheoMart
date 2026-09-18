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

class SellerRepository(private val tokenStore: SecureTokenStore) {

    suspend fun getMyStore(): Result<SellerStoreProfile?> = withContext(Dispatchers.IO) {
        runCatching {
            try {
                val json = request("/stores/me", "GET")
                val storeObj = json.optJSONObject("data")?.optJSONObject("store") ?: json.optJSONObject("data")
                if (storeObj == null) return@runCatching null

                SellerStoreProfile(
                    storeId = storeObj.optString("storeId", storeObj.optString("_id", "")),
                    storeName = storeObj.optString("storeName", storeObj.optString("name", "My Store")),
                    description = storeObj.optString("description").takeIf { it.isNotBlank() },
                    logo = storeObj.optString("logo").takeIf { it.isNotBlank() },
                    banner = storeObj.optString("banner").takeIf { it.isNotBlank() },
                    address = storeObj.optString("address").takeIf { it.isNotBlank() },
                    city = storeObj.optString("city", "Sheopur"),
                    state = storeObj.optString("state", "Madhya Pradesh"),
                    pincode = storeObj.optString("pincode", "476337"),
                    badge = storeObj.optString("badge", "normal"),
                    status = storeObj.optString("status", "approved"),
                    deliveryEnabled = storeObj.optBoolean("deliveryEnabled", true),
                    rating = if (storeObj.has("rating")) storeObj.optDouble("rating") else null,
                    totalReviews = storeObj.optInt("totalReviews", 0)
                )
            } catch (e: ApiException) {
                if (e.statusCode == 404) null else throw e
            }
        }
    }

    suspend fun updateMyStore(
        name: String?,
        description: String?,
        phone: String?,
        address: String?,
        city: String?,
        state: String?,
        pincode: String?,
        deliveryEnabled: Boolean?
    ): Result<SellerStoreProfile> = withContext(Dispatchers.IO) {
        runCatching {
            val body = JSONObject().apply {
                if (!name.isNullOrBlank()) put("storeName", name)
                if (!description.isNullOrBlank()) put("description", description)
                if (!phone.isNullOrBlank()) put("phone", phone)
                if (!address.isNullOrBlank()) put("address", address)
                if (!city.isNullOrBlank()) put("city", city)
                if (!state.isNullOrBlank()) put("state", state)
                if (!pincode.isNullOrBlank()) put("pincode", pincode)
                if (deliveryEnabled != null) put("deliveryEnabled", deliveryEnabled)
            }
            val json = request("/stores/me", "PATCH", body)
            val storeObj = json.optJSONObject("data")?.optJSONObject("store") ?: json.getJSONObject("data")
            SellerStoreProfile(
                storeId = storeObj.optString("storeId", storeObj.optString("_id", "")),
                storeName = storeObj.optString("storeName", storeObj.optString("name", "My Store")),
                description = storeObj.optString("description").takeIf { it.isNotBlank() },
                logo = storeObj.optString("logo").takeIf { it.isNotBlank() },
                banner = storeObj.optString("banner").takeIf { it.isNotBlank() },
                address = storeObj.optString("address").takeIf { it.isNotBlank() },
                city = storeObj.optString("city", "Sheopur"),
                state = storeObj.optString("state", "Madhya Pradesh"),
                pincode = storeObj.optString("pincode", "476337"),
                badge = storeObj.optString("badge", "normal"),
                status = storeObj.optString("status", "approved"),
                deliveryEnabled = storeObj.optBoolean("deliveryEnabled", true),
                rating = if (storeObj.has("rating")) storeObj.optDouble("rating") else null,
                totalReviews = storeObj.optInt("totalReviews", 0)
            )
        }
    }

    suspend fun getMyProducts(): Result<List<SellerProductItem>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/products/me", "GET")
            val array = json.optJSONObject("data")?.optJSONArray("products") ?: json.optJSONArray("data") ?: JSONArray()
            val list = mutableListOf<SellerProductItem>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                val catObj = obj.optJSONObject("category") ?: obj.optJSONObject("categoryId")
                list.add(
                    SellerProductItem(
                        productId = obj.optString("productId", obj.optString("_id", "$i")),
                        name = obj.getString("name"),
                        description = obj.optString("description").takeIf { it.isNotBlank() },
                        brand = obj.optString("brand", "SheoMart"),
                        sku = obj.optString("sku").takeIf { it.isNotBlank() },
                        price = obj.optDouble("price", 0.0),
                        discountPrice = if (obj.has("discountPrice")) obj.optDouble("discountPrice") else null,
                        quantity = obj.optInt("quantity", 0),
                        categoryId = catObj?.optString("categoryId", catObj.optString("_id")),
                        categoryName = catObj?.optString("name"),
                        thumbnail = obj.optString("thumbnail", obj.optString("imageUrl", "")).takeIf { it.isNotBlank() },
                        isActive = obj.optBoolean("isActive", true),
                        isPublished = obj.optBoolean("isPublished", true),
                        inventoryStatus = obj.optString("inventoryStatus", "in_stock")
                    )
                )
            }
            list
        }
    }

    suspend fun createProduct(
        name: String,
        description: String?,
        price: Double,
        discountPrice: Double?,
        quantity: Int,
        categoryId: String?,
        brand: String?
    ): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            val body = JSONObject().apply {
                put("name", name)
                if (!description.isNullOrBlank()) put("description", description)
                put("price", price)
                if (discountPrice != null) put("discountPrice", discountPrice)
                put("quantity", quantity)
                if (!categoryId.isNullOrBlank()) put("categoryId", categoryId)
                if (!brand.isNullOrBlank()) put("brand", brand)
            }
            request("/products", "POST", body)
            true
        }
    }

    suspend fun updateProduct(
        productId: String,
        name: String,
        description: String?,
        price: Double,
        discountPrice: Double?,
        quantity: Int,
        categoryId: String?,
        brand: String?
    ): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            val body = JSONObject().apply {
                put("name", name)
                if (!description.isNullOrBlank()) put("description", description)
                put("price", price)
                if (discountPrice != null) put("discountPrice", discountPrice)
                put("quantity", quantity)
                if (!categoryId.isNullOrBlank()) put("categoryId", categoryId)
                if (!brand.isNullOrBlank()) put("brand", brand)
            }
            request("/products/$productId", "PATCH", body)
            true
        }
    }

    suspend fun deleteProduct(productId: String): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            request("/products/$productId", "DELETE")
            true
        }
    }

    suspend fun updateProductStatus(productId: String, isActive: Boolean): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            val body = JSONObject().put("isActive", isActive)
            request("/products/$productId/status", "PATCH", body)
            true
        }
    }

    suspend fun getStoreOrders(): Result<List<SellerOrderItem>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = try {
                request("/billing/pickup-orders", "GET")
            } catch (_: Exception) {
                request("/orders", "GET")
            }

            val dataObj = json.optJSONObject("data")
            val array = dataObj?.optJSONArray("orders") ?: json.optJSONArray("data") ?: JSONArray()
            val list = mutableListOf<SellerOrderItem>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                val userObj = obj.optJSONObject("user") ?: obj.optJSONObject("userId")
                val itemsList = mutableListOf<OrderItemRecord>()
                val itemsArr = obj.optJSONArray("items") ?: obj.optJSONArray("orderItems")
                if (itemsArr != null) {
                    for (j in 0 until itemsArr.length()) {
                        val itObj = itemsArr.getJSONObject(j)
                        val prodObj = itObj.optJSONObject("product") ?: itObj.optJSONObject("productId")
                        itemsList.add(
                            OrderItemRecord(
                                productId = prodObj?.optString("productId", prodObj.optString("_id", "$j")) ?: itObj.optString("productId", "$j"),
                                name = prodObj?.optString("name", itObj.optString("name", "Grocery Item")) ?: "Grocery Item",
                                quantity = itObj.optInt("quantity", 1),
                                price = itObj.optDouble("price", prodObj?.optDouble("price", 0.0) ?: 0.0),
                                thumbnail = (prodObj?.optString("thumbnail") ?: prodObj?.optString("imageUrl", "")).takeIf { !it.isNullOrBlank() }
                            )
                        )
                    }
                }

                list.add(
                    SellerOrderItem(
                        orderId = obj.optString("orderId", obj.optString("_id", "$i")),
                        customerName = userObj?.optString("name", "Customer") ?: "Customer",
                        customerMobile = userObj?.optString("mobile"),
                        items = itemsList,
                        totalAmount = obj.optDouble("totalAmount", obj.optDouble("total", 0.0)),
                        status = obj.optString("status", "pending"),
                        paymentStatus = obj.optString("paymentStatus", "pending"),
                        deliveryEta = obj.optString("deliveryEta").takeIf { it.isNotBlank() },
                        createdAt = obj.optString("createdAt").takeIf { it.isNotBlank() }
                    )
                )
            }
            list
        }
    }

    suspend fun updateOrderStatus(orderId: String, status: String): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            val body = JSONObject().put("status", status)
            request("/orders/$orderId/status", "PATCH", body)
            true
        }
    }

    suspend fun updateDeliveryEta(orderId: String, estimatedDeliveryAt: String): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            val body = JSONObject().put("estimatedDeliveryAt", estimatedDeliveryAt)
            request("/orders/$orderId/delivery-eta", "PATCH", body)
            true
        }
    }

    suspend fun getStoreInventory(): Result<List<SellerInventoryItem>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = try {
                request("/inventory/sync", "GET")
            } catch (_: Exception) {
                request("/products/me", "GET")
            }

            val array = json.optJSONObject("data")?.optJSONArray("inventory")
                ?: json.optJSONObject("data")?.optJSONArray("products")
                ?: json.optJSONArray("data")
                ?: JSONArray()

            val list = mutableListOf<SellerInventoryItem>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                val prodObj = obj.optJSONObject("product") ?: obj.optJSONObject("productId")
                val pId = prodObj?.optString("productId", prodObj.optString("_id", "$i")) ?: obj.optString("productId", obj.optString("_id", "$i"))
                val pName = prodObj?.optString("name", obj.optString("name", "Product")) ?: obj.optString("productName", "Product")
                val qty = obj.optInt("availableQuantity", obj.optInt("quantity", 0))
                val price = prodObj?.optDouble("price", obj.optDouble("price", 0.0)) ?: obj.optDouble("price", 0.0)
                val thumb = (prodObj?.optString("thumbnail") ?: obj.optString("thumbnail", "")).takeIf { it.isNotBlank() }

                list.add(
                    SellerInventoryItem(
                        productId = pId,
                        productName = pName,
                        sku = obj.optString("sku").takeIf { it.isNotBlank() },
                        quantity = qty,
                        status = if (qty <= 0) "out_of_stock" else if (qty <= 5) "low_stock" else "in_stock",
                        thumbnail = thumb,
                        price = price
                    )
                )
            }
            list
        }
    }

    suspend fun updateInventoryQuantity(productId: String, quantity: Int): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            val body = JSONObject().put("availableQuantity", quantity).put("quantity", quantity)
            try {
                request("/inventory/$productId", "PATCH", body)
            } catch (_: Exception) {
                request("/products/$productId", "PATCH", JSONObject().put("quantity", quantity))
            }
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
