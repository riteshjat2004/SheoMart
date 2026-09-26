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

    suspend fun login(request: LoginRequest) =
        requestSession("/auth/login", JSONObject()
            .put("identifier", request.identifier)
            .put("password", request.password))

    suspend fun register(request: RegisterRequest) =
        requestSession("/auth/register", JSONObject()
            .put("name", request.name)
            .put("email", request.email)
            .put("mobile", request.mobile)
            .put("password", request.password))

    suspend fun currentUser(): AuthUser =
        userFrom(request("/users/profile", "GET", null, tokenStore.accessToken())
            .getJSONObject("data").getJSONObject("user"))

    suspend fun refresh(): AuthTokens {
        val data = request("/auth/refresh", "POST",
            JSONObject().put("refreshToken", tokenStore.refreshToken()), null)
            .getJSONObject("data")
        return AuthTokens(data.getString("accessToken"), data.getString("refreshToken"))
            .also(tokenStore::saveTokens)
    }

    fun logout() = tokenStore.clear()

    // ── Forgot-password flow ──────────────────────────────────────────────────

    /** Step 1 — request OTP sent to email */
    suspend fun forgotPassword(email: String) {
        request("/auth/forgot-password", "POST",
            JSONObject().put("email", email.trim().lowercase()), null)
    }

    /** Resend OTP (same endpoint as forgotPassword) */
    suspend fun resendResetOtp(email: String) {
        request("/auth/resend-reset-otp", "POST",
            JSONObject().put("email", email.trim().lowercase()), null)
    }

    /** Step 2 — verify OTP, receive resetToken */
    suspend fun verifyResetOtp(email: String, otp: String): OtpVerifyResult {
        val data = request("/auth/verify-reset-otp", "POST",
            JSONObject()
                .put("email", email.trim().lowercase())
                .put("otp", otp.trim()),
            null).getJSONObject("data")
        return OtpVerifyResult(data.getString("resetToken"))
    }

    /** Step 3 — reset password using resetToken */
    suspend fun resetPassword(req: ResetPasswordRequest) {
        request("/auth/reset-password", "POST",
            JSONObject()
                .put("email", req.email.trim().lowercase())
                .put("resetToken", req.resetToken)
                .put("newPassword", req.newPassword)
                .put("confirmPassword", req.confirmPassword),
            null)
    }

    // ── Internals ─────────────────────────────────────────────────────────────

    private fun requestSession(path: String, body: JSONObject): AuthSession {
        val data = request(path, "POST", body, null).getJSONObject("data")
        return AuthSession(
            userFrom(data.getJSONObject("user")),
            data.getString("accessToken"),
            data.getString("refreshToken")
        ).also(tokenStore::save)
    }

    private fun request(path: String, method: String, body: JSONObject?, token: String?): JSONObject {
        val connection = (URL(ApiConfig.BASE_URL + path).openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 15000
            readTimeout = 15000
            setRequestProperty("Accept", "application/json")
            if (token != null) setRequestProperty("Authorization", "Bearer $token")
            if (body != null) {
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
                outputStream.use { it.write(body.toString().toByteArray(StandardCharsets.UTF_8)) }
            }
        }
        return try {
            val stream = if (connection.responseCode in 200..299) connection.inputStream else connection.errorStream
            val json = JSONObject(stream?.bufferedReader()?.use { it.readText() }.orEmpty().ifBlank { "{}" })
            if (connection.responseCode !in 200..299) {
                throw ApiException(connection.responseCode, json.optString("message", "Request failed"))
            }
            json
        } catch (error: ApiException) {
            throw error
        } catch (_: IOException) {
            throw ApiException(0, "Unable to connect to SheoMart. Check your network connection.")
        } finally {
            connection.disconnect()
        }
    }

    private fun userFrom(json: JSONObject): AuthUser {
        val target = if (json.has("user")) json.optJSONObject("user") ?: json else json
        return AuthUser(
            userId = target.optString("userId", target.optString("id", "")),
            name = target.optString("name", "User"),
            email = target.optString("email", ""),
            mobile = target.optString("mobile", ""),
            role = target.optString("role", "customer").lowercase().trim(),
            isCreditApproved = target.optBoolean("isCreditApproved", false),
            emailVerified = target.optBoolean("emailVerified", false),
            phoneVerified = target.optBoolean("phoneVerified", false),
            isActive = target.optBoolean("isActive", true)
        )
    }
}