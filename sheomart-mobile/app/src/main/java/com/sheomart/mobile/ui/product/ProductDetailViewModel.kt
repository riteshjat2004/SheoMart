package com.sheomart.mobile.ui.product

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.Product
import com.sheomart.mobile.data.model.ProductDetail
import com.sheomart.mobile.data.repository.CartRepository
import com.sheomart.mobile.data.repository.ProductRepository
import com.sheomart.mobile.ui.cart.CartStateHolder
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.wishlist.WishlistStateHolder
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ProductDetailViewModel(
    private val productRepository: ProductRepository,
    private val cartRepository: CartRepository? = null,
    private val wishlistStateHolder: WishlistStateHolder? = null,
    private val cartStateHolder: CartStateHolder? = null
) : ViewModel() {

    private val _productState = MutableStateFlow<UiState<ProductDetail>>(UiState.Loading)
    val productState: StateFlow<UiState<ProductDetail>> = _productState.asStateFlow()

    private val _similarProductsState = MutableStateFlow<UiState<List<Product>>>(UiState.Loading)
    val similarProductsState: StateFlow<UiState<List<Product>>> = _similarProductsState.asStateFlow()

    private val _selectedImageIndex = MutableStateFlow(0)
    val selectedImageIndex: StateFlow<Int> = _selectedImageIndex.asStateFlow()

    private val _quantity = MutableStateFlow(1)
    val quantity: StateFlow<Int> = _quantity.asStateFlow()

    private val _isWishlisted = MutableStateFlow(false)
    val isWishlisted: StateFlow<Boolean> = _isWishlisted.asStateFlow()

    private val _cartItemCount = MutableStateFlow(0)
    val cartItemCount: StateFlow<Int> = cartStateHolder?.cartItemCount ?: _cartItemCount.asStateFlow()

    private val _isInCart = MutableStateFlow(false)
    val isInCart: StateFlow<Boolean> = _isInCart.asStateFlow()

    private val _isSubmittingReview = MutableStateFlow(false)
    val isSubmittingReview: StateFlow<Boolean> = _isSubmittingReview.asStateFlow()

    private val _cartActionMessage = MutableStateFlow<String?>(null)
    val cartActionMessage: StateFlow<String?> = _cartActionMessage.asStateFlow()

    fun loadProduct(productId: String) {
        viewModelScope.launch {
            _productState.value = UiState.Loading
            _similarProductsState.value = UiState.Loading
            _selectedImageIndex.value = 0
            _quantity.value = 1

            // 1. Fetch Product Details
            productRepository.getProductById(productId)
                .onSuccess { product ->
                    _productState.value = UiState.Success(product)

                    // 2. Fetch Similar Products in Parallel
                    loadSimilarProducts(product)

                    // 3. Sync Wishlist State
                    syncWishlistState(product.productId)

                    // 4. Sync Cart State
                    syncCartState(product.productId)
                }
                .onFailure { error ->
                    _productState.value = UiState.Error(error.message ?: "Failed to load product details")
                    _similarProductsState.value = UiState.Empty
                }
        }
    }

    private fun loadSimilarProducts(product: ProductDetail) {
        viewModelScope.launch {
            val categoryId = product.categoryId
            val result = if (!categoryId.isNullOrBlank()) {
                productRepository.getProducts(categoryId = categoryId)
            } else {
                productRepository.getProducts()
            }

            result.fold(
                onSuccess = { allProds ->
                    val filtered = allProds.filter { it.productId != product.productId }
                    _similarProductsState.value = if (filtered.isEmpty()) UiState.Empty else UiState.Success(filtered)
                },
                onFailure = {
                    _similarProductsState.value = UiState.Empty
                }
            )
        }
    }

    private var wishlistSyncJob: Job? = null
    private var cartSyncJob: Job? = null

    private fun syncWishlistState(productId: String) {
        if (wishlistStateHolder == null) return
        wishlistSyncJob?.cancel()
        wishlistSyncJob = viewModelScope.launch {
            wishlistStateHolder.wishlistProductIds.collect { set ->
                _isWishlisted.value = set.contains(productId)
            }
        }
    }

    private fun syncCartState(productId: String) {
        if (cartStateHolder != null) {
            cartSyncJob?.cancel()
            cartSyncJob = viewModelScope.launch {
                cartStateHolder.productQuantities.collect { map ->
                    _isInCart.value = map.containsKey(productId)
                }
            }
        } else if (cartRepository != null) {
            viewModelScope.launch {
                cartRepository.getCart()
                    .onSuccess { cart ->
                        val matchingItem = cart.items.find { it.productId == productId }
                        _isInCart.value = matchingItem != null
                        _cartItemCount.value = cart.totalItems
                    }
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
        if (wishlistStateHolder != null) {
            wishlistStateHolder.toggleWishlist(productId)
        } else {
            val current = _isWishlisted.value
            _isWishlisted.value = !current
            _cartActionMessage.value = if (!current) "Saved to wishlist ❤️" else "Removed from wishlist"
        }
    }

    fun addToCart(productId: String) {
        val countToAdd = _quantity.value
        val currentProduct = (_productState.value as? UiState.Success)?.data
        val storeId = currentProduct?.storeId

        if (cartStateHolder != null) {
            cartStateHolder.addItem(productId, countToAdd, storeId)
            _cartActionMessage.value = "Added $countToAdd item(s) to basket 🛒"
        } else if (cartRepository != null) {
            viewModelScope.launch {
                cartRepository.addCartItem(productId, countToAdd, storeId)
                    .onSuccess {
                        _isInCart.value = true
                        _cartItemCount.value += countToAdd
                        _cartActionMessage.value = "Added $countToAdd item(s) to basket 🛒"
                    }
                    .onFailure { error ->
                        _cartActionMessage.value = error.message ?: "Could not add to basket. Please retry."
                    }
            }
        } else {
            _isInCart.value = true
            _cartItemCount.value += countToAdd
            _cartActionMessage.value = "Added $countToAdd item(s) to basket 🛒"
        }
    }

    fun submitReview(
        productId: String,
        rating: Int,
        title: String? = null,
        comment: String? = null,
        onSuccess: () -> Unit = {}
    ) {
        viewModelScope.launch {
            _isSubmittingReview.value = true
            productRepository.submitProductReview(productId, rating, title, comment)
                .onSuccess { newReview ->
                    _isSubmittingReview.value = false
                    _cartActionMessage.value = "Review submitted! Thank you ⭐"

                    // Instantly append review to the current ProductDetail UI state
                    val currentSuccess = _productState.value as? UiState.Success<ProductDetail>
                    if (currentSuccess != null) {
                        val currentProd = currentSuccess.data
                        val updatedReviews = listOf(newReview) + currentProd.reviews
                        val newTotal = currentProd.totalReviews + 1
                        val newAvg = ((currentProd.rating ?: 5.0) * currentProd.totalReviews + rating) / newTotal
                        val updatedProd = currentProd.copy(
                            reviews = updatedReviews,
                            totalReviews = newTotal,
                            rating = newAvg
                        )
                        _productState.value = UiState.Success(updatedProd)
                    }
                    onSuccess()
                }
                .onFailure { error ->
                    _isSubmittingReview.value = false
                    _cartActionMessage.value = error.message ?: "Failed to submit review. Please try again."
                }
        }
    }

    fun clearMessage() {
        _cartActionMessage.value = null
    }

    fun refresh(productId: String) {
        loadProduct(productId)
    }
}
