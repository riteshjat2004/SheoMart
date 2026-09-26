package com.sheomart.mobile.ui.wishlist

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.WishlistItem
import com.sheomart.mobile.data.repository.WishlistRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/**
 * Single source of truth for wishlist state.
 * Created once in AppNavigation and shared across all ViewModels.
 * Provides O(1) product ID lookups for heart icons throughout the app.
 */
class WishlistStateHolder(
    private val repository: WishlistRepository
) : ViewModel() {

    // -- Authoritative wishlist item list
    private val _wishlistItems = MutableStateFlow<List<WishlistItem>>(emptyList())
    val wishlistItems: StateFlow<List<WishlistItem>> = _wishlistItems.asStateFlow()

    // -- O(1) product ID set for heart icon checks
    private val _wishlistProductIds = MutableStateFlow<Set<String>>(emptySet())
    val wishlistProductIds: StateFlow<Set<String>> = _wishlistProductIds.asStateFlow()

    // -- Count for badges
    private val _wishlistCount = MutableStateFlow(0)
    val wishlistCount: StateFlow<Int> = _wishlistCount.asStateFlow()

    // -- Loading state
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    // -- Action feedback
    private val _actionMessage = MutableStateFlow<String?>(null)
    val actionMessage: StateFlow<String?> = _actionMessage.asStateFlow()

    // -- In-progress product IDs (debounce)
    private val _pendingProductIds = MutableStateFlow<Set<String>>(emptySet())
    val pendingProductIds: StateFlow<Set<String>> = _pendingProductIds.asStateFlow()

    init {
        loadWishlist()
    }

    // -------------------------------------------------------------------------
    // Load
    // -------------------------------------------------------------------------

    fun loadWishlist() {
        viewModelScope.launch {
            _isLoading.value = true
            repository.getWishlist()
                .onSuccess { items ->
                    _wishlistItems.value = items
                    _wishlistProductIds.value = items.map { it.productId }.toSet()
                    _wishlistCount.value = items.size
                }
            _isLoading.value = false
        }
    }

    // -------------------------------------------------------------------------
    // Toggle (Add or Remove) -- optimistic with server reconciliation
    // -------------------------------------------------------------------------

    fun toggleWishlist(productId: String) {
        if (_pendingProductIds.value.contains(productId)) return
        val isCurrentlyWishlisted = _wishlistProductIds.value.contains(productId)
        viewModelScope.launch {
            _pendingProductIds.update { it + productId }
            if (isCurrentlyWishlisted) {
                val item = _wishlistItems.value.find { it.productId == productId }
                if (item != null) {
                    // Optimistic remove
                    _wishlistItems.update { list -> list.filter { it.productId != productId } }
                    _wishlistProductIds.update { it - productId }
                    _wishlistCount.update { maxOf(0, it - 1) }
                    repository.removeWishlistItem(item.wishlistItemId)
                        .onSuccess { _actionMessage.value = "Removed from wishlist" }
                        .onFailure {
                            _wishlistItems.update { list -> listOf(item) + list }
                            _wishlistProductIds.update { it + productId }
                            _wishlistCount.update { it + 1 }
                            _actionMessage.value = "Could not remove. Try again."
                        }
                }
            } else {
                // Optimistic add placeholder
                val placeholder = WishlistItem(
                    wishlistItemId = "pending-$productId",
                    productId = productId,
                    productName = "..."
                )
                _wishlistItems.update { listOf(placeholder) + it }
                _wishlistProductIds.update { it + productId }
                _wishlistCount.update { it + 1 }
                repository.addWishlistItem(productId)
                    .onSuccess {
                        _actionMessage.value = "Saved to wishlist"
                        repository.getWishlist().onSuccess { fresh ->
                            _wishlistItems.value = fresh
                            _wishlistProductIds.value = fresh.map { it.productId }.toSet()
                            _wishlistCount.value = fresh.size
                        }
                    }
                    .onFailure {
                        _wishlistItems.update { list -> list.filter { it.productId != productId } }
                        _wishlistProductIds.update { it - productId }
                        _wishlistCount.update { maxOf(0, it - 1) }
                        _actionMessage.value = "Could not save. Try again."
                    }
            }
            _pendingProductIds.update { it - productId }
        }
    }

    // -------------------------------------------------------------------------
    // Remove by item ID (from WishlistScreen swipe/button)
    // -------------------------------------------------------------------------

    fun removeByItemId(wishlistItemId: String): WishlistItem? {
        val item = _wishlistItems.value.find { it.wishlistItemId == wishlistItemId } ?: return null
        _wishlistItems.update { list -> list.filter { it.wishlistItemId != wishlistItemId } }
        _wishlistProductIds.update { it - item.productId }
        _wishlistCount.update { maxOf(0, it - 1) }
        viewModelScope.launch {
            repository.removeWishlistItem(wishlistItemId).onFailure {
                _wishlistItems.update { list -> listOf(item) + list }
                _wishlistProductIds.update { it + item.productId }
                _wishlistCount.update { it + 1 }
            }
        }
        return item
    }

    // -------------------------------------------------------------------------
    // Restore (undo remove)
    // -------------------------------------------------------------------------

    fun restoreItem(item: WishlistItem) {
        _wishlistItems.update { list ->
            if (list.none { it.wishlistItemId == item.wishlistItemId }) listOf(item) + list else list
        }
        _wishlistProductIds.update { it + item.productId }
        _wishlistCount.update { it + 1 }
        viewModelScope.launch {
            repository.addWishlistItem(item.productId)
                .onSuccess {
                    repository.getWishlist().onSuccess { fresh ->
                        _wishlistItems.value = fresh
                        _wishlistProductIds.value = fresh.map { it.productId }.toSet()
                        _wishlistCount.value = fresh.size
                    }
                }
                .onFailure {
                    _wishlistItems.update { list -> list.filter { it.productId != item.productId } }
                    _wishlistProductIds.update { it - item.productId }
                    _wishlistCount.update { maxOf(0, it - 1) }
                }
        }
    }

    // -------------------------------------------------------------------------
    // Clear All
    // -------------------------------------------------------------------------

    fun clearAll() {
        val snapshot = _wishlistItems.value
        _wishlistItems.value = emptyList()
        _wishlistProductIds.value = emptySet()
        _wishlistCount.value = 0
        viewModelScope.launch {
            var anyFailed = false
            for (item in snapshot) {
                repository.removeWishlistItem(item.wishlistItemId).onFailure { anyFailed = true }
            }
            if (anyFailed) {
                repository.getWishlist().onSuccess { fresh ->
                    _wishlistItems.value = fresh
                    _wishlistProductIds.value = fresh.map { it.productId }.toSet()
                    _wishlistCount.value = fresh.size
                }
                _actionMessage.value = "Some items could not be removed"
            } else {
                _actionMessage.value = "Wishlist cleared"
            }
        }
    }

    fun clearMessage() {
        _actionMessage.value = null
    }
}
