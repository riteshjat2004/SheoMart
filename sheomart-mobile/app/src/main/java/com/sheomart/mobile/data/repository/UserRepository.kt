package com.sheomart.mobile.data.repository

import com.sheomart.mobile.data.api.ApiConfig
import com.sheomart.mobile.data.model.ApiException
import com.sheomart.mobile.data.model.CustomerProfile
import com.sheomart.mobile.utils.SecureTokenStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL

/**
 * Handles user profile API calls.
 * Endpoint: GET /users/profile
 */
class UserRepository(private val tokenStore: SecureTokenStore) {

    suspend fun getProfile(): Result<CustomerProfile> = withContext(Dispatchers.IO) {
        runCatching {
            val json = request("/users/profile", "GET")
            val userObj = json.getJSONObject("data").getJSONObject("user")
            CustomerProfile(
                userId = userObj.getString("userId"),
                name = userObj.getString("name"),
                email = userObj.optString("email", ""),
                mobile = userObj.optString("mobile", ""),
                role = userObj.optString("role", "customer"),
                createdAt = userObj.optString("createdAt").takeIf { it.isNotBlank() },
                emailVerified = userObj.optBoolean("emailVerified", false),
                phoneVerified = userObj.optBoolean("phoneVerified", false),
                isCreditApproved = userObj.optBoolean("isCreditApproved", false)
            )
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
