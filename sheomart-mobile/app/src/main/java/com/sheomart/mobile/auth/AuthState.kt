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
    var loading by mutableStateOf(false)
        private set
    var error by mutableStateOf<String?>(null)
        private set

    fun updateUser(newUser: AuthUser?) {
        user = newUser
        loading = false
    }

    suspend fun restoreSession(): AuthUser? {
        loading = true
        error = null
        val restoredUser = try {
            withContext(Dispatchers.IO) { repository.currentUser() }
        } catch (firstError: ApiException) {
            try {
                withContext(Dispatchers.IO) { repository.refresh() }
                withContext(Dispatchers.IO) { repository.currentUser() }
            } catch (_: Exception) {
                repository.logout()
                null
            }
        } catch (_: Exception) {
            null
        }
        user = restoredUser
        loading = false
        return restoredUser
    }

    fun restore(scope: CoroutineScope) {
        scope.launch {
            restoreSession()
        }
    }

    fun login(scope: CoroutineScope, identifier: String, password: String, onComplete: (AuthUser) -> Unit) =
        submit(scope, onComplete) { repository.login(LoginRequest(identifier, password)).user }

    fun register(scope: CoroutineScope, request: RegisterRequest, onComplete: (AuthUser) -> Unit) =
        submit(scope, onComplete) { repository.register(request).user }

    fun logout() {
        repository.logout()
        user = null
    }

    private fun submit(scope: CoroutineScope, onComplete: (AuthUser) -> Unit, action: suspend () -> AuthUser) {
        scope.launch {
            loading = true
            error = null
            try {
                val loggedInUser = withContext(Dispatchers.IO) { action() }
                user = loggedInUser
                onComplete(loggedInUser)
            } catch (exception: Exception) {
                error = exception.message ?: "Something went wrong. Please try again."
            } finally {
                loading = false
            }
        }
    }
}