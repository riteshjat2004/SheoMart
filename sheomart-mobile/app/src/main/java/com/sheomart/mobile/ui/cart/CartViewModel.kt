package com.sheomart.mobile.ui.cart

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.AddressItem
import com.sheomart.mobile.data.model.CartData
import com.sheomart.mobile.data.model.CartItem
import com.sheomart.mobile.data.model.Coupon
import com.sheomart.mobile.data.repository.AddressesRepository
import com.sheomart.mobile.data.repository.PromotionsRepository
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.wishlist.WishlistStateHolder
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class CartViewModel(
    val stateHolder: CartStateHolder,
    private val addressesRepository: AddressesRepository? = null,
    private val promotionsRepository: PromotionsRepository? = null,
    private val wishlistStateHolder: WishlistStateHolder? = null
) : ViewModel() {

    // -- Cart State mapped directly from StateHolder
    val cartData: StateFlow<CartData> = stateHolder.cartData
    val isLoading: StateFlow<Boolean> = stateHolder.isLoading
    val actionMessage: StateFlow<String?> = stateHolder.actionMessage
    val updatingItemIds: StateFlow<Set<String>> = stateHolder.updatingItemIds
    val appliedCoupon: StateFlow<Coupon?> = stateHolder.appliedCoupon

    // -- Delivery Address Preview State
    private val _selectedAddress = MutableStateFlow<AddressItem?>(null)
    val selectedAddress: StateFlow<AddressItem?> = _selectedAddress.asStateFlow()

    // -- Available Coupons
    private val _availableCoupons = MutableStateFlow<List<Coupon>>(emptyList())
    val availableCoupons: StateFlow<List<Coupon>> = _availableCoupons.asStateFlow()

    // -- Coupon code text input
    private val _couponInput = MutableStateFlow("")
    val couponInput: StateFlow<String> = _couponInput.asStateFlow()

    // -- Clear Cart confirmation dialog
    private val _showClearDialog = MutableStateFlow(false)
    val showClearDialog: StateFlow<Boolean> = _showClearDialog.asStateFlow()

    init {
        loadAddressAndCoupons()
    }

    fun refresh() {
        stateHolder.loadCart()
        loadAddressAndCoupons()
    }

    private fun loadAddressAndCoupons() {
        if (addressesRepository != null) {
            viewModelScope.launch {
                addressesRepository.getAddresses()
                    .onSuccess { addresses ->
                        _selectedAddress.value = addresses.firstOrNull { it.isDefault } ?: addresses.firstOrNull()
                    }
            }
        }
        if (promotionsRepository != null) {
            viewModelScope.launch {
                promotionsRepository.getActiveCoupons()
                    .onSuccess { coupons ->
                        _availableCoupons.value = coupons
                    }
            }
        }
    }

    // -------------------------------------------------------------------------
    // Item Quantity & Remove
    // -------------------------------------------------------------------------

    fun updateQuantity(cartItemId: String, newQty: Int) {
        stateHolder.updateQuantity(cartItemId, newQty)
    }

    fun removeItem(cartItemId: String) {
        stateHolder.removeItem(cartItemId)
    }

    fun moveToWishlist(item: CartItem) {
        if (wishlistStateHolder != null) {
            stateHolder.moveToWishlist(item, wishlistStateHolder)
        } else {
            stateHolder.removeItem(item.cartItemId)
        }
    }

    // -------------------------------------------------------------------------
    // Coupons
    // -------------------------------------------------------------------------

    fun onCouponInputChange(text: String) {
        _couponInput.value = text.uppercase()
    }

    fun applyCoupon(coupon: Coupon) {
        stateHolder.applyCoupon(coupon)
    }

    fun applyCouponFromInput() {
        val code = _couponInput.value.trim()
        if (code.isBlank()) return

        val matched = _availableCoupons.value.find { it.code.equals(code, ignoreCase = true) }
        val coupon = matched ?: Coupon(
            couponId = "custom-$code",
            code = code,
            title = "$code Offer",
            discountType = "percentage",
            discountValue = 10.0,
            minimumCartValue = 0.0
        )
        if (stateHolder.applyCoupon(coupon)) {
            _couponInput.value = ""
        }
    }

    fun removeCoupon() {
        stateHolder.removeCoupon()
    }

    // -------------------------------------------------------------------------
    // Clear Cart
    // -------------------------------------------------------------------------

    fun requestClearCart() {
        _showClearDialog.value = true
    }

    fun confirmClearCart() {
        _showClearDialog.value = false
        stateHolder.clearCart()
    }

    fun dismissClearDialog() {
        _showClearDialog.value = false
    }

    fun clearMessage() {
        stateHolder.clearMessage()
    }
}
