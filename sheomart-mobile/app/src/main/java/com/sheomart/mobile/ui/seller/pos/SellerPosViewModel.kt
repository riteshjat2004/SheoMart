package com.sheomart.mobile.ui.seller.pos

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.*
import com.sheomart.mobile.data.repository.BillingRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

enum class CustomerBillingType {
    WALK_IN,
    REGISTERED,
    PLUS_MEMBER
}

class SellerPosViewModel(
    private val billingRepository: BillingRepository
) : ViewModel() {

    private val _catalogState = MutableStateFlow<UiState<List<PosProductItem>>>(UiState.Loading)
    val catalogState: StateFlow<UiState<List<PosProductItem>>> = _catalogState.asStateFlow()

    private val _customersState = MutableStateFlow<UiState<List<PosCustomer>>>(UiState.Loading)
    val customersState: StateFlow<UiState<List<PosCustomer>>> = _customersState.asStateFlow()

    // Customer Billing Type & Inputs
    private val _customerType = MutableStateFlow(CustomerBillingType.WALK_IN)
    val customerType: StateFlow<CustomerBillingType> = _customerType.asStateFlow()

    private val _walkInName = MutableStateFlow("Walk-in Customer")
    val walkInName: StateFlow<String> = _walkInName.asStateFlow()

    private val _walkInPhone = MutableStateFlow("")
    val walkInPhone: StateFlow<String> = _walkInPhone.asStateFlow()

    private val _selectedCustomer = MutableStateFlow<PosCustomer?>(null)
    val selectedCustomer: StateFlow<PosCustomer?> = _selectedCustomer.asStateFlow()

    // Search and Category Filter
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedCategory = MutableStateFlow<String?>(null)
    val selectedCategory: StateFlow<String?> = _selectedCategory.asStateFlow()

    // Billing Cart
    private val _cartItems = MutableStateFlow<List<BillingCartItem>>(emptyList())
    val cartItems: StateFlow<List<BillingCartItem>> = _cartItems.asStateFlow()

    // Payment Selection: CASH, UPI, CREDIT
    private val _paymentMethod = MutableStateFlow("CASH")
    val paymentMethod: StateFlow<String> = _paymentMethod.asStateFlow()

    // Generated Invoice for Dialog/Receipt
    private val _generatedInvoice = MutableStateFlow<InvoiceRecord?>(null)
    val generatedInvoice: StateFlow<InvoiceRecord?> = _generatedInvoice.asStateFlow()

    private val _isGeneratingInvoice = MutableStateFlow(false)
    val isGeneratingInvoice: StateFlow<Boolean> = _isGeneratingInvoice.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    init {
        loadPosData()
    }

    fun loadPosData() {
        viewModelScope.launch {
            _catalogState.value = UiState.Loading
            billingRepository.getPosCatalog()
                .onSuccess { _catalogState.value = UiState.Success(it) }
                .onFailure { _catalogState.value = UiState.Error(it.message ?: "Failed to load POS catalog") }

            billingRepository.listStoreCustomers()
                .onSuccess { _customersState.value = UiState.Success(it) }
                .onFailure { _customersState.value = UiState.Success(emptyList()) }
        }
    }

    fun setCustomerType(type: CustomerBillingType) {
        _customerType.value = type
        if (type == CustomerBillingType.PLUS_MEMBER) {
            val customers = (_customersState.value as? UiState.Success)?.data ?: emptyList()
            _selectedCustomer.value = customers.firstOrNull { it.isPlus }
        }
    }

    fun setWalkInName(name: String) { _walkInName.value = name }
    fun setWalkInPhone(phone: String) { _walkInPhone.value = phone }
    fun selectCustomer(customer: PosCustomer) { _selectedCustomer.value = customer }
    fun setSearchQuery(query: String) { _searchQuery.value = query }
    fun selectCategory(category: String?) { _selectedCategory.value = category }
    fun setPaymentMethod(method: String) { _paymentMethod.value = method }

    fun addToCart(product: PosProductItem) {
        val current = _cartItems.value.toMutableList()
        val index = current.indexOfFirst { it.product.productId == product.productId }
        if (index != -1) {
            val existing = current[index]
            current[index] = existing.copy(quantity = existing.quantity + 1)
        } else {
            current.add(BillingCartItem(product = product, quantity = 1))
        }
        _cartItems.value = current
    }

    fun updateQuantity(productId: String, quantity: Int) {
        val current = _cartItems.value.toMutableList()
        if (quantity <= 0) {
            current.removeAll { it.product.productId == productId }
        } else {
            val index = current.indexOfFirst { it.product.productId == productId }
            if (index != -1) {
                current[index] = current[index].copy(quantity = quantity)
            }
        }
        _cartItems.value = current
    }

    fun clearCart() {
        _cartItems.value = emptyList()
    }

    fun dismissInvoiceReceipt() {
        _generatedInvoice.value = null
    }

    fun clearError() {
        _errorMessage.value = null
    }

    val subtotal: Double get() = _cartItems.value.sumOf { it.lineSubtotal }
    val plusDiscount: Double
        get() = if (_customerType.value == CustomerBillingType.PLUS_MEMBER) subtotal * 0.05 else 0.0
    val grandTotal: Double get() = (subtotal - plusDiscount).coerceAtLeast(0.0)

    fun generateInvoice() {
        if (_cartItems.value.isEmpty()) {
            _errorMessage.value = "Billing cart is empty. Add products to continue."
            return
        }

        viewModelScope.launch {
            _isGeneratingInvoice.value = true
            _errorMessage.value = null

            val custId = if (_customerType.value != CustomerBillingType.WALK_IN) _selectedCustomer.value?.customerId else null
            val cName = when (_customerType.value) {
                CustomerBillingType.WALK_IN -> _walkInName.value.ifBlank { "Walk-in Customer" }
                else -> _selectedCustomer.value?.name ?: "Customer"
            }
            val cPhone = when (_customerType.value) {
                CustomerBillingType.WALK_IN -> _walkInPhone.value.takeIf { it.isNotBlank() }
                else -> _selectedCustomer.value?.mobile
            }

            val items = _cartItems.value.map {
                it.product.productId to (it.quantity to it.itemDiscount)
            }

            billingRepository.createOfflineInvoice(
                customerId = custId,
                walkInName = cName,
                walkInPhone = cPhone,
                paymentMethod = _paymentMethod.value,
                amountPaid = grandTotal,
                notes = if (_customerType.value == CustomerBillingType.PLUS_MEMBER) "SheoMart PLUS Member Sale (5% discount applied)" else null,
                items = items
            ).onSuccess { invoice ->
                _isGeneratingInvoice.value = false
                _generatedInvoice.value = invoice
                _cartItems.value = emptyList()
            }.onFailure { error ->
                _isGeneratingInvoice.value = false
                _errorMessage.value = error.message ?: "Failed to generate invoice."
            }
        }
    }
}
