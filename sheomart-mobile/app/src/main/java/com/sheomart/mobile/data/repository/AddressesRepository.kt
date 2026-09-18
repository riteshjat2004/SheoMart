package com.sheomart.mobile.data.repository

import com.sheomart.mobile.data.api.ApiConfig
import com.sheomart.mobile.data.model.AddressItem
import com.sheomart.mobile.data.model.ApiException
import com.sheomart.mobile.utils.SecureTokenStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.nio.charset.StandardCharsets

class AddressesRepository(private val tokenStore: SecureTokenStore) {

    suspend fun getAddresses(): Result<List<AddressItem>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/addresses", "GET")
            val array = json.optJSONObject("data")?.optJSONArray("addresses") ?: json.optJSONArray("data") ?: JSONArray()
            val list = mutableListOf<AddressItem>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                list.add(
                    AddressItem(
                        addressId = obj.optString("addressId", obj.optString("_id", "$i")),
                        title = obj.optString("title", obj.optString("type", "Home")),
                        addressLine = obj.optString("addressLine", obj.optString("address", "Sheopur, MP")),
                        landmark = obj.optString("landmark").takeIf { it.isNotBlank() },
                        city = obj.optString("city", "Sheopur"),
                        state = obj.optString("state", "Madhya Pradesh"),
                        pincode = obj.optString("pincode", "476337"),
                        receiverName = obj.optString("receiverName", obj.optString("name")).takeIf { it.isNotBlank() },
                        receiverMobile = obj.optString("receiverMobile", obj.optString("mobile")).takeIf { it.isNotBlank() },
                        isDefault = obj.optBoolean("isDefault", false)
                    )
                )
            }
            list
        }
    }

    suspend fun createAddress(
        title: String,
        addressLine: String,
        landmark: String?,
        city: String,
        state: String,
        pincode: String,
        receiverName: String?,
        receiverMobile: String?,
        isDefault: Boolean
    ): Result<AddressItem> = withContext(Dispatchers.IO) {
        runCatching {
            val body = JSONObject().apply {
                put("title", title)
                put("addressLine", addressLine)
                if (!landmark.isNullOrBlank()) put("landmark", landmark)
                put("city", city)
                put("state", state)
                put("pincode", pincode)
                if (!receiverName.isNullOrBlank()) put("receiverName", receiverName)
                if (!receiverMobile.isNullOrBlank()) put("receiverMobile", receiverMobile)
                put("isDefault", isDefault)
            }
            val json = request("/addresses", "POST", body)
            val obj = json.optJSONObject("data")?.optJSONObject("address") ?: json.optJSONObject("data")
            AddressItem(
                addressId = obj?.optString("addressId", obj.optString("_id", "")) ?: "",
                title = title,
                addressLine = addressLine,
                landmark = landmark,
                city = city,
                state = state,
                pincode = pincode,
                receiverName = receiverName,
                receiverMobile = receiverMobile,
                isDefault = isDefault
            )
        }
    }

    suspend fun updateAddress(
        addressId: String,
        title: String,
        addressLine: String,
        landmark: String?,
        city: String,
        state: String,
        pincode: String,
        receiverName: String?,
        receiverMobile: String?,
        isDefault: Boolean
    ): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            val body = JSONObject().apply {
                put("title", title)
                put("addressLine", addressLine)
                if (!landmark.isNullOrBlank()) put("landmark", landmark)
                put("city", city)
                put("state", state)
                put("pincode", pincode)
                if (!receiverName.isNullOrBlank()) put("receiverName", receiverName)
                if (!receiverMobile.isNullOrBlank()) put("receiverMobile", receiverMobile)
                put("isDefault", isDefault)
            }
            request("/addresses/$addressId", "PATCH", body)
            true
        }
    }

    suspend fun deleteAddress(addressId: String): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            request("/addresses/$addressId", "DELETE")
            true
        }
    }

    suspend fun getAddressCount(): Result<Int> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/addresses", "GET")
            json.optJSONObject("data")?.optJSONArray("addresses")?.length() ?: 0
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
