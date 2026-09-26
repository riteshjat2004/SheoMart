package com.sheomart.mobile.ui.auth

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.ResetPasswordRequest
import com.sheomart.mobile.data.repository.AuthRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * ViewModel managing the three-step forgot-password flow:
 *  Step 1 — ForgotPasswordScreen  (submit email → send OTP)
 *  Step 2 — OtpVerificationScreen (submit OTP → receive resetToken)
 *  Step 3 — ResetPasswordScreen   (submit new password → success)
 */
class ForgotPasswordViewModel(private val repository: AuthRepository) : ViewModel() {

    var loading by mutableStateOf(false)
        private set

    var error by mutableStateOf<String?>(null)
        private set

    /** Called after a successful OTP verification; holds the one-time token for password reset. */
    var resetToken by mutableStateOf("")
        private set

    /** Whether the password reset completed successfully. */
    var resetSuccess by mutableStateOf(false)
        private set

    fun clearError() { error = null }

    // ── Step 1 ────────────────────────────────────────────────────────────────
    fun sendOtp(email: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            loading = true
            error = null
            try {
                withContext(Dispatchers.IO) { repository.forgotPassword(email) }
                onSuccess()
            } catch (e: Exception) {
                error = e.message ?: "Failed to send OTP. Please try again."
            } finally {
                loading = false
            }
        }
    }

    // ── Step 2 ────────────────────────────────────────────────────────────────
    fun verifyOtp(email: String, otp: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            loading = true
            error = null
            try {
                val result = withContext(Dispatchers.IO) { repository.verifyResetOtp(email, otp) }
                resetToken = result.resetToken
                onSuccess()
            } catch (e: Exception) {
                error = e.message ?: "Invalid or expired OTP. Please try again."
            } finally {
                loading = false
            }
        }
    }

    fun resendOtp(email: String) {
        viewModelScope.launch {
            loading = true
            error = null
            try {
                withContext(Dispatchers.IO) { repository.resendResetOtp(email) }
            } catch (e: Exception) {
                error = e.message ?: "Could not resend OTP. Please try again."
            } finally {
                loading = false
            }
        }
    }

    // ── Step 3 ────────────────────────────────────────────────────────────────
    fun resetPassword(
        email: String,
        newPassword: String,
        confirmPassword: String,
        onSuccess: () -> Unit,
    ) {
        viewModelScope.launch {
            loading = true
            error = null
            try {
                withContext(Dispatchers.IO) {
                    repository.resetPassword(
                        ResetPasswordRequest(
                            email = email,
                            resetToken = resetToken,
                            newPassword = newPassword,
                            confirmPassword = confirmPassword,
                        )
                    )
                }
                resetSuccess = true
                onSuccess()
            } catch (e: Exception) {
                error = e.message ?: "Password reset failed. Please try again."
            } finally {
                loading = false
            }
        }
    }
}
