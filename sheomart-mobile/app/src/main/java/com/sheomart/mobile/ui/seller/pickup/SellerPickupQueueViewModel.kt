package com.sheomart.mobile.ui.seller.pickup

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.PickupOrderRecord
import com.sheomart.mobile.data.repository.BillingRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class SellerPickupQueueViewModel(
    private val billingRepository: BillingRepository
) : ViewModel() {

    private val _ordersState = MutableStateFlow<UiState<List<PickupOrderRecord>>>(UiState.Loading)
    val ordersState: StateFlow<UiState<List<PickupOrderRecord>>> = _ordersState.asStateFlow()

    private val _selectedTab = MutableStateFlow(0) // 0: All, 1: Preparing, 2: Ready for Pickup, 3: Completed
    val selectedTab: StateFlow<Int> = _selectedTab.asStateFlow()

    private val _actionMessage = MutableStateFlow<String?>(null)
    val actionMessage: StateFlow<String?> = _actionMessage.asStateFlow()

    init {
        loadPickupOrders()
    }

    fun loadPickupOrders() {
        viewModelScope.launch {
            _ordersState.value = UiState.Loading
            billingRepository.listPickupOrders()
                .onSuccess { _ordersState.value = UiState.Success(it) }
                .onFailure { _ordersState.value = UiState.Error(it.message ?: "Failed to load pickup orders") }
        }
    }

    fun selectTab(index: Int) {
        _selectedTab.value = index
    }

    fun markReadyForPickup(orderId: String) {
        viewModelScope.launch {
            billingRepository.updateOrderStatus(orderId, "READY_FOR_PICKUP")
                .onSuccess {
                    _actionMessage.value = "Order marked ready for pickup."
                    loadPickupOrders()
                }
                .onFailure { _actionMessage.value = it.message ?: "Failed to update order status." }
        }
    }

    fun completeHandover(orderId: String) {
        viewModelScope.launch {
            billingRepository.updateOrderStatus(orderId, "DELIVERED")
                .onSuccess {
                    _actionMessage.value = "Order successfully handed over to customer."
                    loadPickupOrders()
                }
                .onFailure { _actionMessage.value = it.message ?: "Failed to complete handover." }
        }
    }

    fun collectPaymentAndHandover(orderId: String, method: String) {
        viewModelScope.launch {
            billingRepository.completePickupPayment(orderId, method)
                .onSuccess {
                    billingRepository.updateOrderStatus(orderId, "DELIVERED")
                    _actionMessage.value = "Payment recorded ($method) & order handed over."
                    loadPickupOrders()
                }
                .onFailure { _actionMessage.value = it.message ?: "Failed to record pickup payment." }
        }
    }

    fun clearActionMessage() {
        _actionMessage.value = null
    }
}
