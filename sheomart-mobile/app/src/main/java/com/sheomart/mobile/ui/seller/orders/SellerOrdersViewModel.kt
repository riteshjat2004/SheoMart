package com.sheomart.mobile.ui.seller.orders

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.SellerOrderItem
import com.sheomart.mobile.data.repository.SellerRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class SellerOrdersViewModel(
    private val sellerRepository: SellerRepository
) : ViewModel() {

    private val _ordersState = MutableStateFlow<UiState<List<SellerOrderItem>>>(UiState.Loading)
    val ordersState: StateFlow<UiState<List<SellerOrderItem>>> = _ordersState.asStateFlow()

    private val _selectedTab = MutableStateFlow(0) // 0: All, 1: Pending/Preparing, 2: Delivered
    val selectedTab: StateFlow<Int> = _selectedTab.asStateFlow()

    private val _actionMessage = MutableStateFlow<String?>(null)
    val actionMessage: StateFlow<String?> = _actionMessage.asStateFlow()

    init {
        loadOrders()
    }

    fun loadOrders() {
        viewModelScope.launch {
            _ordersState.value = UiState.Loading
            sellerRepository.getStoreOrders()
                .onSuccess { orders ->
                    _ordersState.value = UiState.Success(orders)
                }
                .onFailure { error ->
                    _ordersState.value = UiState.Error(error.message ?: "Failed to load store orders")
                }
        }
    }

    fun updateStatus(orderId: String, nextStatus: String) {
        viewModelScope.launch {
            sellerRepository.updateOrderStatus(orderId, nextStatus)
                .onSuccess {
                    loadOrders()
                    _actionMessage.value = "Order status updated to $nextStatus"
                }
                .onFailure {
                    _actionMessage.value = "Failed to update status"
                }
        }
    }

    fun selectTab(tabIndex: Int) {
        _selectedTab.value = tabIndex
    }

    fun clearMessage() {
        _actionMessage.value = null
    }
}
