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
import kotlinx.coroutines.launch

class SearchViewModel(
    private val productRepository: ProductRepository
) : ViewModel() {

    private val _query = MutableStateFlow("")
    val query: StateFlow<String> = _query.asStateFlow()

    private val _searchState = MutableStateFlow<UiState<SearchResults>>(UiState.Success(SearchResults()))
    val searchState: StateFlow<UiState<SearchResults>> = _searchState.asStateFlow()

    private val _recentSearches = MutableStateFlow(listOf("Basmati Rice", "Mustard Oil", "Fresh Milk", "Atta 10kg", "Desi Ghee", "Spices"))
    val recentSearches: StateFlow<List<String>> = _recentSearches.asStateFlow()

    private var searchJob: Job? = null

    fun onQueryChange(newQuery: String) {
        _query.value = newQuery
        searchJob?.cancel()

        if (newQuery.isBlank()) {
            _searchState.value = UiState.Success(SearchResults())
            return
        }

        searchJob = viewModelScope.launch {
            delay(300) // Debounce typing
            performSearch(newQuery)
        }
    }

    fun searchNow(queryToSearch: String) {
        _query.value = queryToSearch
        searchJob?.cancel()
        viewModelScope.launch {
            performSearch(queryToSearch)
        }
    }

    private suspend fun performSearch(q: String) {
        if (q.isBlank()) return
        _searchState.value = UiState.Loading

        // Add to recent searches
        val currentRecents = _recentSearches.value.toMutableList()
        currentRecents.remove(q)
        currentRecents.add(0, q)
        if (currentRecents.size > 8) currentRecents.removeLast()
        _recentSearches.value = currentRecents

        productRepository.search(q)
            .onSuccess { results ->
                _searchState.value = UiState.Success(results)
            }
            .onFailure { error ->
                _searchState.value = UiState.Error(error.message ?: "Failed to find products")
            }
    }

    fun clearQuery() {
        _query.value = ""
        _searchState.value = UiState.Success(SearchResults())
    }
}
