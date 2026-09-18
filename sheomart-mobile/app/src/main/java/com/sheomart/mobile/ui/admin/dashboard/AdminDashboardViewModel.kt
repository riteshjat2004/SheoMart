package com.sheomart.mobile.ui.admin.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.*
import com.sheomart.mobile.data.repository.AdminRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

data class AdminDashboardData(
    val kpis: AdminKpis = AdminKpis(),
    val pendingStores: List<AdminStoreItem> = emptyList(),
    val totalStores: Int = 0,
    val pendingApprovalCount: Int = 0,
    val activeCouponsCount: Int = 0,
    val totalCategories: Int = 0
)

data class AdminDashboardUiState(
    val dashboardState: UiState<AdminDashboardData> = UiState.Loading,
    val pendingActionStore: AdminStoreItem? = null,
    val pendingActionType: String? = null, // "approved", "rejected"
    val isActionLoading: Boolean = false,
    val feedbackMessage: String? = null
)

class AdminDashboardViewModel(
    private val repository: AdminRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AdminDashboardUiState())
    val uiState: StateFlow<AdminDashboardUiState> = _uiState.asStateFlow()

    init {
        loadDashboard()
    }

    fun loadDashboard() {
        viewModelScope.launch {
            _uiState.update { it.copy(dashboardState = UiState.Loading) }

            val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
            val cal = Calendar.getInstance(TimeZone.getTimeZone("UTC"))
            val toDate = sdf.format(cal.time)
            cal.add(Calendar.DAY_OF_YEAR, -29)
            val fromDate = sdf.format(cal.time)

            coroutineScope {
                val analyticsDeferred = async { repository.getAnalyticsOverview(from = fromDate, to = toDate) }
                val storesDeferred = async { repository.getAdminStores() }
                val couponsDeferred = async { repository.getAdminCoupons() }
                val categoriesDeferred = async { repository.getCategories() }

                val analyticsResult = analyticsDeferred.await()
                val storesResult = storesDeferred.await()
                val couponsResult = couponsDeferred.await()
                val categoriesResult = categoriesDeferred.await()

                val kpis = analyticsResult.getOrNull()?.kpis ?: AdminKpis()
                val stores = storesResult.getOrNull() ?: emptyList()
                val pendingStores = stores.filter { it.isPending }
                val coupons = couponsResult.getOrNull() ?: emptyList()
                val activeCoupons = coupons.filter { it.isActive }
                val categories = categoriesResult.getOrNull() ?: emptyList()

                val data = AdminDashboardData(
                    kpis = kpis,
                    pendingStores = pendingStores,
                    totalStores = stores.size,
                    pendingApprovalCount = pendingStores.size,
                    activeCouponsCount = activeCoupons.size,
                    totalCategories = categories.size
                )

                _uiState.update {
                    it.copy(dashboardState = UiState.Success(data))
                }
            }
        }
    }

    fun requestStoreAction(store: AdminStoreItem, status: String) {
        _uiState.update {
            it.copy(pendingActionStore = store, pendingActionType = status)
        }
    }

    fun dismissStoreAction() {
        _uiState.update {
            it.copy(pendingActionStore = null, pendingActionType = null)
        }
    }

    fun confirmStoreAction() {
        val current = _uiState.value
        val store = current.pendingActionStore ?: return
        val status = current.pendingActionType ?: return

        viewModelScope.launch {
            _uiState.update { it.copy(isActionLoading = true) }
            val result = repository.updateStoreStatus(store.storeId, status)
            result.fold(
                onSuccess = {
                    _uiState.update {
                        it.copy(
                            isActionLoading = false,
                            pendingActionStore = null,
                            pendingActionType = null,
                            feedbackMessage = "Store '${store.storeName}' status updated to $status."
                        )
                    }
                    loadDashboard()
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            isActionLoading = false,
                            feedbackMessage = error.message ?: "Unable to update store status"
                        )
                    }
                }
            )
        }
    }

    fun dismissFeedback() {
        _uiState.update { it.copy(feedbackMessage = null) }
    }
}
