package com.sheomart.mobile.ui.category

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.Product
import com.sheomart.mobile.data.repository.CartRepository
import com.sheomart.mobile.data.repository.ProductRepository
import com.sheomart.mobile.ui.cart.CartStateHolder
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.wishlist.WishlistStateHolder
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

enum class ProductSortOption(val label: String) {
    POPULAR("Popular"),
    PRICE_LOW("Price: Low to High"),
    PRICE_HIGH("Price: High to Low"),
    RATING("Top Rated")
}

class CategoryProductsViewModel(
    private val productRepository: ProductRepository,
    private val cartRepository: CartRepository? = null,
    private val wishlistStateHolder: WishlistStateHolder? = null,
    private val cartStateHolder: CartStateHolder? = null
) : ViewModel() {

    val wishlistProductIds: StateFlow<Set<String>> =
        wishlistStateHolder?.wishlistProductIds ?: MutableStateFlow(emptySet())

    private val _productsState = MutableStateFlow<UiState<List<Product>>>(UiState.Loading)
    val productsState: StateFlow<UiState<List<Product>>> = _productsState.asStateFlow()

    private val _selectedSort = MutableStateFlow(ProductSortOption.POPULAR)
    val selectedSort: StateFlow<ProductSortOption> = _selectedSort.asStateFlow()

    private var rawProducts: List<Product> = emptyList()

    fun loadCategoryProducts(categoryId: String) {
        viewModelScope.launch {
            _productsState.value = UiState.Loading
            productRepository.getProducts(categoryId = categoryId)
                .onSuccess { list ->
                    rawProducts = list
                    applySorting()
                }
                .onFailure { error ->
                    _productsState.value = UiState.Error(error.message ?: "Failed to load products for category")
                }
        }
    }

    fun setSort(option: ProductSortOption) {
        _selectedSort.value = option
        applySorting()
    }

    private fun applySorting() {
        if (rawProducts.isEmpty()) {
            _productsState.value = UiState.Empty
            return
        }
        val sorted = when (_selectedSort.value) {
            ProductSortOption.POPULAR -> rawProducts
            ProductSortOption.PRICE_LOW -> rawProducts.sortedBy { it.discountPrice ?: it.price }
            ProductSortOption.PRICE_HIGH -> rawProducts.sortedByDescending { it.discountPrice ?: it.price }
            ProductSortOption.RATING -> rawProducts.sortedByDescending { it.rating ?: 0.0 }
        }
        _productsState.value = UiState.Success(sorted)
    }

    fun addToCart(productId: String) {
        if (cartStateHolder != null) {
            val matching = rawProducts.find { it.productId == productId }
            cartStateHolder.addItem(productId, 1, matching?.storeId)
        } else {
            viewModelScope.launch {
                cartRepository?.addCartItem(productId, 1)
            }
        }
    }

    fun toggleWishlist(productId: String) {
        wishlistStateHolder?.toggleWishlist(productId)
    }
}
