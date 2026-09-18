package com.sheomart.mobile.ui.seller.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.SellerDashboardStats
import com.sheomart.mobile.data.model.SellerStoreProfile
import com.sheomart.mobile.data.repository.SellerRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class SellerDashboardViewModel(
    private val sellerRepository: SellerRepository
) : ViewModel() {

    private val _storeState = MutableStateFlow<UiState<SellerStoreProfile?>>(UiState.Loading)
    val storeState: StateFlow<UiState<SellerStoreProfile?>> = _storeState.asStateFlow()

    private val _statsState = MutableStateFlow<UiState<SellerDashboardStats>>(UiState.Loading)
    val statsState: StateFlow<UiState<SellerDashboardStats>> = _statsState.asStateFlow()

    init {
        loadDashboard()
    }

    fun loadDashboard() {
        viewModelScope.launch {
            _storeState.value = UiState.Loading
            _statsState.value = UiState.Loading

            val storeDeferred = async { sellerRepository.getMyStore() }
            val productsDeferred = async { sellerRepository.getMyProducts() }
            val ordersDeferred = async { sellerRepository.getStoreOrders() }
            val inventoryDeferred = async { sellerRepository.getStoreInventory() }

            val storeRes = storeDeferred.await()
            val productsRes = productsDeferred.await()
            val ordersRes = ordersDeferred.await()
            val inventoryRes = inventoryDeferred.await()

            storeRes.onSuccess {
                _storeState.value = UiState.Success(it)
            }.onFailure {
                _storeState.value = UiState.Error(it.message ?: "Failed to load store profile")
            }

            val products = productsRes.getOrNull() ?: emptyList()
            val orders = ordersRes.getOrNull() ?: emptyList()
            val inventory = inventoryRes.getOrNull() ?: emptyList()

            val pendingCount = orders.count { it.status.lowercase() == "pending" || it.status.lowercase() == "accepted" }
            val lowStockCount = inventory.count { it.quantity <= 5 }
            val totalRev = orders.filter { it.status.lowercase() == "delivered" || it.paymentStatus.lowercase() == "paid" }.sumOf { it.totalAmount }

            _statsState.value = UiState.Success(
                SellerDashboardStats(
                    todaysRevenue = totalRev,
                    pendingOrdersCount = pendingCount,
                    lowStockCount = lowStockCount,
                    activeProductsCount = products.count { it.isActive }
                )
            )
        }
    }
}
