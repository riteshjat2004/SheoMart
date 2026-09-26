package com.sheomart.mobile.ui.cart

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.CartData
import com.sheomart.mobile.data.model.CartItem
import com.sheomart.mobile.data.model.Coupon
import com.sheomart.mobile.data.repository.CartRepository
import com.sheomart.mobile.ui.wishlist.WishlistStateHolder
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/**
 * Single source of truth for Shopping Cart state.
 * Shared across Home, Explore, Product Details, Category, Wishlist, and Profile.
 * Provides live cart counts, O(1) product quantity checks, and optimistic updates.
 */
class CartStateHolder(
    private val repository: CartRepository
) : ViewModel() {

    // -- Authoritative cart data
    private val _cartData = MutableStateFlow(CartData())
    val cartData: StateFlow<CartData> = _cartData.asStateFlow()

    // -- Live item count for bottom nav and headers
    private val _cartItemCount = MutableStateFlow(0)
    val cartItemCount: StateFlow<Int> = _cartItemCount.asStateFlow()

    // -- O(1) product ID -> quantity mapping for quick checks
    private val _productQuantities = MutableStateFlow<Map<String, Int>>(emptyMap())
    val productQuantities: StateFlow<Map<String, Int>> = _productQuantities.asStateFlow()

    // -- Loading state
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    // -- Per-item updating IDs (for item-level spinner)
    private val _updatingItemIds = MutableStateFlow<Set<String>>(emptySet())
    val updatingItemIds: StateFlow<Set<String>> = _updatingItemIds.asStateFlow()

    // -- Applied Coupon
    private val _appliedCoupon = MutableStateFlow<Coupon?>(null)
    val appliedCoupon: StateFlow<Coupon?> = _appliedCoupon.asStateFlow()

    // -- Feedback message for Snackbars
    private val _actionMessage = MutableStateFlow<String?>(null)
    val actionMessage: StateFlow<String?> = _actionMessage.asStateFlow()

    init {
        loadCart()
    }

    fun loadCart() {
        viewModelScope.launch {
            _isLoading.value = true
            repository.getCart()
                .onSuccess { data ->
                    updateCartState(data)
                }
            _isLoading.value = false
        }
    }

    private fun updateCartState(data: CartData) {
        val coupon = _appliedCoupon.value
        val discountAmount = if (coupon != null) calculateCouponDiscount(data.subtotal, coupon) else data.discountAmount
        val total = (data.subtotal + data.platformFee + data.deliveryFee - discountAmount).coerceAtLeast(0.0)

        val updated = data.copy(
            appliedCoupon = coupon,
            appliedCouponCode = coupon?.code ?: data.appliedCouponCode,
            discountAmount = discountAmount,
            totalAmount = total
        )

        _cartData.value = updated
        _cartItemCount.value = updated.totalItems
        _productQuantities.value = updated.items.associate { it.productId to it.quantity }
    }

    private fun calculateCouponDiscount(subtotal: Double, coupon: Coupon): Double {
        if (subtotal < coupon.minimumCartValue) return 0.0
        return when (coupon.discountType.lowercase()) {
            "percentage", "percent" -> (subtotal * (coupon.discountValue / 100.0)).coerceAtMost(subtotal)
            else -> coupon.discountValue.coerceAtMost(subtotal)
        }
    }

    // -- Add Item (from Home, Product Details, Category, Wishlist)
    fun addItem(productId: String, quantity: Int = 1, storeId: String? = null) {
        viewModelScope.launch {
            _updatingItemIds.update { it + productId }
            repository.addCartItem(productId, quantity, storeId)
                .onSuccess {
                    _actionMessage.value = "Added to basket 🛒"
                    repository.getCart().onSuccess { updateCartState(it) }
                }
                .onFailure { error ->
                    _actionMessage.value = error.message ?: "Could not add item to basket"
                }
            _updatingItemIds.update { it - productId }
        }
    }

    // -- Update Quantity (from CartScreen stepper)
    fun updateQuantity(cartItemId: String, newQty: Int) {
        if (newQty <= 0) {
            removeItem(cartItemId)
            return
        }

        val currentItem = _cartData.value.items.find { it.cartItemId == cartItemId }
        if (currentItem != null && newQty > currentItem.maxAvailableQuantity) {
            _actionMessage.value = "Only ${currentItem.maxAvailableQuantity} items available in stock"
            return
        }

        // Optimistic UI update
        val updatedItems = _cartData.value.items.map {
            if (it.cartItemId == cartItemId) it.copy(quantity = newQty) else it
        }
        val newSubtotal = updatedItems.sumOf { it.totalPrice }
        val newDelivery = if (newSubtotal >= 499.0 || newSubtotal == 0.0) 0.0 else 40.0
        val newSavings = updatedItems.sumOf { it.savings }
        val couponDiscount = _appliedCoupon.value?.let { calculateCouponDiscount(newSubtotal, it) } ?: 0.0
        val newTotal = (newSubtotal + _cartData.value.platformFee + newDelivery - couponDiscount).coerceAtLeast(0.0)

        _cartData.value = _cartData.value.copy(
            items = updatedItems,
            subtotal = newSubtotal,
            deliveryFee = newDelivery,
            estimatedSavings = newSavings,
            discountAmount = couponDiscount,
            totalAmount = newTotal
        )
        _cartItemCount.value = updatedItems.sumOf { it.quantity }
        _productQuantities.value = updatedItems.associate { it.productId to it.quantity }

        viewModelScope.launch {
            _updatingItemIds.update { it + cartItemId }
            repository.updateCartItem(cartItemId, newQty)
                .onSuccess {
                    repository.getCart().onSuccess { updateCartState(it) }
                }
                .onFailure { error ->
                    _actionMessage.value = error.message ?: "Could not update item"
                    repository.getCart().onSuccess { updateCartState(it) }
                }
            _updatingItemIds.update { it - cartItemId }
        }
    }

    // -- Remove Item
    fun removeItem(cartItemId: String): CartItem? {
        val item = _cartData.value.items.find { it.cartItemId == cartItemId } ?: return null

        // Optimistic remove
        val updatedItems = _cartData.value.items.filter { it.cartItemId != cartItemId }
        val newSubtotal = updatedItems.sumOf { it.totalPrice }
        val newDelivery = if (newSubtotal >= 499.0 || newSubtotal == 0.0) 0.0 else 40.0
        val newSavings = updatedItems.sumOf { it.savings }
        val couponDiscount = _appliedCoupon.value?.let { calculateCouponDiscount(newSubtotal, it) } ?: 0.0
        val newTotal = (newSubtotal + _cartData.value.platformFee + newDelivery - couponDiscount).coerceAtLeast(0.0)

        _cartData.value = _cartData.value.copy(
            items = updatedItems,
            subtotal = newSubtotal,
            deliveryFee = newDelivery,
            estimatedSavings = newSavings,
            discountAmount = couponDiscount,
            totalAmount = newTotal,
            hasUnavailableItems = updatedItems.any { !it.isAvailable }
        )
        _cartItemCount.value = updatedItems.sumOf { it.quantity }
        _productQuantities.value = updatedItems.associate { it.productId to it.quantity }

        viewModelScope.launch {
            _updatingItemIds.update { it + cartItemId }
            repository.removeCartItem(cartItemId)
                .onSuccess {
                    _actionMessage.value = "Item removed"
                    repository.getCart().onSuccess { updateCartState(it) }
                }
                .onFailure {
                    repository.getCart().onSuccess { updateCartState(it) }
                }
            _updatingItemIds.update { it - cartItemId }
        }
        return item
    }

    // -- Move to Wishlist (Save for Later)
    fun moveToWishlist(item: CartItem, wishlistStateHolder: WishlistStateHolder) {
        removeItem(item.cartItemId)
        wishlistStateHolder.toggleWishlist(item.productId)
        _actionMessage.value = "Moved to wishlist ❤️"
    }

    // -- Apply Coupon
    fun applyCoupon(coupon: Coupon): Boolean {
        if (_cartData.value.subtotal < coupon.minimumCartValue) {
            _actionMessage.value = "Minimum order of ₹${coupon.minimumCartValue.toInt()} required for ${coupon.code}"
            return false
        }
        _appliedCoupon.value = coupon
        updateCartState(_cartData.value)
        _actionMessage.value = "Coupon '${coupon.code}' applied! 🎉"
        return true
    }

    fun removeCoupon() {
        val code = _appliedCoupon.value?.code
        _appliedCoupon.value = null
        updateCartState(_cartData.value)
        if (code != null) _actionMessage.value = "Coupon '$code' removed"
    }

    // -- Clear Cart
    fun clearCart() {
        _cartData.value = CartData()
        _cartItemCount.value = 0
        _productQuantities.value = emptyMap()
        _appliedCoupon.value = null

        viewModelScope.launch {
            _isLoading.value = true
            repository.clearCart()
                .onSuccess {
                    _actionMessage.value = "Cart cleared"
                }
                .onFailure {
                    repository.getCart().onSuccess { updateCartState(it) }
                }
            _isLoading.value = false
        }
    }

    fun clearMessage() {
        _actionMessage.value = null
    }
}
