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
import java.util.Calendar

data class SlotOption(
    val id: String,
    val label: String,
    val isPast: Boolean = false
)

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

    // Delivery Method: "delivery" or "pickup"
    private val _deliveryMethod = MutableStateFlow("delivery")
    val deliveryMethod: StateFlow<String> = _deliveryMethod.asStateFlow()

    // Pickup slot state
    private val _pickupDay = MutableStateFlow("Today") // "Today" or "Tomorrow"
    val pickupDay: StateFlow<String> = _pickupDay.asStateFlow()

    private val _selectedPickupSlot = MutableStateFlow<String?>(null)
    val selectedPickupSlot: StateFlow<String?> = _selectedPickupSlot.asStateFlow()

    // Delivery slot state
    private val _deliveryDay = MutableStateFlow("Today") // "Today" or "Tomorrow"
    val deliveryDay: StateFlow<String> = _deliveryDay.asStateFlow()

    private val _selectedDeliverySlot = MutableStateFlow<String?>(null)
    val selectedDeliverySlot: StateFlow<String?> = _selectedDeliverySlot.asStateFlow()

    private val _paymentMethod = MutableStateFlow("COD") // "COD" or "ONLINE"
    val paymentMethod: StateFlow<String> = _paymentMethod.asStateFlow()

    private val _couponCode = MutableStateFlow("")
    val couponCode: StateFlow<String> = _couponCode.asStateFlow()

    private val _orderPlacementState = MutableStateFlow<UiState<String>?>(null)
    val orderPlacementState: StateFlow<UiState<String>?> = _orderPlacementState.asStateFlow()

    init {
        loadCheckoutData()
        initSlots()
    }

    private fun initSlots() {
        // Auto-select first available pickup slot
        val todaySlots = getPickupSlotsForDay("Today")
        val firstAvailableToday = todaySlots.firstOrNull { !it.isPast }
        if (firstAvailableToday != null) {
            _pickupDay.value = "Today"
            _selectedPickupSlot.value = firstAvailableToday.label
        } else {
            _pickupDay.value = "Tomorrow"
            val tomorrowSlots = getPickupSlotsForDay("Tomorrow")
            _selectedPickupSlot.value = tomorrowSlots.firstOrNull()?.label
        }

        // Auto-select delivery slot
        val deliverySlots = getDeliverySlotsForDay("Today")
        _selectedDeliverySlot.value = deliverySlots.firstOrNull { !it.isPast }?.label
            ?: getDeliverySlotsForDay("Tomorrow").firstOrNull()?.label
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

    fun setDeliveryMethod(method: String) {
        _deliveryMethod.value = method
    }

    fun selectAddress(address: AddressItem) {
        _selectedAddress.value = address
    }

    fun setPickupDay(day: String) {
        _pickupDay.value = day
        // Auto-select first available slot on day switch if current slot is invalid or on the other day
        val available = getPickupSlotsForDay(day).filter { !it.isPast }
        if (available.none { it.label == _selectedPickupSlot.value }) {
            _selectedPickupSlot.value = available.firstOrNull()?.label
        }
    }

    fun setPickupSlot(slot: String, day: String) {
        _pickupDay.value = day
        _selectedPickupSlot.value = slot
    }

    fun setDeliveryDay(day: String) {
        _deliveryDay.value = day
        val available = getDeliverySlotsForDay(day).filter { !it.isPast }
        if (available.none { it.label == _selectedDeliverySlot.value }) {
            _selectedDeliverySlot.value = available.firstOrNull()?.label
        }
    }

    fun setDeliverySlot(slot: String, day: String) {
        _deliveryDay.value = day
        _selectedDeliverySlot.value = slot
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

        val method = _deliveryMethod.value
        val addressId = _selectedAddress.value?.addressId

        if (method == "delivery" && addressId.isNullOrBlank()) {
            _orderPlacementState.value = UiState.Error("Please select a delivery address for home delivery.")
            return
        }

        if (method == "pickup" && _selectedPickupSlot.value.isNullOrBlank()) {
            _orderPlacementState.value = UiState.Error("Please select a store pickup time slot.")
            return
        }

        viewModelScope.launch {
            _orderPlacementState.value = UiState.Loading

            val itemsList = cart.items.map { it.productId to it.quantity }
            val storeId = cart.items.firstOrNull()?.storeId

            val pickupSlotString = if (method == "pickup") {
                "${_pickupDay.value} • ${_selectedPickupSlot.value}"
            } else null

            val deliverySlotString = if (method == "delivery") {
                "${_deliveryDay.value} • ${_selectedDeliverySlot.value}"
            } else null

            ordersRepository.createOrder(
                items = itemsList,
                storeId = storeId,
                paymentMethod = _paymentMethod.value,
                addressId = addressId,
                couponCode = _couponCode.value.takeIf { it.isNotBlank() },
                deliveryMethod = method,
                deliverySlot = deliverySlotString,
                pickupSlot = pickupSlotString
            ).onSuccess { orderId ->
                _orderPlacementState.value = UiState.Success(orderId)
                cartRepository.clearCart()
                onSuccess(orderId)
            }.onFailure { error ->
                _orderPlacementState.value = UiState.Error(error.message ?: "Failed to place order. Please check details & retry.")
            }
        }
    }

    fun getPickupSlotsForDay(day: String): List<SlotOption> {
        val cal = Calendar.getInstance()
        val currentMinutes = cal.get(Calendar.HOUR_OF_DAY) * 60 + cal.get(Calendar.MINUTE)
        val prepTime = 15
        val earliestMinutes = currentMinutes + prepTime

        val openMins = 9 * 60 // 09:00 AM
        val closeMins = 21 * 60 // 09:00 PM

        val slots = mutableListOf<SlotOption>()
        var cursor = openMins
        var idx = 0
        while (cursor + 30 <= closeMins) {
            val end = cursor + 30
            val label = "${formatMins(cursor)} - ${formatMins(end)}"
            val isPast = (day == "Today" && end <= earliestMinutes)
            slots.add(
                SlotOption(
                    id = "pickup_${day}_$idx",
                    label = label,
                    isPast = isPast
                )
            )
            cursor += 30
            idx++
        }
        return slots
    }

    fun getDeliverySlotsForDay(day: String): List<SlotOption> {
        val cal = Calendar.getInstance()
        val currentMinutes = cal.get(Calendar.HOUR_OF_DAY) * 60 + cal.get(Calendar.MINUTE)

        val rawSlots = listOf(
            Triple("10:00 AM - 12:00 PM", 10 * 60, 12 * 60),
            Triple("12:00 PM - 02:00 PM", 12 * 60, 14 * 60),
            Triple("04:00 PM - 06:00 PM", 16 * 60, 18 * 60),
            Triple("06:00 PM - 08:00 PM", 18 * 60, 20 * 60)
        )

        return rawSlots.mapIndexed { idx, (label, _, endMins) ->
            val isPast = (day == "Today" && endMins <= currentMinutes)
            SlotOption(
                id = "delivery_${day}_$idx",
                label = label,
                isPast = isPast
            )
        }
    }

    private fun formatMins(totalMinutes: numberMinutes): String {
        val normalized = ((totalMinutes % 1440) + 1440) % 1440
        var hours = normalized / 60
        val mins = normalized % 60
        val amPm = if (hours >= 12) "PM" else "AM"
        hours = when {
            hours == 0 -> 12
            hours > 12 -> hours - 12
            else -> hours
        }
        return String.format("%02d:%02d %s", hours, mins, amPm)
    }
}

private typealias numberMinutes = Int
