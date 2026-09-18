package com.sheomart.mobile.ui.checkout

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.AddressItem
import com.sheomart.mobile.data.model.CartData
import com.sheomart.mobile.data.repository.AddressesRepository
import com.sheomart.mobile.data.repository.CartRepository
import com.sheomart.mobile.data.repository.OrdersRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class CheckoutViewModel(
    private val cartRepository: CartRepository,
    private val addressesRepository: AddressesRepository,
    private val ordersRepository: OrdersRepository
) : ViewModel() {

    private val _cartState = MutableStateFlow<UiState<CartData>>(UiState.Loading)
    val cartState: StateFlow<UiState<CartData>> = _cartState.asStateFlow()

    private val _addressesState = MutableStateFlow<UiState<List<AddressItem>>>(UiState.Loading)
    val addressesState: StateFlow<UiState<List<AddressItem>>> = _addressesState.asStateFlow()

    private val _selectedAddress = MutableStateFlow<AddressItem?>(null)
    val selectedAddress: StateFlow<AddressItem?> = _selectedAddress.asStateFlow()

    private val _paymentMethod = MutableStateFlow("COD") // "COD" or "ONLINE"
    val paymentMethod: StateFlow<String> = _paymentMethod.asStateFlow()

    private val _couponCode = MutableStateFlow("")
    val couponCode: StateFlow<String> = _couponCode.asStateFlow()

    private val _orderPlacementState = MutableStateFlow<UiState<String>?>(null)
    val orderPlacementState: StateFlow<UiState<String>?> = _orderPlacementState.asStateFlow()

    init {
        loadCheckoutData()
    }

    fun loadCheckoutData() {
        viewModelScope.launch {
            _cartState.value = UiState.Loading
            _addressesState.value = UiState.Loading

            cartRepository.getCart()
                .onSuccess { _cartState.value = UiState.Success(it) }
                .onFailure { _cartState.value = UiState.Error(it.message ?: "Failed to load cart") }

            addressesRepository.getAddresses()
                .onSuccess { addresses ->
                    _addressesState.value = UiState.Success(addresses)
                    if (_selectedAddress.value == null) {
                        _selectedAddress.value = addresses.firstOrNull { it.isDefault } ?: addresses.firstOrNull()
                    }
                }
                .onFailure { _addressesState.value = UiState.Error(it.message ?: "Failed to load addresses") }
        }
    }

    fun selectAddress(address: AddressItem) {
        _selectedAddress.value = address
    }

    fun setPaymentMethod(method: String) {
        _paymentMethod.value = method
    }

    fun setCouponCode(code: String) {
        _couponCode.value = code
    }

    fun placeOrder(onSuccess: (String) -> Unit) {
        val cart = (_cartState.value as? UiState.Success)?.data ?: return
        if (cart.items.isEmpty()) return

        val addressId = _selectedAddress.value?.addressId

        viewModelScope.launch {
            _orderPlacementState.value = UiState.Loading

            val itemsList = cart.items.map { it.productId to it.quantity }
            val storeId = cart.items.firstOrNull()?.storeId

            ordersRepository.createOrder(
                items = itemsList,
                storeId = storeId,
                paymentMethod = _paymentMethod.value,
                addressId = addressId,
                couponCode = _couponCode.value.takeIf { it.isNotBlank() }
            ).onSuccess { orderId ->
                _orderPlacementState.value = UiState.Success(orderId)
                cartRepository.clearCart()
                onSuccess(orderId)
            }.onFailure { error ->
                _orderPlacementState.value = UiState.Error(error.message ?: "Failed to place order. Please check address & retry.")
            }
        }
    }
}
