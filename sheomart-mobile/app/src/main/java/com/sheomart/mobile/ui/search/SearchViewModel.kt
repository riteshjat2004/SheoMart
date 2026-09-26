package com.sheomart.mobile.ui.search

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.SearchResults
import com.sheomart.mobile.data.repository.ProductRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

// ─────────────────────────────────────────────────────────────────────────────
// Sort Order
// ─────────────────────────────────────────────────────────────────────────────

enum class SearchSortOrder(val label: String) {
    POPULAR("Popular"),
    PRICE_LOW("Price ↑"),
    PRICE_HIGH("Price ↓"),
    TOP_RATED("Top Rated"),
    NEWEST("Newest")
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter State
// ─────────────────────────────────────────────────────────────────────────────

data class SearchFilterState(
    val maxPrice: Float = 2000f,
    val priceRange: ClosedFloatingPointRange<Float> = 0f..2000f,
    val minRating: Float = 0f,
    val discountOnly: Boolean = false,
    val inStockOnly: Boolean = false
) {
    val isActive: Boolean
        get() = priceRange.start > 0f || priceRange.endInclusive < maxPrice ||
                minRating > 0f || discountOnly || inStockOnly

    val activeCount: Int
        get() {
            var count = 0
            if (priceRange.start > 0f || priceRange.endInclusive < maxPrice) count++
            if (minRating > 0f) count++
            if (discountOnly) count++
            if (inStockOnly) count++
            return count
        }
}

// ─────────────────────────────────────────────────────────────────────────────
// Trending terms (hardcoded — no trending API)
// ─────────────────────────────────────────────────────────────────────────────

val TRENDING_SEARCHES = listOf(
    "Basmati Rice", "Mustard Oil", "Fresh Milk", "Atta 10kg",
    "Desi Ghee", "Spices", "Toor Dal", "Chana Dal",
    "Tomato", "Onion", "Potato", "Green Tea"
)

// ─────────────────────────────────────────────────────────────────────────────
// ViewModel
// ─────────────────────────────────────────────────────────────────────────────

class SearchViewModel(
    private val productRepository: ProductRepository
) : ViewModel() {

    // ── Query ─────────────────────────────────────────────────────────────
    private val _query = MutableStateFlow("")
    val query: StateFlow<String> = _query.asStateFlow()

    // ── Raw search state (from network, pre-filter) ────────────────────────
    private val _rawSearchState = MutableStateFlow<UiState<SearchResults>>(UiState.Success(SearchResults()))

    // ── Displayed search state (after filter+sort applied) ────────────────
    private val _searchState = MutableStateFlow<UiState<SearchResults>>(UiState.Success(SearchResults()))
    val searchState: StateFlow<UiState<SearchResults>> = _searchState.asStateFlow()

    // ── Sort ──────────────────────────────────────────────────────────────
    private val _sortOrder = MutableStateFlow(SearchSortOrder.POPULAR)
    val sortOrder: StateFlow<SearchSortOrder> = _sortOrder.asStateFlow()

    // ── Applied filter ────────────────────────────────────────────────────
    private val _filterState = MutableStateFlow(SearchFilterState())
    val filterState: StateFlow<SearchFilterState> = _filterState.asStateFlow()

    // ── Pending filter (being edited in the bottom sheet) ─────────────────
    private val _pendingFilter = MutableStateFlow(SearchFilterState())
    val pendingFilter: StateFlow<SearchFilterState> = _pendingFilter.asStateFlow()

    // ── Explore mode (shown when query is empty) ──────────────────────────
    private val _exploreState = MutableStateFlow<UiState<SearchResults>>(UiState.Loading)
    val exploreState: StateFlow<UiState<SearchResults>> = _exploreState.asStateFlow()

    // ── Recent searches ───────────────────────────────────────────────────
    private val _recentSearches = MutableStateFlow<List<String>>(emptyList())
    val recentSearches: StateFlow<List<String>> = _recentSearches.asStateFlow()

    private var searchJob: Job? = null

    init {
        loadExploreData()
    }

    // ─────────────────────────────────────────────────────────────────────
    // Query management
    // ─────────────────────────────────────────────────────────────────────

    fun onQueryChange(newQuery: String) {
        _query.value = newQuery
        searchJob?.cancel()
        if (newQuery.isBlank()) {
            val empty = UiState.Success(SearchResults())
            _rawSearchState.value = empty
            _searchState.value = empty
            return
        }
        if (newQuery.length < 2) return
        searchJob = viewModelScope.launch {
            delay(300)
            performSearch(newQuery)
        }
    }

    fun searchNow(queryToSearch: String) {
        if (queryToSearch.isBlank()) return
        _query.value = queryToSearch
        searchJob?.cancel()
        viewModelScope.launch { performSearch(queryToSearch) }
    }

    fun clearQuery() {
        _query.value = ""
        val empty = UiState.Success(SearchResults())
        _rawSearchState.value = empty
        _searchState.value = empty
    }

    // ─────────────────────────────────────────────────────────────────────
    // Core search
    // ─────────────────────────────────────────────────────────────────────

    private suspend fun performSearch(q: String) {
        if (q.isBlank()) return
        _searchState.value = UiState.Loading

        // Update recent history
        _recentSearches.update { current ->
            val updated = current.toMutableList()
            updated.remove(q)
            updated.add(0, q)
            if (updated.size > 10) updated.subList(10, updated.size).clear()
            updated.toList()
        }

        productRepository.search(q)
            .onSuccess { results ->
                _rawSearchState.value = UiState.Success(results)
                applyFiltersAndSort(results)
            }
            .onFailure { error ->
                val msg = error.message ?: "Search failed. Please check your connection."
                _rawSearchState.value = UiState.Error(msg)
                _searchState.value = UiState.Error(msg)
            }
    }

    // ─────────────────────────────────────────────────────────────────────
    // Client-side filter + sort
    // ─────────────────────────────────────────────────────────────────────

    private fun applyFiltersAndSort(raw: SearchResults) {
        val filter = _filterState.value
        val sort = _sortOrder.value

        val filteredProducts = raw.products.filter { prod ->
            val price = prod.discountPrice?.toFloat() ?: 9999f
            val inRange = price >= filter.priceRange.start && price <= filter.priceRange.endInclusive
            val discountOk = if (filter.discountOnly) prod.discountPrice != null else true
            inRange && discountOk
        }

        val sortedProducts = when (sort) {
            SearchSortOrder.POPULAR   -> filteredProducts
            SearchSortOrder.PRICE_LOW -> filteredProducts.sortedBy { it.discountPrice ?: Double.MAX_VALUE }
            SearchSortOrder.PRICE_HIGH -> filteredProducts.sortedByDescending { it.discountPrice ?: 0.0 }
            SearchSortOrder.TOP_RATED -> filteredProducts // rating not in SearchProductItem
            SearchSortOrder.NEWEST    -> filteredProducts.reversed()
        }

        val result = raw.copy(products = sortedProducts)
        _searchState.value = if (result.products.isEmpty() && result.stores.isEmpty() && result.categories.isEmpty()) {
            UiState.Empty
        } else {
            UiState.Success(result)
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // Sort
    // ─────────────────────────────────────────────────────────────────────

    fun onSortChange(order: SearchSortOrder) {
        _sortOrder.value = order
        val raw = _rawSearchState.value
        if (raw is UiState.Success) applyFiltersAndSort(raw.data)
    }

    // ─────────────────────────────────────────────────────────────────────
    // Pending filter (sheet editing)
    // ─────────────────────────────────────────────────────────────────────

    fun openFilterSheet() {
        _pendingFilter.value = _filterState.value
    }

    fun onPendingPriceRangeChange(range: ClosedFloatingPointRange<Float>) {
        _pendingFilter.update { it.copy(priceRange = range) }
    }

    fun onPendingMinRatingChange(rating: Float) {
        _pendingFilter.update { it.copy(minRating = rating) }
    }

    fun onPendingDiscountOnlyChange(value: Boolean) {
        _pendingFilter.update { it.copy(discountOnly = value) }
    }

    fun applyFilters() {
        _filterState.value = _pendingFilter.value
        val raw = _rawSearchState.value
        if (raw is UiState.Success) applyFiltersAndSort(raw.data)
    }

    fun clearFilters() {
        val cleared = SearchFilterState()
        _filterState.value = cleared
        _pendingFilter.value = cleared
        val raw = _rawSearchState.value
        if (raw is UiState.Success) applyFiltersAndSort(raw.data)
    }

    // ─────────────────────────────────────────────────────────────────────
    // History management
    // ─────────────────────────────────────────────────────────────────────

    fun removeFromHistory(term: String) {
        _recentSearches.update { it.filter { item -> item != term } }
    }

    fun clearAllHistory() {
        _recentSearches.value = emptyList()
    }

    // ─────────────────────────────────────────────────────────────────────
    // Explore data (pre-loaded for empty-query state)
    // ─────────────────────────────────────────────────────────────────────

    fun loadExploreData() {
        viewModelScope.launch {
            _exploreState.value = UiState.Loading
            productRepository.search("a")
                .onSuccess { results ->
                    _exploreState.value = if (
                        results.products.isEmpty() && results.stores.isEmpty() && results.categories.isEmpty()
                    ) UiState.Empty else UiState.Success(results)
                }
                .onFailure {
                    _exploreState.value = UiState.Empty
                }
        }
    }
}

