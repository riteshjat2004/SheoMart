package com.sheomart.mobile.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.*
import com.sheomart.mobile.data.repository.DashboardRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class DashboardUiState(
    val profileState: UiState<CustomerProfile> = UiState.Loading,
    val summaryState: UiState<CustomerAccountSummary> = UiState.Loading,
    val couponsState: UiState<List<Coupon>> = UiState.Loading,
    val offersState: UiState<List<PromotionOffer>> = UiState.Loading,
    val feedbackMessage: String? = null
)

class DashboardViewModel(
    private val repository: DashboardRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        loadAll()
    }

    /**
     * Loads all four dashboard sections concurrently.
     * Each section updates the UI state independently as soon as its result arrives,
     * so a slow coupons fetch never delays profile rendering.
     */
    fun loadAll() {
        // Reset all sections to Loading before firing concurrent requests
        _uiState.update {
            DashboardUiState(feedbackMessage = it.feedbackMessage)
        }

        viewModelScope.launch {
            coroutineScope {
                val profileDeferred  = async { repository.getProfile() }
                val summaryDeferred  = async { repository.getAccountSummary() }
                val couponsDeferred  = async { repository.getActiveCoupons() }
                val offersDeferred   = async { repository.getActiveOffers() }

                // Update each section independently as results arrive
                profileDeferred.await().fold(
                    onSuccess = { profile ->
                        _uiState.update { it.copy(profileState = UiState.Success(profile)) }
                    },
                    onFailure = { error ->
                        _uiState.update {
                            it.copy(profileState = UiState.Error(error.message ?: "Unable to load profile"))
                        }
                    }
                )

                summaryDeferred.await().fold(
                    onSuccess = { summary ->
                        _uiState.update { it.copy(summaryState = UiState.Success(summary)) }
                    },
                    onFailure = {
                        // Fallback to default 0 counts if network fails — dashboard must remain usable
                        _uiState.update { it.copy(summaryState = UiState.Success(CustomerAccountSummary())) }
                    }
                )

                couponsDeferred.await().fold(
                    onSuccess = { coupons ->
                        _uiState.update {
                            it.copy(
                                couponsState = if (coupons.isEmpty()) UiState.Empty else UiState.Success(coupons)
                            )
                        }
                    },
                    onFailure = { error ->
                        _uiState.update {
                            it.copy(couponsState = UiState.Error(error.message ?: "Unable to load coupons"))
                        }
                    }
                )

                offersDeferred.await().fold(
                    onSuccess = { offers ->
                        _uiState.update {
                            it.copy(
                                offersState = if (offers.isEmpty()) UiState.Empty else UiState.Success(offers)
                            )
                        }
                    },
                    onFailure = { error ->
                        _uiState.update {
                            it.copy(offersState = UiState.Error(error.message ?: "Unable to load offers"))
                        }
                    }
                )
            }
        }
    }

    /** Reload only the profile section (e.g., after EditProfile). */
    fun loadProfile() {
        viewModelScope.launch {
            _uiState.update { it.copy(profileState = UiState.Loading) }
            repository.getProfile().fold(
                onSuccess = { profile ->
                    _uiState.update { it.copy(profileState = UiState.Success(profile)) }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(profileState = UiState.Error(error.message ?: "Unable to load profile"))
                    }
                }
            )
        }
    }

    /** Reload only the coupons section. */
    fun loadCoupons() {
        viewModelScope.launch {
            _uiState.update { it.copy(couponsState = UiState.Loading) }
            repository.getActiveCoupons().fold(
                onSuccess = { coupons ->
                    _uiState.update {
                        it.copy(
                            couponsState = if (coupons.isEmpty()) UiState.Empty else UiState.Success(coupons)
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(couponsState = UiState.Error(error.message ?: "Unable to load coupons"))
                    }
                }
            )
        }
    }

    fun onCouponCopied(code: String) {
        _uiState.update { it.copy(feedbackMessage = "Coupon '$code' copied to clipboard!") }
    }

    fun dismissFeedback() {
        _uiState.update { it.copy(feedbackMessage = null) }
    }
}
