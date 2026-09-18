package com.sheomart.mobile.ui.seller.inventory

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.SellerInventoryItem
import com.sheomart.mobile.data.repository.SellerRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class SellerInventoryViewModel(
    private val sellerRepository: SellerRepository
) : ViewModel() {

    private val _inventoryState = MutableStateFlow<UiState<List<SellerInventoryItem>>>(UiState.Loading)
    val inventoryState: StateFlow<UiState<List<SellerInventoryItem>>> = _inventoryState.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _actionMessage = MutableStateFlow<String?>(null)
    val actionMessage: StateFlow<String?> = _actionMessage.asStateFlow()

    private var rawItems: List<SellerInventoryItem> = emptyList()

    init {
        loadInventory()
    }

    fun loadInventory() {
        viewModelScope.launch {
            _inventoryState.value = UiState.Loading
            sellerRepository.getStoreInventory()
                .onSuccess { list ->
                    rawItems = list
                    applyFilter()
                }
                .onFailure { error ->
                    _inventoryState.value = UiState.Error(error.message ?: "Failed to load store inventory")
                }
        }
    }

    fun onSearchQueryChange(query: String) {
        _searchQuery.value = query
        applyFilter()
    }

    private fun applyFilter() {
        val q = _searchQuery.value.trim().lowercase()
        val filtered = if (q.isBlank()) rawItems else rawItems.filter { it.productName.lowercase().contains(q) }
        _inventoryState.value = UiState.Success(filtered)
    }

    fun updateStock(productId: String, newQuantity: Int) {
        if (newQuantity < 0) return
        viewModelScope.launch {
            sellerRepository.updateInventoryQuantity(productId, newQuantity)
                .onSuccess {
                    loadInventory()
                    _actionMessage.value = "Stock updated to $newQuantity"
                }
                .onFailure {
                    _actionMessage.value = "Failed to update inventory"
                }
        }
    }

    fun clearMessage() {
        _actionMessage.value = null
    }
}
