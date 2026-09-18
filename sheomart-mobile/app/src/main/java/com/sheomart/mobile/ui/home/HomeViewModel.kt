package com.sheomart.mobile.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sheomart.mobile.data.model.*
import com.sheomart.mobile.data.repository.HomeRepository
import com.sheomart.mobile.ui.state.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class HomeUiState(
    val bannersState: UiState<List<HeroShowcaseItem>> = UiState.Loading,
    val categoriesState: UiState<List<Category>> = UiState.Loading,
    val featuredProductsState: UiState<List<Product>> = UiState.Loading,
    val popularProductsState: UiState<List<Product>> = UiState.Loading,
    val newArrivalsState: UiState<List<Product>> = UiState.Loading,
    val storesState: UiState<List<Store>> = UiState.Loading,
    val wishlistProductIds: Set<String> = emptySet(),
    val feedbackMessage: String? = null
)

class HomeViewModel(
    private val repository: HomeRepository = HomeRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadAll()
    }

    fun loadAll() {
        loadBanners()
        loadCategories()
        loadFeaturedProducts()
        loadPopularAndNewProducts()
        loadStores()
    }

    fun loadBanners() {
        viewModelScope.launch {
            _uiState.update { it.copy(bannersState = UiState.Loading) }
            val result = repository.getHeroCarousel()
            result.fold(
                onSuccess = { items ->
                    _uiState.update {
                        it.copy(
                            bannersState = if (items.isEmpty()) UiState.Empty else UiState.Success(items)
                        )
                    }
                },
                onFailure = { error ->
                    // Fallback to active offers if hero carousel is empty/fails
                    val offersResult = repository.getActiveOffers()
                    offersResult.fold(
                        onSuccess = { offers ->
                            val fallbackItems = offers.map { offer ->
                                HeroShowcaseItem(
                                    id = offer.offerId,
                                    type = "offer",
                                    name = offer.title,
                                    image = offer.bannerImage ?: ""
                                )
                            }
                            _uiState.update {
                                it.copy(
                                    bannersState = if (fallbackItems.isEmpty()) UiState.Empty else UiState.Success(fallbackItems)
                                )
                            }
                        },
                        onFailure = {
                            _uiState.update {
                                it.copy(bannersState = UiState.Error(error.message ?: "Unable to load offers"))
                            }
                        }
                    )
                }
            )
        }
    }

    fun loadCategories() {
        viewModelScope.launch {
            _uiState.update { it.copy(categoriesState = UiState.Loading) }
            val result = repository.getCategories()
            result.fold(
                onSuccess = { categories ->
                    _uiState.update {
                        it.copy(
                            categoriesState = if (categories.isEmpty()) UiState.Empty else UiState.Success(categories)
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(categoriesState = UiState.Error(error.message ?: "Unable to load categories"))
                    }
                }
            )
        }
    }

    fun loadFeaturedProducts() {
        viewModelScope.launch {
            _uiState.update { it.copy(featuredProductsState = UiState.Loading) }
            val result = repository.getTrendingProducts()
            result.fold(
                onSuccess = { products ->
                    _uiState.update {
                        it.copy(
                            featuredProductsState = if (products.isEmpty()) UiState.Empty else UiState.Success(products)
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(featuredProductsState = UiState.Error(error.message ?: "Unable to load featured products"))
                    }
                }
            )
        }
    }

    fun loadPopularAndNewProducts() {
        viewModelScope.launch {
            _uiState.update {
                it.copy(
                    popularProductsState = UiState.Loading,
                    newArrivalsState = UiState.Loading
                )
            }
            val result = repository.getAllProducts()
            result.fold(
                onSuccess = { products ->
                    val popular = products.sortedByDescending { it.rating ?: 0.0 }
                    val newArrivals = products // default ordered by createdAt descending from backend
                    _uiState.update {
                        it.copy(
                            popularProductsState = if (popular.isEmpty()) UiState.Empty else UiState.Success(popular),
                            newArrivalsState = if (newArrivals.isEmpty()) UiState.Empty else UiState.Success(newArrivals)
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            popularProductsState = UiState.Error(error.message ?: "Unable to load popular products"),
                            newArrivalsState = UiState.Error(error.message ?: "Unable to load new arrivals")
                        )
                    }
                }
            )
        }
    }

    fun loadStores() {
        viewModelScope.launch {
            _uiState.update { it.copy(storesState = UiState.Loading) }
            val result = repository.getStores()
            result.fold(
                onSuccess = { stores ->
                    // Sort stores so Royal > Verified > Normal
                    val sortedStores = stores.sortedWith(
                        compareByDescending<Store> { it.badge.equals("royal", ignoreCase = true) }
                            .thenByDescending { it.badge.equals("verified", ignoreCase = true) }
                            .thenByDescending { it.rating ?: 0.0 }
                    )
                    _uiState.update {
                        it.copy(
                            storesState = if (sortedStores.isEmpty()) UiState.Empty else UiState.Success(sortedStores)
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(storesState = UiState.Error(error.message ?: "Unable to load stores"))
                    }
                }
            )
        }
    }

    fun toggleWishlist(productId: String) {
        _uiState.update { current ->
            val set = current.wishlistProductIds.toMutableSet()
            val added = if (set.contains(productId)) {
                set.remove(productId)
                false
            } else {
                set.add(productId)
                true
            }
            current.copy(
                wishlistProductIds = set,
                feedbackMessage = if (added) "Saved to wishlist" else "Removed from wishlist"
            )
        }
    }

    fun addToCart(productId: String) {
        _uiState.update {
            it.copy(feedbackMessage = "Added to cart")
        }
    }

    fun dismissFeedback() {
        _uiState.update { it.copy(feedbackMessage = null) }
    }
}
