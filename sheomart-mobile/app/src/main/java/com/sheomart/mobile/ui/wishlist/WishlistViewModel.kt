package com.sheomart.mobile.ui.wishlist

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.WishlistItem
import com.sheomart.mobile.data.repository.CartRepository
import com.sheomart.mobile.data.repository.WishlistRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class WishlistViewModel(
    private val wishlistRepository: WishlistRepository,
    private val cartRepository: CartRepository? = null
) : ViewModel() {

    private val _wishlistState = MutableStateFlow<UiState<List<WishlistItem>>>(UiState.Loading)
    val wishlistState: StateFlow<UiState<List<WishlistItem>>> = _wishlistState.asStateFlow()

    private val _actionMessage = MutableStateFlow<String?>(null)
    val actionMessage: StateFlow<String?> = _actionMessage.asStateFlow()

    init {
        loadWishlist()
    }

    fun loadWishlist() {
        viewModelScope.launch {
            _wishlistState.value = UiState.Loading
            wishlistRepository.getWishlist()
                .onSuccess { items ->
                    _wishlistState.value = UiState.Success(items)
                }
                .onFailure { error ->
                    _wishlistState.value = UiState.Error(error.message ?: "Failed to load wishlist items")
                }
        }
    }

    fun removeItem(wishlistItemId: String) {
        viewModelScope.launch {
            wishlistRepository.removeWishlistItem(wishlistItemId)
                .onSuccess {
                    loadWishlist()
                    _actionMessage.value = "Removed from wishlist"
                }
        }
    }

    fun moveToCart(item: WishlistItem) {
        viewModelScope.launch {
            if (cartRepository != null) {
                cartRepository.addCartItem(item.productId, 1)
                    .onSuccess {
                        wishlistRepository.removeWishlistItem(item.wishlistItemId)
                        loadWishlist()
                        _actionMessage.value = "Moved '${item.productName}' to basket"
                    }
                    .onFailure {
                        _actionMessage.value = "Failed to add to basket"
                    }
            }
        }
    }

    fun clearMessage() {
        _actionMessage.value = null
    }
}
