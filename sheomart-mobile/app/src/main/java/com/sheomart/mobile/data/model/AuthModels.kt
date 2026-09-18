package com.sheomart.mobile.data.model

data class AuthUser(val userId: String, val name: String, val email: String, val mobile: String, val role: String, val isCreditApproved: Boolean, val emailVerified: Boolean, val phoneVerified: Boolean, val isActive: Boolean)
data class AuthSession(val user: AuthUser, val accessToken: String, val refreshToken: String)
data class AuthTokens(val accessToken: String, val refreshToken: String)
data class LoginRequest(val identifier: String, val password: String)
data class RegisterRequest(val name: String, val email: String, val mobile: String, val password: String)
class ApiException(val statusCode: Int, override val message: String) : Exception(message)