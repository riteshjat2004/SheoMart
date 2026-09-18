package com.sheomart.mobile.auth

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.sheomart.mobile.data.model.ApiException
import com.sheomart.mobile.data.model.AuthUser
import com.sheomart.mobile.data.model.LoginRequest
import com.sheomart.mobile.data.model.RegisterRequest
import com.sheomart.mobile.data.repository.AuthRepository
import com.sheomart.mobile.utils.SecureTokenStore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class AuthState(context: Context) {
    private val repository = AuthRepository(SecureTokenStore(context.applicationContext))
    var user by mutableStateOf<AuthUser?>(null)
        private set
    var loading by mutableStateOf(true)
        private set
    var error by mutableStateOf<String?>(null)
        private set

    fun restore(scope: CoroutineScope) {
        scope.launch {
            loading = true
            error = null
            try {
                user = withContext(Dispatchers.IO) { repository.currentUser() }
            } catch (firstError: ApiException) {
                try {
                    withContext(Dispatchers.IO) { repository.refresh() }
                    user = withContext(Dispatchers.IO) { repository.currentUser() }
                } catch (_: Exception) {
                    repository.logout()
                    user = null
                }
            } catch (_: Exception) {
                user = null
            } finally {
                loading = false
            }
        }
    }

    fun login(scope: CoroutineScope, identifier: String, password: String, onComplete: () -> Unit) =
        submit(scope, onComplete) { repository.login(LoginRequest(identifier, password)).user }

    fun register(scope: CoroutineScope, request: RegisterRequest, onComplete: () -> Unit) =
        submit(scope, onComplete) { repository.register(request).user }

    fun logout() {
        repository.logout()
        user = null
    }

    private fun submit(scope: CoroutineScope, onComplete: () -> Unit, action: suspend () -> AuthUser) {
        scope.launch {
            loading = true
            error = null
            try {
                user = withContext(Dispatchers.IO) { action() }
                onComplete()
            } catch (exception: Exception) {
                error = exception.message ?: "Something went wrong. Please try again."
            } finally {
                loading = false
            }
        }
    }
}