package com.sheomart.mobile.ui.product

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.ProductDetail
import com.sheomart.mobile.data.repository.CartRepository
import com.sheomart.mobile.data.repository.ProductRepository
import com.sheomart.mobile.data.repository.WishlistRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ProductDetailViewModel(
    private val productRepository: ProductRepository,
    private val cartRepository: CartRepository? = null,
    private val wishlistRepository: WishlistRepository? = null
) : ViewModel() {

    private val _productState = MutableStateFlow<UiState<ProductDetail>>(UiState.Loading)
    val productState: StateFlow<UiState<ProductDetail>> = _productState.asStateFlow()

    private val _selectedImageIndex = MutableStateFlow(0)
    val selectedImageIndex: StateFlow<Int> = _selectedImageIndex.asStateFlow()

    private val _quantity = MutableStateFlow(1)
    val quantity: StateFlow<Int> = _quantity.asStateFlow()

    private val _isWishlisted = MutableStateFlow(false)
    val isWishlisted: StateFlow<Boolean> = _isWishlisted.asStateFlow()

    private val _cartActionMessage = MutableStateFlow<String?>(null)
    val cartActionMessage: StateFlow<String?> = _cartActionMessage.asStateFlow()

    fun loadProduct(productId: String) {
        viewModelScope.launch {
            _productState.value = UiState.Loading
            _selectedImageIndex.value = 0
            _quantity.value = 1

            productRepository.getProductById(productId)
                .onSuccess { product ->
                    _productState.value = UiState.Success(product)
                }
                .onFailure { error ->
                    _productState.value = UiState.Error(error.message ?: "Failed to load product details")
                }
        }
    }

    fun selectImage(index: Int) {
        _selectedImageIndex.value = index
    }

    fun increaseQuantity() {
        val max = (_productState.value as? UiState.Success)?.data?.quantity ?: 99
        if (_quantity.value < max) {
            _quantity.value += 1
        }
    }

    fun decreaseQuantity() {
        if (_quantity.value > 1) {
            _quantity.value -= 1
        }
    }

    fun toggleWishlist(productId: String) {
        viewModelScope.launch {
            val current = _isWishlisted.value
            _isWishlisted.value = !current
            if (wishlistRepository != null) {
                if (!current) {
                    wishlistRepository.addWishlistItem(productId)
                }
            }
        }
    }

    fun addToCart(productId: String) {
        viewModelScope.launch {
            if (cartRepository != null) {
                cartRepository.addCartItem(productId, _quantity.value)
                    .onSuccess {
                        _cartActionMessage.value = "Added ${_quantity.value} item(s) to basket"
                    }
                    .onFailure {
                        _cartActionMessage.value = "Could not add to basket. Please retry."
                    }
            } else {
                _cartActionMessage.value = "Added to basket"
            }
        }
    }

    fun clearMessage() {
        _cartActionMessage.value = null
    }
}
