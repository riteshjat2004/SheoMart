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

class BillingRepository(private val tokenStore: SecureTokenStore) {

    suspend fun getPosCatalog(): Result<List<PosProductItem>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = try {
                request("/billing/pos-catalog", "GET")
            } catch (_: Exception) {
                request("/products/me", "GET")
            }

            val array = json.optJSONObject("data")?.optJSONArray("products")
                ?: json.optJSONObject("data")?.optJSONArray("catalog")
                ?: json.optJSONArray("data")
                ?: JSONArray()

            val list = mutableListOf<PosProductItem>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                val catObj = obj.optJSONObject("category") ?: obj.optJSONObject("categoryId")
                list.add(
                    PosProductItem(
                        productId = obj.optString("productId", obj.optString("_id", "$i")),
                        name = obj.optString("name", "Product $i"),
                        sku = obj.optString("sku").takeIf { it.isNotBlank() },
                        price = obj.optDouble("price", 0.0),
                        discountPrice = if (obj.has("discountPrice")) obj.optDouble("discountPrice") else null,
                        availableQuantity = obj.optInt("availableQuantity", obj.optInt("quantity", 10)),
                        categoryName = catObj?.optString("name") ?: obj.optString("categoryName").takeIf { it.isNotBlank() },
                        thumbnail = obj.optString("thumbnail", obj.optString("imageUrl", "")).takeIf { it.isNotBlank() }
                    )
                )
            }
            list
        }
    }

    suspend fun createOfflineInvoice(
        customerId: String?,
        walkInName: String?,
        walkInPhone: String?,
        paymentMethod: String,
        amountPaid: Double,
        notes: String?,
        items: List<Pair<String, Pair<Int, Double>>> // productId -> (quantity, discount)
    ): Result<InvoiceRecord> = withContext(Dispatchers.IO) {
        runCatching {
            val itemsArray = JSONArray()
            items.forEach { (pId, pair) ->
                val (qty, disc) = pair
                itemsArray.put(
                    JSONObject().apply {
                        put("productId", pId)
                        put("quantity", qty)
                        if (disc > 0.0) put("discount", disc)
                    }
                )
            }

            val body = JSONObject().apply {
                if (!customerId.isNullOrBlank()) put("customerId", customerId)
                if (!walkInName.isNullOrBlank()) put("walkInCustomerName", walkInName)
                if (!walkInPhone.isNullOrBlank()) put("walkInCustomerPhone", walkInPhone)
                put("paymentMethod", paymentMethod)
                put("amountPaid", amountPaid)
                if (!notes.isNullOrBlank()) put("notes", notes)
                put("items", itemsArray)
            }

            val json = request("/billing/invoices", "POST", body)
            val invObj = json.optJSONObject("data")?.optJSONObject("invoice") ?: json.optJSONObject("data") ?: JSONObject()

            InvoiceRecord(
                invoiceId = invObj.optString("invoiceId", invObj.optString("_id", "INV-${System.currentTimeMillis()}")),
                invoiceNumber = invObj.optString("invoiceNumber", "INV-${System.currentTimeMillis().toString().takeLast(6)}"),
                customerName = walkInName ?: "Customer",
                customerPhone = walkInPhone,
                paymentMethod = paymentMethod,
                paymentStatus = invObj.optString("paymentStatus", if (amountPaid > 0) "PAID" else "PENDING"),
                grandTotal = invObj.optDouble("grandTotal", amountPaid),
                amountPaid = amountPaid,
                remainingAmount = invObj.optDouble("remainingAmount", 0.0),
                totalItems = items.sumOf { it.second.first },
                status = "COMPLETED",
                createdAt = invObj.optString("createdAt")
            )
        }
    }

    suspend fun listInvoices(): Result<List<InvoiceRecord>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/billing/invoices", "GET")
            val array = json.optJSONObject("data")?.optJSONArray("invoices")
                ?: json.optJSONObject("data")?.optJSONArray("data")
                ?: json.optJSONArray("data")
                ?: JSONArray()

            val list = mutableListOf<InvoiceRecord>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                list.add(
                    InvoiceRecord(
                        invoiceId = obj.optString("invoiceId", obj.optString("_id", "$i")),
                        invoiceNumber = obj.optString("invoiceNumber", "INV-$i"),
                        customerName = obj.optString("walkInCustomerName", "Walk-in Customer"),
                        customerPhone = obj.optString("walkInCustomerPhone").takeIf { it.isNotBlank() },
                        paymentMethod = obj.optString("paymentMethod", "CASH"),
                        paymentStatus = obj.optString("paymentStatus", "PAID"),
                        grandTotal = obj.optDouble("grandTotal", 0.0),
                        amountPaid = obj.optDouble("amountPaid", 0.0),
                        remainingAmount = obj.optDouble("remainingAmount", 0.0),
                        totalItems = obj.optInt("totalItems", 1),
                        status = obj.optString("status", "COMPLETED"),
                        createdAt = obj.optString("createdAt"),
                        notes = obj.optString("notes").takeIf { it.isNotBlank() }
                    )
                )
            }
            list
        }
    }

    suspend fun confirmInvoicePayment(
        invoiceId: String,
        paymentMethod: String,
        amount: Double,
        notes: String?
    ): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            val body = JSONObject().apply {
                put("paymentMethod", paymentMethod)
                put("amount", amount)
                if (!notes.isNullOrBlank()) put("notes", notes)
            }
            request("/billing/invoices/$invoiceId/payment", "PATCH", body)
            true
        }
    }

    suspend fun listPickupOrders(): Result<List<PickupOrderRecord>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/billing/pickup-orders", "GET")
            val array = json.optJSONObject("data")?.optJSONArray("orders")
                ?: json.optJSONObject("data")?.optJSONArray("data")
                ?: json.optJSONArray("data")
                ?: JSONArray()

            val list = mutableListOf<PickupOrderRecord>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                val userObj = obj.optJSONObject("customer") ?: obj.optJSONObject("user") ?: obj.optJSONObject("userId")
                val itemsArr = obj.optJSONArray("orderItems") ?: obj.optJSONArray("items")
                val itemsList = mutableListOf<OrderItemRecord>()
                if (itemsArr != null) {
                    for (j in 0 until itemsArr.length()) {
                        val itemObj = itemsArr.getJSONObject(j)
                        val prodObj = itemObj.optJSONObject("product") ?: itemObj.optJSONObject("productId")
                        itemsList.add(
                            OrderItemRecord(
                                productId = prodObj?.optString("productId", "$j") ?: itemObj.optString("productId", "$j"),
                                name = prodObj?.optString("name") ?: itemObj.optString("name", "Item $j"),
                                quantity = itemObj.optInt("quantity", 1),
                                price = itemObj.optDouble("price", 0.0)
                            )
                        )
                    }
                }

                list.add(
                    PickupOrderRecord(
                        orderId = obj.optString("orderId", obj.optString("_id", "$i")),
                        customerName = userObj?.optString("fullName", userObj.optString("name", "Customer")) ?: obj.optString("customerName", "Customer"),
                        customerPhone = userObj?.optString("mobile", userObj.optString("phone")),
                        items = itemsList,
                        totalAmount = obj.optDouble("grandTotal", obj.optDouble("totalAmount", 0.0)),
                        status = obj.optString("status", obj.optString("orderStatus", "ACCEPTED")),
                        paymentStatus = obj.optString("paymentStatus", "PAID"),
                        paymentMethod = obj.optString("paymentMethod", "PAY_AT_PICKUP"),
                        pickupSlot = obj.optString("pickupSlot", obj.optString("deliverySlot")).takeIf { it.isNotBlank() },
                        createdAt = obj.optString("createdAt")
                    )
                )
            }
            list
        }
    }

    suspend fun completePickupPayment(orderId: String, paymentMethod: String): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            val body = JSONObject().put("paymentMethod", paymentMethod)
            request("/billing/pickup-orders/$orderId/pay", "PATCH", body)
            true
        }
    }

    suspend fun updateOrderStatus(orderId: String, status: String): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            val body = JSONObject().put("status", status)
            request("/orders/$orderId/status", "PATCH", body)
            true
        }
    }

    suspend fun listStoreCustomers(): Result<List<PosCustomer>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/billing/customers", "GET")
            val array = json.optJSONObject("data")?.optJSONArray("customers")
                ?: json.optJSONObject("data")?.optJSONArray("data")
                ?: json.optJSONArray("data")
                ?: JSONArray()

            val list = mutableListOf<PosCustomer>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                val userObj = obj.optJSONObject("user") ?: obj.optJSONObject("userId")
                list.add(
                    PosCustomer(
                        customerId = obj.optString("customerId", obj.optString("_id", "$i")),
                        name = userObj?.optString("name", "Customer $i") ?: obj.optString("name", "Customer $i"),
                        mobile = userObj?.optString("mobile") ?: obj.optString("mobile"),
                        isPlus = obj.optBoolean("isPlusCustomer", false)
                    )
                )
            }
            list
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
