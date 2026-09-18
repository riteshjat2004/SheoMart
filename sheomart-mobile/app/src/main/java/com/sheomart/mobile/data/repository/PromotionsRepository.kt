package com.sheomart.mobile.data.repository

import com.sheomart.mobile.data.api.ApiConfig
import com.sheomart.mobile.data.model.ApiException
import com.sheomart.mobile.data.model.Coupon
import com.sheomart.mobile.data.model.PromotionOffer
import com.sheomart.mobile.utils.SecureTokenStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL

/**
 * Handles promotions API calls — coupons and festival offers.
 * Endpoints:
 *   GET /promotions/coupons/active
 *   GET /promotions/offers/active
 */
class PromotionsRepository(private val tokenStore: SecureTokenStore) {

    suspend fun getActiveCoupons(): Result<List<Coupon>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/promotions/coupons/active", "GET")
            val array = when {
                json.optJSONObject("data")?.optJSONArray("coupons") != null ->
                    json.getJSONObject("data").getJSONArray("coupons")
                json.optJSONArray("data") != null -> json.getJSONArray("data")
                else -> JSONArray()
            }
            val list = mutableListOf<Coupon>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                val code = obj.optString("code", "")
                if (code.isNotBlank()) {
                    list.add(
                        Coupon(
                            couponId      = obj.optString("couponId", obj.optString("_id", "$i")),
                            code          = code,
                            title         = obj.optString("title", "Special Coupon"),
                            discountType  = obj.optString("discountType", "percentage"),
                            discountValue = obj.optDouble("discountValue", 0.0),
                            minimumCartValue = obj.optDouble("minimumCartValue", 0.0),
                            endsAt        = obj.optString("endsAt").takeIf { it.isNotBlank() }
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
            val array = when {
                json.optJSONObject("data")?.optJSONArray("offers") != null ->
                    json.getJSONObject("data").getJSONArray("offers")
                json.optJSONArray("data") != null -> json.getJSONArray("data")
                else -> JSONArray()
            }
            val list = mutableListOf<PromotionOffer>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                list.add(
                    PromotionOffer(
                        offerId      = obj.optString("offerId", obj.optString("_id", "")),
                        title        = obj.optString("title", "Festival Offer"),
                        festivalName = obj.optString("festivalName").takeIf { it.isNotBlank() },
                        discountType = obj.optString("discountType", "percentage"),
                        discountValue = obj.optDouble("discountValue", 0.0),
                        bannerImage  = obj.optString("bannerImage").takeIf { it.isNotBlank() },
                        endsAt       = obj.optString("endsAt").takeIf { it.isNotBlank() }
                    )
                )
            }
            list
        }
    }

    private fun request(path: String, method: String): JSONObject {
        val url = URL("${ApiConfig.BASE_URL}${if (path.startsWith("/")) path else "/$path"}")
        val token = tokenStore.accessToken()
        val connection = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 10000
            readTimeout = 10000
            setRequestProperty("Accept", "application/json")
            if (!token.isNullOrBlank()) setRequestProperty("Authorization", "Bearer $token")
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
