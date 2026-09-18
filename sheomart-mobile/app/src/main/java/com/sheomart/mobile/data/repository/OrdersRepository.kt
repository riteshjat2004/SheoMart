package com.sheomart.mobile.data.repository

import com.sheomart.mobile.data.api.ApiConfig
import com.sheomart.mobile.data.model.ApiException
import com.sheomart.mobile.data.model.CustomerOrder
import com.sheomart.mobile.data.model.OrderItemRecord
import com.sheomart.mobile.utils.SecureTokenStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.nio.charset.StandardCharsets

class OrdersRepository(private val tokenStore: SecureTokenStore) {

    data class OrderCounts(val total: Int, val active: Int)

    suspend fun getCustomerOrders(): Result<List<CustomerOrder>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/orders", "GET")
            val dataObj = json.optJSONObject("data")
            val ordersArray = dataObj?.optJSONArray("orders") ?: json.optJSONArray("data") ?: JSONArray()

            val list = mutableListOf<CustomerOrder>()
            for (i in 0 until ordersArray.length()) {
                val obj = ordersArray.getJSONObject(i)
                val storeObj = obj.optJSONObject("store") ?: obj.optJSONObject("storeId")
                val storeName = storeObj?.optString("storeName", storeObj.optString("name", "SheoMart Local")) ?: "SheoMart Local"

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

                val addressObj = obj.optJSONObject("deliveryAddress") ?: obj.optJSONObject("shippingAddress")
                val addressStr = if (addressObj != null) {
                    "${addressObj.optString("addressLine", "")} ${addressObj.optString("city", "Sheopur")}".trim()
                } else {
                    obj.optString("deliveryAddress", "Sheopur, MP")
                }

                list.add(
                    CustomerOrder(
                        orderId = obj.optString("orderId", obj.optString("_id", "$i")),
                        storeId = storeObj?.optString("storeId", storeObj.optString("_id")),
                        storeName = storeName,
                        items = itemsList,
                        totalAmount = obj.optDouble("totalAmount", obj.optDouble("total", 0.0)),
                        deliveryFee = obj.optDouble("deliveryFee", 0.0),
                        platformFee = obj.optDouble("platformFee", 10.0),
                        status = obj.optString("status", "pending"),
                        paymentStatus = obj.optString("paymentStatus", "pending"),
                        paymentMethod = obj.optString("paymentMethod", "COD"),
                        deliveryAddress = addressStr.takeIf { it.isNotBlank() },
                        estimatedDeliveryEta = obj.optString("deliveryEta", obj.optString("estimatedDeliveryTime")).takeIf { it.isNotBlank() },
                        createdAt = obj.optString("createdAt").takeIf { it.isNotBlank() }
                    )
                )
            }
            list
        }
    }

    suspend fun getOrderById(orderId: String): Result<CustomerOrder> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/orders/$orderId", "GET")
            val obj = json.getJSONObject("data").optJSONObject("order") ?: json.getJSONObject("data")
            val storeObj = obj.optJSONObject("store") ?: obj.optJSONObject("storeId")
            val storeName = storeObj?.optString("storeName", storeObj.optString("name", "SheoMart Local")) ?: "SheoMart Local"

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

            CustomerOrder(
                orderId = obj.optString("orderId", obj.optString("_id", orderId)),
                storeId = storeObj?.optString("storeId", storeObj.optString("_id")),
                storeName = storeName,
                items = itemsList,
                totalAmount = obj.optDouble("totalAmount", obj.optDouble("total", 0.0)),
                deliveryFee = obj.optDouble("deliveryFee", 0.0),
                platformFee = obj.optDouble("platformFee", 10.0),
                status = obj.optString("status", "pending"),
                paymentStatus = obj.optString("paymentStatus", "pending"),
                paymentMethod = obj.optString("paymentMethod", "COD"),
                deliveryAddress = obj.optString("deliveryAddress").takeIf { it.isNotBlank() },
                estimatedDeliveryEta = obj.optString("deliveryEta").takeIf { it.isNotBlank() },
                createdAt = obj.optString("createdAt").takeIf { it.isNotBlank() }
            )
        }
    }

    suspend fun createOrder(
        items: List<Pair<String, Int>>,
        storeId: String?,
        paymentMethod: String,
        addressId: String?,
        couponCode: String?
    ): Result<String> = withContext(Dispatchers.IO) {
        runCatching {
            val itemsArray = JSONArray()
            items.forEach { (productId, qty) ->
                itemsArray.put(JSONObject().put("productId", productId).put("quantity", qty))
            }
            val body = JSONObject().apply {
                put("items", itemsArray)
                if (!storeId.isNullOrBlank()) put("storeId", storeId)
                put("paymentMethod", paymentMethod)
                if (!addressId.isNullOrBlank()) put("addressId", addressId)
                if (!couponCode.isNullOrBlank()) put("couponCode", couponCode)
            }
            val json = request("/orders", "POST", body)
            val orderObj = json.optJSONObject("data")?.optJSONObject("order") ?: json.optJSONObject("data")
            orderObj?.optString("orderId", orderObj.optString("_id", "")) ?: "created"
        }
    }

    suspend fun getOrderCounts(): Result<OrderCounts> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/orders", "GET")
            val ordersArray = json.optJSONObject("data")?.optJSONArray("orders") ?: json.optJSONArray("data")
            var total = 0
            var active = 0
            if (ordersArray != null) {
                total = ordersArray.length()
                for (i in 0 until ordersArray.length()) {
                    val status = ordersArray.getJSONObject(i).optString("status", "").lowercase()
                    if (status.isNotBlank() && status != "delivered" && status != "cancelled") {
                        active++
                    }
                }
            }
            OrderCounts(total = total, active = active)
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
