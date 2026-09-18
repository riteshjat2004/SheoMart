package com.sheomart.mobile.ui.admin.products

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

data class AdminProductsUiState(
    val productsState: UiState<List<AdminProductItem>> = UiState.Loading,
    val pagination: AdminProductPagination = AdminProductPagination(),
    val availableStores: List<AdminStoreItem> = emptyList(),
    val availableCategories: List<AdminCategoryItem> = emptyList(),
    val searchQuery: String = "",
    val selectedStoreId: String? = null,
    val selectedCategoryId: String? = null,
    val selectedInventoryStatus: String? = null,
    val currentPage: Int = 1,
    val editingInventoryProduct: AdminProductItem? = null,
    val isSubmitting: Boolean = false,
    val feedbackMessage: String? = null
)

class AdminProductsViewModel(
    private val repository: AdminRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AdminProductsUiState())
    val uiState: StateFlow<AdminProductsUiState> = _uiState.asStateFlow()

    init {
        loadInitialData()
    }

    fun loadInitialData() {
        viewModelScope.launch {
            coroutineScope {
                val storesDeferred = async { repository.getAdminStores() }
                val categoriesDeferred = async { repository.getCategories() }

                val stores = storesDeferred.await().getOrNull() ?: emptyList()
                val categories = categoriesDeferred.await().getOrNull() ?: emptyList()

                _uiState.update {
                    it.copy(availableStores = stores, availableCategories = categories)
                }

                loadProducts()
            }
        }
    }

    fun loadProducts() {
        viewModelScope.launch {
            _uiState.update { it.copy(productsState = UiState.Loading) }
            val current = _uiState.value

            val result = repository.getAdminProducts(
                search = current.searchQuery.ifBlank { null },
                storeId = current.selectedStoreId,
                categoryId = current.selectedCategoryId,
                inventoryStatus = current.selectedInventoryStatus,
                page = current.currentPage,
                limit = 20
            )

            result.fold(
                onSuccess = { response ->
                    _uiState.update {
                        it.copy(
                            productsState = if (response.products.isEmpty()) UiState.Empty else UiState.Success(response.products),
                            pagination = response.pagination
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(productsState = UiState.Error(error.message ?: "Unable to load products"))
                    }
                }
            )
        }
    }

    fun onSearchChange(query: String) {
        _uiState.update { it.copy(searchQuery = query, currentPage = 1) }
        loadProducts()
    }

    fun onStoreFilterChange(storeId: String?) {
        _uiState.update { it.copy(selectedStoreId = storeId, currentPage = 1) }
        loadProducts()
    }

    fun onCategoryFilterChange(categoryId: String?) {
        _uiState.update { it.copy(selectedCategoryId = categoryId, currentPage = 1) }
        loadProducts()
    }

    fun onInventoryStatusFilterChange(status: String?) {
        _uiState.update { it.copy(selectedInventoryStatus = status, currentPage = 1) }
        loadProducts()
    }

    fun nextPage() {
        val current = _uiState.value
        if (current.currentPage < current.pagination.totalPages) {
            _uiState.update { it.copy(currentPage = current.currentPage + 1) }
            loadProducts()
        }
    }

    fun previousPage() {
        val current = _uiState.value
        if (current.currentPage > 1) {
            _uiState.update { it.copy(currentPage = current.currentPage - 1) }
            loadProducts()
        }
    }

    fun openInventoryDialog(product: AdminProductItem) {
        _uiState.update { it.copy(editingInventoryProduct = product) }
    }

    fun dismissInventoryDialog() {
        _uiState.update { it.copy(editingInventoryProduct = null) }
    }

    fun updateStock(quantity: Int, status: String) {
        val product = _uiState.value.editingInventoryProduct ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true) }
            val qtyResult = repository.updateInventory(product.productId, quantity)
            val statusResult = repository.updateInventoryStatus(product.productId, status)

            if (qtyResult.isSuccess || statusResult.isSuccess) {
                _uiState.update {
                    it.copy(
                        isSubmitting = false,
                        editingInventoryProduct = null,
                        feedbackMessage = "Inventory updated for '${product.name}'."
                    )
                }
                loadProducts()
            } else {
                _uiState.update {
                    it.copy(
                        isSubmitting = false,
                        feedbackMessage = qtyResult.exceptionOrNull()?.message ?: "Inventory update failed"
                    )
                }
            }
        }
    }

    fun toggleProductStatus(product: AdminProductItem) {
        viewModelScope.launch {
            val newStatus = !product.isActive
            val result = repository.updateProductStatus(product.productId, newStatus)
            result.fold(
                onSuccess = {
                    _uiState.update {
                        it.copy(feedbackMessage = "Product '${product.name}' ${if (newStatus) "activated" else "deactivated"}.")
                    }
                    loadProducts()
                },
                onFailure = { error ->
                    _uiState.update { it.copy(feedbackMessage = error.message ?: "Status toggle failed") }
                }
            )
        }
    }

    fun dismissFeedback() {
        _uiState.update { it.copy(feedbackMessage = null) }
    }
}
