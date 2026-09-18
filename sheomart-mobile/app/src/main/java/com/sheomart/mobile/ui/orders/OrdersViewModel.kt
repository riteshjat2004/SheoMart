package com.sheomart.mobile.ui.orders

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.CustomerOrder
import com.sheomart.mobile.data.repository.OrdersRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class OrdersViewModel(
    private val ordersRepository: OrdersRepository
) : ViewModel() {

    private val _ordersState = MutableStateFlow<UiState<List<CustomerOrder>>>(UiState.Loading)
    val ordersState: StateFlow<UiState<List<CustomerOrder>>> = _ordersState.asStateFlow()

    private val _selectedTab = MutableStateFlow(0) // 0: All, 1: Active, 2: Delivered
    val selectedTab: StateFlow<Int> = _selectedTab.asStateFlow()

    init {
        loadOrders()
    }

    fun loadOrders() {
        viewModelScope.launch {
            _ordersState.value = UiState.Loading
            ordersRepository.getCustomerOrders()
                .onSuccess { orders ->
                    _ordersState.value = UiState.Success(orders)
                }
                .onFailure { error ->
                    _ordersState.value = UiState.Error(error.message ?: "Failed to load orders")
                }
        }
    }

    fun selectTab(tabIndex: Int) {
        _selectedTab.value = tabIndex
    }
}
