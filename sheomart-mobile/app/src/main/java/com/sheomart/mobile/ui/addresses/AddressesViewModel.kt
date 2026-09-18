package com.sheomart.mobile.ui.addresses

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.AddressItem
import com.sheomart.mobile.data.repository.AddressesRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AddressesViewModel(
    private val addressesRepository: AddressesRepository
) : ViewModel() {

    private val _addressesState = MutableStateFlow<UiState<List<AddressItem>>>(UiState.Loading)
    val addressesState: StateFlow<UiState<List<AddressItem>>> = _addressesState.asStateFlow()

    private val _actionMessage = MutableStateFlow<String?>(null)
    val actionMessage: StateFlow<String?> = _actionMessage.asStateFlow()

    init {
        loadAddresses()
    }

    fun loadAddresses() {
        viewModelScope.launch {
            _addressesState.value = UiState.Loading
            addressesRepository.getAddresses()
                .onSuccess { list ->
                    _addressesState.value = UiState.Success(list)
                }
                .onFailure { error ->
                    _addressesState.value = UiState.Error(error.message ?: "Failed to load addresses")
                }
        }
    }

    fun addAddress(
        title: String,
        addressLine: String,
        landmark: String?,
        city: String,
        state: String,
        pincode: String,
        receiverName: String?,
        receiverMobile: String?,
        isDefault: Boolean
    ) {
        viewModelScope.launch {
            addressesRepository.createAddress(
                title = title,
                addressLine = addressLine,
                landmark = landmark,
                city = city,
                state = state,
                pincode = pincode,
                receiverName = receiverName,
                receiverMobile = receiverMobile,
                isDefault = isDefault
            ).onSuccess {
                loadAddresses()
                _actionMessage.value = "Address added successfully"
            }.onFailure {
                _actionMessage.value = "Failed to add address: ${it.message}"
            }
        }
    }

    fun deleteAddress(addressId: String) {
        viewModelScope.launch {
            addressesRepository.deleteAddress(addressId)
                .onSuccess {
                    loadAddresses()
                    _actionMessage.value = "Address deleted"
                }
                .onFailure {
                    _actionMessage.value = "Failed to delete address"
                }
        }
    }

    fun clearMessage() {
        _actionMessage.value = null
    }
}
