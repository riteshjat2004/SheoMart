package com.sheomart.mobile.data.repository

import com.sheomart.mobile.data.api.ApiConfig
import com.sheomart.mobile.data.model.*
import com.sheomart.mobile.utils.SecureTokenStore
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.nio.charset.StandardCharsets

class AuthRepository(private val tokenStore: SecureTokenStore) {
    suspend fun login(request: LoginRequest) = requestSession("/auth/login", JSONObject().put("identifier", request.identifier).put("password", request.password))
    suspend fun register(request: RegisterRequest) = requestSession("/auth/register", JSONObject().put("name", request.name).put("email", request.email).put("mobile", request.mobile).put("password", request.password))
    suspend fun currentUser(): AuthUser = userFrom(request("/users/profile", "GET", null, tokenStore.accessToken()).getJSONObject("data").getJSONObject("user"))
    suspend fun refresh(): AuthTokens { val data = request("/auth/refresh", "POST", JSONObject().put("refreshToken", tokenStore.refreshToken()), null).getJSONObject("data"); return AuthTokens(data.getString("accessToken"), data.getString("refreshToken")).also(tokenStore::saveTokens) }
    fun logout() = tokenStore.clear()
    private fun requestSession(path: String, body: JSONObject): AuthSession { val data = request(path, "POST", body, null).getJSONObject("data"); return AuthSession(userFrom(data.getJSONObject("user")), data.getString("accessToken"), data.getString("refreshToken")).also(tokenStore::save) }
    private fun request(path: String, method: String, body: JSONObject?, token: String?): JSONObject { val connection = (URL(ApiConfig.BASE_URL + path).openConnection() as HttpURLConnection).apply { requestMethod = method; connectTimeout = 10000; readTimeout = 10000; setRequestProperty("Accept", "application/json"); if (token != null) setRequestProperty("Authorization", "Bearer $token"); if (body != null) { doOutput = true; setRequestProperty("Content-Type", "application/json"); outputStream.use { it.write(body.toString().toByteArray(StandardCharsets.UTF_8)) } } }; return try { val stream = if (connection.responseCode in 200..299) connection.inputStream else connection.errorStream; val json = JSONObject(stream?.bufferedReader()?.use { it.readText() }.orEmpty().ifBlank { "{}" }); if (connection.responseCode !in 200..299) throw ApiException(connection.responseCode, json.optString("message", "Request failed")); json } catch (error: ApiException) { throw error } catch (_: IOException) { throw ApiException(0, "Unable to connect to SheoMart. Check the backend and network connection.") } finally { connection.disconnect() } }
    private fun userFrom(json: JSONObject) = AuthUser(json.getString("userId"), json.getString("name"), json.getString("email"), json.getString("mobile"), json.getString("role"), json.optBoolean("isCreditApproved"), json.optBoolean("emailVerified"), json.optBoolean("phoneVerified"), json.optBoolean("isActive", true))
}