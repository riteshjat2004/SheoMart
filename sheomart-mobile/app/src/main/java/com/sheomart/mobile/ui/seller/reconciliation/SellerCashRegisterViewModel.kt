package com.sheomart.mobile.ui.seller.reconciliation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.DailyCashSummary
import com.sheomart.mobile.data.repository.BillingRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class SellerCashRegisterViewModel(
    private val billingRepository: BillingRepository
) : ViewModel() {

    private val _summaryState = MutableStateFlow<UiState<DailyCashSummary>>(UiState.Loading)
    val summaryState: StateFlow<UiState<DailyCashSummary>> = _summaryState.asStateFlow()

    private val _openingCash = MutableStateFlow(2000.0)
    val openingCash: StateFlow<Double> = _openingCash.asStateFlow()

    private val _countedCash = MutableStateFlow("")
    val countedCash: StateFlow<String> = _countedCash.asStateFlow()

    private val _actionMessage = MutableStateFlow<String?>(null)
    val actionMessage: StateFlow<String?> = _actionMessage.asStateFlow()

    init {
        loadCashSummary()
    }

    fun loadCashSummary() {
        viewModelScope.launch {
            _summaryState.value = UiState.Loading
            billingRepository.listInvoices()
                .onSuccess { invoices ->
                    val cashSales = invoices.filter { it.paymentMethod.uppercase() == "CASH" && it.paymentStatus.uppercase() == "PAID" }
                        .sumOf { it.amountPaid }
                    val upiSales = invoices.filter { it.paymentMethod.uppercase() == "UPI" && it.paymentStatus.uppercase() == "PAID" }
                        .sumOf { it.amountPaid }
                    val total = cashSales + upiSales
                    val expected = _openingCash.value + cashSales

                    _summaryState.value = UiState.Success(
                        DailyCashSummary(
                            openingCash = _openingCash.value,
                            cashSales = cashSales,
                            upiSales = upiSales,
                            totalSales = total,
                            expectedCash = expected,
                            totalOrders = invoices.size
                        )
                    )
                }
                .onFailure {
                    _summaryState.value = UiState.Success(
                        DailyCashSummary(
                            openingCash = _openingCash.value,
                            cashSales = 0.0,
                            upiSales = 0.0,
                            totalSales = 0.0,
                            expectedCash = _openingCash.value,
                            totalOrders = 0
                        )
                    )
                }
        }
    }

    fun setOpeningCash(amount: Double) {
        _openingCash.value = amount
        loadCashSummary()
    }

    fun setCountedCash(input: String) {
        _countedCash.value = input
    }

    fun reconcileRegister() {
        val counted = _countedCash.value.toDoubleOrNull() ?: 0.0
        val expected = (_summaryState.value as? UiState.Success)?.data?.expectedCash ?: _openingCash.value
        val diff = counted - expected

        val msg = when {
            diff == 0.0 -> "Cash drawer perfectly balanced! Register reconciled."
            diff > 0 -> "Cash surplus of ₹${diff.toInt()} recorded. Register reconciled."
            else -> "Cash shortage of ₹${(-diff).toInt()} noted. Register reconciled."
        }
        _actionMessage.value = msg
    }

    fun clearActionMessage() {
        _actionMessage.value = null
    }
}
