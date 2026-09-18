package com.sheomart.mobile.ui.admin.stores

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.AdminStoreItem
import com.sheomart.mobile.data.repository.AdminRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class AdminStoresUiState(
    val storesState: UiState<List<AdminStoreItem>> = UiState.Loading,
    val searchQuery: String = "",
    val selectedStatusFilter: String = "all", // "all", "pending", "approved", "rejected", "suspended"
    val pendingActionStore: AdminStoreItem? = null,
    val pendingActionStatus: String? = null,
    val badgeDialogStore: AdminStoreItem? = null,
    val isActionLoading: Boolean = false,
    val feedbackMessage: String? = null
)

class AdminStoresViewModel(
    private val repository: AdminRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AdminStoresUiState())
    val uiState: StateFlow<AdminStoresUiState> = _uiState.asStateFlow()

    private var allStoresCache: List<AdminStoreItem> = emptyList()

    init {
        loadStores()
    }

    fun loadStores() {
        viewModelScope.launch {
            _uiState.update { it.copy(storesState = UiState.Loading) }
            val result = repository.getAdminStores()
            result.fold(
                onSuccess = { stores ->
                    allStoresCache = stores
                    applyFilters()
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(storesState = UiState.Error(error.message ?: "Unable to load stores"))
                    }
                }
            )
        }
    }

    fun onSearchChange(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
        applyFilters()
    }

    fun onStatusFilterChange(status: String) {
        _uiState.update { it.copy(selectedStatusFilter = status) }
        applyFilters()
    }

    private fun applyFilters() {
        val query = _uiState.value.searchQuery.trim().lowercase()
        val filter = _uiState.value.selectedStatusFilter

        val filtered = allStoresCache.filter { store ->
            val matchesFilter = filter == "all" || store.status.equals(filter, ignoreCase = true)
            val matchesQuery = query.isBlank() ||
                store.storeName.lowercase().contains(query) ||
                (store.ownerName?.lowercase()?.contains(query) == true) ||
                (store.city?.lowercase()?.contains(query) == true) ||
                (store.ownerMobile?.contains(query) == true)
            matchesFilter && matchesQuery
        }

        _uiState.update {
            it.copy(
                storesState = if (filtered.isEmpty()) UiState.Empty else UiState.Success(filtered)
            )
        }
    }

    fun requestStatusAction(store: AdminStoreItem, status: String) {
        _uiState.update { it.copy(pendingActionStore = store, pendingActionStatus = status) }
    }

    fun dismissStatusAction() {
        _uiState.update { it.copy(pendingActionStore = null, pendingActionStatus = null) }
    }

    fun confirmStatusAction() {
        val current = _uiState.value
        val store = current.pendingActionStore ?: return
        val status = current.pendingActionStatus ?: return

        viewModelScope.launch {
            _uiState.update { it.copy(isActionLoading = true) }
            val result = repository.updateStoreStatus(store.storeId, status)
            result.fold(
                onSuccess = {
                    _uiState.update {
                        it.copy(
                            isActionLoading = false,
                            pendingActionStore = null,
                            pendingActionStatus = null,
                            feedbackMessage = "Store '${store.storeName}' status updated to $status."
                        )
                    }
                    loadStores()
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            isActionLoading = false,
                            feedbackMessage = error.message ?: "Unable to update status"
                        )
                    }
                }
            )
        }
    }

    fun openBadgeDialog(store: AdminStoreItem) {
        _uiState.update { it.copy(badgeDialogStore = store) }
    }

    fun dismissBadgeDialog() {
        _uiState.update { it.copy(badgeDialogStore = null) }
    }

    fun updateBadge(badge: String) {
        val store = _uiState.value.badgeDialogStore ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isActionLoading = true) }
            val result = repository.updateStoreBadge(store.storeId, badge)
            result.fold(
                onSuccess = {
                    _uiState.update {
                        it.copy(
                            isActionLoading = false,
                            badgeDialogStore = null,
                            feedbackMessage = "Badge updated to '$badge' for '${store.storeName}'."
                        )
                    }
                    loadStores()
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            isActionLoading = false,
                            feedbackMessage = error.message ?: "Unable to update badge"
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
