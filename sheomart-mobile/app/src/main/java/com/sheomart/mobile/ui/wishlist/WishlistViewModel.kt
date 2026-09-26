package com.sheomart.mobile.ui.wishlist

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.WishlistItem
import com.sheomart.mobile.data.repository.CartRepository
import com.sheomart.mobile.ui.cart.CartStateHolder
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class WishlistViewModel(
    val stateHolder: WishlistStateHolder,
    private val cartRepository: CartRepository? = null,
    private val cartStateHolder: CartStateHolder? = null
) : ViewModel() {

    // -- Search query
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    // -- Pending undo item
    private val _pendingUndo = MutableStateFlow<WishlistItem?>(null)
    val pendingUndo: StateFlow<WishlistItem?> = _pendingUndo.asStateFlow()

    // -- Show clear all dialog
    private val _showClearDialog = MutableStateFlow(false)
    val showClearDialog: StateFlow<Boolean> = _showClearDialog.asStateFlow()

    // -- Add-to-cart loading set
    private val _cartLoadingIds = MutableStateFlow<Set<String>>(emptySet())
    val cartLoadingIds: StateFlow<Set<String>> = _cartLoadingIds.asStateFlow()

    // -- Filtered items (search applied)
    private val _filteredItems = MutableStateFlow<List<WishlistItem>>(emptyList())
    val filteredItems: StateFlow<List<WishlistItem>> = _filteredItems.asStateFlow()

    // -- Forward convenience state from holder
    val wishlistItems: StateFlow<List<WishlistItem>> = stateHolder.wishlistItems
    val isLoading: StateFlow<Boolean> = stateHolder.isLoading
    val actionMessage: StateFlow<String?> = stateHolder.actionMessage

    private var undoJob: Job? = null

    init {
        // Keep filtered items in sync
        viewModelScope.launch {
            combine(stateHolder.wishlistItems, _searchQuery) { items, query ->
                if (query.isBlank()) items
                else items.filter { item ->
                    item.productName.contains(query, ignoreCase = true) ||
                            item.storeName?.contains(query, ignoreCase = true) == true ||
                            item.brand?.contains(query, ignoreCase = true) == true
                }
            }.collect { _filteredItems.value = it }
        }
    }

    // -------------------------------------------------------------------------
    // Load / Refresh
    // -------------------------------------------------------------------------

    fun refresh() {
        stateHolder.loadWishlist()
    }

    // -------------------------------------------------------------------------
    // Search
    // -------------------------------------------------------------------------

    fun onSearchQuery(q: String) {
        _searchQuery.value = q
    }

    // -------------------------------------------------------------------------
    // Remove with Undo
    // -------------------------------------------------------------------------

    fun removeItem(item: WishlistItem) {
        undoJob?.cancel()
        _pendingUndo.value = item
        stateHolder.removeByItemId(item.wishlistItemId)

        // Auto-commit after 5 seconds (already removed from server, just clear undo state)
        undoJob = viewModelScope.launch {
            delay(5000)
            _pendingUndo.value = null
        }
    }

    fun undoRemove() {
        undoJob?.cancel()
        val item = _pendingUndo.value ?: return
        _pendingUndo.value = null
        stateHolder.restoreItem(item)
    }

    fun dismissUndo() {
        undoJob?.cancel()
        _pendingUndo.value = null
    }

    // -------------------------------------------------------------------------
    // Clear All
    // -------------------------------------------------------------------------

    fun requestClearAll() {
        _showClearDialog.value = true
    }

    fun confirmClearAll() {
        _showClearDialog.value = false
        undoJob?.cancel()
        _pendingUndo.value = null
        stateHolder.clearAll()
    }

    fun dismissClearDialog() {
        _showClearDialog.value = false
    }

    // -------------------------------------------------------------------------
    // Add to Cart (and optionally remove from wishlist)
    // -------------------------------------------------------------------------

    fun addToCartAndRemove(item: WishlistItem) {
        if (_cartLoadingIds.value.contains(item.productId)) return
        viewModelScope.launch {
            _cartLoadingIds.update { it + item.productId }
            if (cartStateHolder != null) {
                cartStateHolder.addItem(item.productId, 1, item.storeId)
                stateHolder.removeByItemId(item.wishlistItemId)
            } else if (cartRepository != null) {
                cartRepository.addCartItem(item.productId, 1, item.storeId)
                    .onSuccess {
                        stateHolder.removeByItemId(item.wishlistItemId)
                    }
                    .onFailure {
                        // Silently ignore — cart error message handled by Cart screen
                    }
            }
            _cartLoadingIds.update { it - item.productId }
        }
    }

    fun clearMessage() {
        stateHolder.clearMessage()
    }
}
