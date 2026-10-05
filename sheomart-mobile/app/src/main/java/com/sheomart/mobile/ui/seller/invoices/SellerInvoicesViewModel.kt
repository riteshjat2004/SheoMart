package com.sheomart.mobile.ui.seller.invoices

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.InvoiceRecord
import com.sheomart.mobile.data.repository.BillingRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class SellerInvoicesViewModel(
    private val billingRepository: BillingRepository
) : ViewModel() {

    private val _invoicesState = MutableStateFlow<UiState<List<InvoiceRecord>>>(UiState.Loading)
    val invoicesState: StateFlow<UiState<List<InvoiceRecord>>> = _invoicesState.asStateFlow()

    private val _filterTab = MutableStateFlow(0) // 0: All, 1: Paid, 2: Pending
    val filterTab: StateFlow<Int> = _filterTab.asStateFlow()

    private val _actionMessage = MutableStateFlow<String?>(null)
    val actionMessage: StateFlow<String?> = _actionMessage.asStateFlow()

    init {
        loadInvoices()
    }

    fun loadInvoices() {
        viewModelScope.launch {
            _invoicesState.value = UiState.Loading
            billingRepository.listInvoices()
                .onSuccess { _invoicesState.value = UiState.Success(it) }
                .onFailure { _invoicesState.value = UiState.Error(it.message ?: "Failed to load invoices") }
        }
    }

    fun selectFilter(index: Int) {
        _filterTab.value = index
    }

    fun confirmPendingPayment(invoiceId: String, method: String, amount: Double, notes: String?) {
        viewModelScope.launch {
            billingRepository.confirmInvoicePayment(invoiceId, method, amount, notes)
                .onSuccess {
                    _actionMessage.value = "Payment confirmed successfully! Invoice marked PAID."
                    loadInvoices()
                }
                .onFailure { _actionMessage.value = it.message ?: "Failed to confirm payment." }
        }
    }

    fun clearActionMessage() {
        _actionMessage.value = null
    }
}
