package com.sheomart.mobile.data.model

import com.sheomart.mobile.navigation.Routes

object UserRoles {
    const val CUSTOMER = "customer"
    const val STORE_OWNER = "store_owner"
    const val PLATFORM_ADMIN = "platform_admin"

    fun isPlatformAdmin(role: String?): Boolean {
        val r = role?.lowercase()?.trim() ?: return false
        return r == PLATFORM_ADMIN || r == "admin" || r == "administrator"
    }

    fun isStoreOwner(role: String?): Boolean {
        val r = role?.lowercase()?.trim() ?: return false
        return r == STORE_OWNER || r == "seller" || r == "merchant"
    }

    fun isCustomer(role: String?): Boolean {
        val r = role?.lowercase()?.trim() ?: return false
        return r == CUSTOMER || r == "user"
    }

    fun getDashboardRoute(role: String?): String {
        return when {
            isPlatformAdmin(role) -> Routes.AdminDashboard
            isStoreOwner(role) -> Routes.SellerDashboard
            else -> Routes.Home
        }
    }
}

data class AuthUser(
    val userId: String,
    val name: String,
    val email: String,
    val mobile: String,
    val role: String,
    val isCreditApproved: Boolean,
    val emailVerified: Boolean,
    val phoneVerified: Boolean,
    val isActive: Boolean
) {
    val isPlatformAdmin: Boolean get() = UserRoles.isPlatformAdmin(role)
    val isStoreOwner: Boolean get() = UserRoles.isStoreOwner(role)
    val isCustomer: Boolean get() = UserRoles.isCustomer(role)
}

data class AuthSession(val user: AuthUser, val accessToken: String, val refreshToken: String)
data class AuthTokens(val accessToken: String, val refreshToken: String)
data class LoginRequest(val identifier: String, val password: String)
data class RegisterRequest(val name: String, val email: String, val mobile: String, val password: String)

/** Forgot-password flow DTOs */
data class ForgotPasswordRequest(val email: String)
data class VerifyOtpRequest(val email: String, val otp: String)
data class ResetPasswordRequest(val email: String, val resetToken: String, val newPassword: String, val confirmPassword: String)
data class OtpVerifyResult(val resetToken: String)

class ApiException(val statusCode: Int, override val message: String) : Exception(message)