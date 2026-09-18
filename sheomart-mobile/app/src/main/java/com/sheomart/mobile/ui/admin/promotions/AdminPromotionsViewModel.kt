package com.sheomart.mobile.ui.admin.promotions

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.AdminCategoryItem
import com.sheomart.mobile.data.model.AdminCouponItem
import com.sheomart.mobile.data.model.AdminOfferItem
import com.sheomart.mobile.data.repository.AdminRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

data class AdminPromotionsUiState(
    val selectedTab: Int = 0, // 0 = Coupons, 1 = Offers
    val couponsState: UiState<List<AdminCouponItem>> = UiState.Loading,
    val offersState: UiState<List<AdminOfferItem>> = UiState.Loading,
    val categories: List<AdminCategoryItem> = emptyList(),
    val searchQuery: String = "",
    val isCreateCouponOpen: Boolean = false,
    val isCreateOfferOpen: Boolean = false,
    val pendingDeleteCoupon: AdminCouponItem? = null,
    val pendingDeleteOffer: AdminOfferItem? = null,
    val isSubmitting: Boolean = false,
    val feedbackMessage: String? = null
)

class AdminPromotionsViewModel(
    private val repository: AdminRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AdminPromotionsUiState())
    val uiState: StateFlow<AdminPromotionsUiState> = _uiState.asStateFlow()

    private var allCouponsCache: List<AdminCouponItem> = emptyList()
    private var allOffersCache: List<AdminOfferItem> = emptyList()

    init {
        loadAll()
    }

    fun selectTab(tab: Int) {
        _uiState.update { it.copy(selectedTab = tab) }
        applyFilters()
    }

    fun onSearchChange(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
        applyFilters()
    }

    fun loadAll() {
        viewModelScope.launch {
            _uiState.update {
                it.copy(couponsState = UiState.Loading, offersState = UiState.Loading)
            }
            coroutineScope {
                val couponsDeferred = async { repository.getAdminCoupons() }
                val offersDeferred = async { repository.getAdminOffers() }
                val categoriesDeferred = async { repository.getCategories() }

                val couponsResult = couponsDeferred.await()
                val offersResult = offersDeferred.await()
                val categories = categoriesDeferred.await().getOrNull() ?: emptyList()

                allCouponsCache = couponsResult.getOrNull() ?: emptyList()
                allOffersCache = offersResult.getOrNull() ?: emptyList()

                _uiState.update { it.copy(categories = categories) }
                applyFilters()
            }
        }
    }

    private fun applyFilters() {
        val query = _uiState.value.searchQuery.trim().lowercase()

        val filteredCoupons = allCouponsCache.filter {
            query.isBlank() || it.code.lowercase().contains(query) || it.title.lowercase().contains(query)
        }
        val filteredOffers = allOffersCache.filter {
            query.isBlank() || it.title.lowercase().contains(query) || (it.festivalName?.lowercase()?.contains(query) == true)
        }

        _uiState.update {
            it.copy(
                couponsState = if (filteredCoupons.isEmpty()) UiState.Empty else UiState.Success(filteredCoupons),
                offersState = if (filteredOffers.isEmpty()) UiState.Empty else UiState.Success(filteredOffers)
            )
        }
    }

    fun openCreateDialog() {
        if (_uiState.value.selectedTab == 0) {
            _uiState.update { it.copy(isCreateCouponOpen = true) }
        } else {
            _uiState.update { it.copy(isCreateOfferOpen = true) }
        }
    }

    fun closeDialogs() {
        _uiState.update { it.copy(isCreateCouponOpen = false, isCreateOfferOpen = false) }
    }

    fun createCoupon(
        title: String,
        code: String,
        discountType: String,
        discountValue: Double,
        minimumCartValue: Double,
        maximumDiscount: Double?,
        usageLimit: Int?,
        oncePerCustomer: Boolean,
        startsAt: String,
        endsAt: String,
        isActive: Boolean
    ) {
        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true) }
            val result = repository.createCoupon(
                title, code, discountType, discountValue, minimumCartValue,
                maximumDiscount, usageLimit, oncePerCustomer, startsAt, endsAt, isActive
            )
            result.fold(
                onSuccess = {
                    _uiState.update {
                        it.copy(
                            isSubmitting = false,
                            isCreateCouponOpen = false,
                            feedbackMessage = "Coupon '$code' created successfully."
                        )
                    }
                    loadAll()
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(isSubmitting = false, feedbackMessage = error.message ?: "Failed to create coupon")
                    }
                }
            )
        }
    }

    fun createOffer(
        title: String,
        festivalName: String,
        discountType: String,
        discountValue: Double,
        categoryIds: List<String>,
        bannerImage: String,
        priority: Int,
        startsAt: String,
        endsAt: String,
        isActive: Boolean
    ) {
        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true) }
            val result = repository.createOffer(
                title, festivalName, discountType, discountValue,
                categoryIds, bannerImage, priority, startsAt, endsAt, isActive
            )
            result.fold(
                onSuccess = {
                    _uiState.update {
                        it.copy(
                            isSubmitting = false,
                            isCreateOfferOpen = false,
                            feedbackMessage = "Festival offer '$title' created successfully."
                        )
                    }
                    loadAll()
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(isSubmitting = false, feedbackMessage = error.message ?: "Failed to create offer")
                    }
                }
            )
        }
    }

    fun requestDeleteCoupon(coupon: AdminCouponItem) {
        _uiState.update { it.copy(pendingDeleteCoupon = coupon) }
    }

    fun dismissDeleteCoupon() {
        _uiState.update { it.copy(pendingDeleteCoupon = null) }
    }

    fun confirmDeleteCoupon() {
        val coupon = _uiState.value.pendingDeleteCoupon ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true) }
            val result = repository.deleteCoupon(coupon.couponId)
            result.fold(
                onSuccess = {
                    _uiState.update {
                        it.copy(isSubmitting = false, pendingDeleteCoupon = null, feedbackMessage = "Coupon '${coupon.code}' removed.")
                    }
                    loadAll()
                },
                onFailure = { error ->
                    _uiState.update { it.copy(isSubmitting = false, feedbackMessage = error.message ?: "Delete failed") }
                }
            )
        }
    }

    fun requestDeleteOffer(offer: AdminOfferItem) {
        _uiState.update { it.copy(pendingDeleteOffer = offer) }
    }

    fun dismissDeleteOffer() {
        _uiState.update { it.copy(pendingDeleteOffer = null) }
    }

    fun confirmDeleteOffer() {
        val offer = _uiState.value.pendingDeleteOffer ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true) }
            val result = repository.deleteOffer(offer.offerId)
            result.fold(
                onSuccess = {
                    _uiState.update {
                        it.copy(isSubmitting = false, pendingDeleteOffer = null, feedbackMessage = "Offer '${offer.title}' removed.")
                    }
                    loadAll()
                },
                onFailure = { error ->
                    _uiState.update { it.copy(isSubmitting = false, feedbackMessage = error.message ?: "Delete failed") }
                }
            )
        }
    }

    fun dismissFeedback() {
        _uiState.update { it.copy(feedbackMessage = null) }
    }
}
