package com.sheomart.mobile.ui.cart

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.CartData
import com.sheomart.mobile.data.repository.CartRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class CartViewModel(
    private val cartRepository: CartRepository
) : ViewModel() {

    private val _cartState = MutableStateFlow<UiState<CartData>>(UiState.Loading)
    val cartState: StateFlow<UiState<CartData>> = _cartState.asStateFlow()

    private val _isUpdating = MutableStateFlow(false)
    val isUpdating: StateFlow<Boolean> = _isUpdating.asStateFlow()

    init {
        loadCart()
    }

    fun loadCart() {
        viewModelScope.launch {
            _cartState.value = UiState.Loading
            cartRepository.getCart()
                .onSuccess { data ->
                    _cartState.value = UiState.Success(data)
                }
                .onFailure { error ->
                    _cartState.value = UiState.Error(error.message ?: "Failed to load shopping cart")
                }
        }
    }

    fun updateQuantity(cartItemId: String, newQty: Int) {
        if (newQty <= 0) {
            removeItem(cartItemId)
            return
        }
        viewModelScope.launch {
            _isUpdating.value = true
            cartRepository.updateCartItem(cartItemId, newQty)
                .onSuccess {
                    loadCart()
                }
            _isUpdating.value = false
        }
    }

    fun removeItem(cartItemId: String) {
        viewModelScope.launch {
            _isUpdating.value = true
            cartRepository.removeCartItem(cartItemId)
                .onSuccess {
                    loadCart()
                }
            _isUpdating.value = false
        }
    }

    fun clearCart() {
        viewModelScope.launch {
            _isUpdating.value = true
            cartRepository.clearCart()
                .onSuccess {
                    loadCart()
                }
            _isUpdating.value = false
        }
    }
}
