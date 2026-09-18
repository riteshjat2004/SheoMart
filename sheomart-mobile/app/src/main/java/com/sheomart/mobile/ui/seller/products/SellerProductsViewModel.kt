package com.sheomart.mobile.ui.seller.products

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.SellerProductItem
import com.sheomart.mobile.data.repository.SellerRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class SellerProductsViewModel(
    private val sellerRepository: SellerRepository
) : ViewModel() {

    private val _productsState = MutableStateFlow<UiState<List<SellerProductItem>>>(UiState.Loading)
    val productsState: StateFlow<UiState<List<SellerProductItem>>> = _productsState.asStateFlow()

    private val _actionMessage = MutableStateFlow<String?>(null)
    val actionMessage: StateFlow<String?> = _actionMessage.asStateFlow()

    init {
        loadProducts()
    }

    fun loadProducts() {
        viewModelScope.launch {
            _productsState.value = UiState.Loading
            sellerRepository.getMyProducts()
                .onSuccess { list ->
                    _productsState.value = UiState.Success(list)
                }
                .onFailure { error ->
                    _productsState.value = UiState.Error(error.message ?: "Failed to load store products")
                }
        }
    }

    fun addProduct(name: String, description: String?, price: Double, discountPrice: Double?, quantity: Int, categoryId: String?, brand: String?) {
        viewModelScope.launch {
            sellerRepository.createProduct(name, description, price, discountPrice, quantity, categoryId, brand)
                .onSuccess {
                    loadProducts()
                    _actionMessage.value = "Product created successfully"
                }
                .onFailure {
                    _actionMessage.value = "Failed to create product: ${it.message}"
                }
        }
    }

    fun toggleProductStatus(productId: String, currentStatus: Boolean) {
        viewModelScope.launch {
            sellerRepository.updateProductStatus(productId, !currentStatus)
                .onSuccess {
                    loadProducts()
                    _actionMessage.value = if (!currentStatus) "Product activated" else "Product deactivated"
                }
        }
    }

    fun deleteProduct(productId: String) {
        viewModelScope.launch {
            sellerRepository.deleteProduct(productId)
                .onSuccess {
                    loadProducts()
                    _actionMessage.value = "Product deleted"
                }
        }
    }

    fun clearMessage() {
        _actionMessage.value = null
    }
}
