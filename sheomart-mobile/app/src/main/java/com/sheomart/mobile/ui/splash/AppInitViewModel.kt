package com.sheomart.mobile.ui.splash

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.auth.AuthState
import com.sheomart.mobile.data.api.ApiConfig
import com.sheomart.mobile.data.model.AuthUser
import com.sheomart.mobile.data.model.UserRoles
import com.sheomart.mobile.navigation.Routes
import com.sheomart.mobile.utils.SecureTokenStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

/**
 * State representing app initialization lifecycle.
 */
sealed interface InitState {
    object Initializing : InitState
    object Retrying : InitState
    object NoInternet : InitState
    object ServerError : InitState
    data class Completed(val destinationRoute: String) : InitState
}

/**
 * Production App Initialization & Cold Start Manager for SheoMart Mobile.
 *
 * Responsibilities:
 * 1. Internet connection verification (crash-proof).
 * 2. Connects to production backend (https://sheomart.onrender.com), absorbing Render
 *    cold start latency (up to 30s) with exponential backoff and dynamic status messages.
 * 3. Restores encrypted session tokens via SecureTokenStore & AuthState.
 * 4. Resolves role-based destination (Customer Home, Seller Dashboard, Admin Dashboard, or Login).
 * 5. Guarantees a minimum 1.5s splash animation to avoid visual flickering.
 */
class AppInitViewModel(
    context: Context,
    private val authState: AuthState
) : ViewModel() {

    private val appContext = context.applicationContext
    private val tokenStore = SecureTokenStore(appContext)

    var state by mutableStateOf<InitState>(InitState.Initializing)
        private set

    var statusText by mutableStateOf("Connecting to SheoMart…")
        private set

    private val coldStartMessages = listOf(
        "Connecting to SheoMart…",
        "Waking up marketplace…",
        "Starting marketplace servers…",
        "Loading nearby grocery stores…",
        "Preparing fresh catalog…",
        "Restoring your secure session…",
        "Almost ready…"
    )

    fun startInitialization() {
        state = InitState.Initializing
        viewModelScope.launch {
            try {
                // Minimum 1.5s brand intro window
                val minDelayJob = launch { delay(1500L) }

                // Dynamic message rotation ticker during cold start
                var isRunning = true
                val tickerJob = launch {
                    var index = 0
                    while (isRunning) {
                        statusText = coldStartMessages[index % coldStartMessages.size]
                        index++
                        delay(2800L)
                    }
                }

                val success = executeInitFlow()

                isRunning = false
                tickerJob.cancel()

                minDelayJob.join()

                if (success) {
                    val destination = resolveDestination(authState.user)
                    state = InitState.Completed(destination)
                }
            } catch (_: Exception) {
                state = InitState.ServerError
                statusText = "Unable to connect to SheoMart"
            }
        }
    }

    fun retry() {
        state = InitState.Retrying
        startInitialization()
    }

    private suspend fun executeInitFlow(): Boolean {
        // 1. Internet availability
        if (!hasInternetConnection()) {
            state = InitState.NoInternet
            statusText = "No internet connection"
            return false
        }

        // 2. Ping backend with exponential backoff (Render cold-start absorption)
        val isBackendReachable = pingBackendWithBackoff()
        if (!isBackendReachable) {
            state = InitState.ServerError
            statusText = "Unable to connect to SheoMart"
            return false
        }

        // 3. Restore session if tokens exist
        try {
            val hasTokens = tokenStore.accessToken() != null || tokenStore.refreshToken() != null
            if (hasTokens) {
                statusText = "Restoring your secure session…"
                val restoredUser = authState.restoreSession()
                if (restoredUser != null) {
                    statusText = "Welcome back, ${restoredUser.name}!"
                } else {
                    statusText = "Ready"
                }
            } else {
                statusText = "Ready"
                authState.updateUser(null)
            }
        } catch (_: Exception) {
            authState.updateUser(null)
        }

        return true
    }

    private fun resolveDestination(user: AuthUser?): String {
        if (user == null) return Routes.Login
        return UserRoles.getDashboardRoute(user.role)
    }

    private fun hasInternetConnection(): Boolean {
        return try {
            val cm = appContext.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
                ?: return true
            val network = cm.activeNetwork ?: return false
            val capabilities = cm.getNetworkCapabilities(network) ?: return false
            capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
        } catch (_: Exception) {
            true // Fallback to allowing connection attempt rather than blocking
        }
    }

    private suspend fun pingBackendWithBackoff(): Boolean {
        val maxDurationMs = 30000L
        val baseDelayMs = 1500L
        var attempt = 0
        var elapsedMs = 0L

        while (elapsedMs < maxDurationMs) {
            val isUp = withContext(Dispatchers.IO) { checkServerHealth() }
            if (isUp) return true

            attempt++
            val nextDelay = minOf(baseDelayMs * (1L shl (attempt - 1)), 6000L)
            delay(nextDelay)
            elapsedMs += nextDelay
        }

        return false
    }

    private fun checkServerHealth(): Boolean {
        return try {
            val url = URL(ApiConfig.PRODUCTION_ROOT_URL)
            val connection = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = 5000
                readTimeout = 5000
                instanceFollowRedirects = true
            }
            val responseCode = connection.responseCode
            connection.disconnect()
            responseCode in 200..499
        } catch (_: Exception) {
            false
        }
    }
}
