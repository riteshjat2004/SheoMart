package com.sheomart.mobile.ui.search

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.data.model.SearchCategoryItem
import com.sheomart.mobile.data.model.SearchProductItem
import com.sheomart.mobile.data.model.SearchResults
import com.sheomart.mobile.data.model.SearchStoreItem
import com.sheomart.mobile.ui.components.AsyncImageLoader
import com.sheomart.mobile.ui.components.SectionEmptyView
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.components.ShimmerPlaceholder
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun SearchScreen(
    viewModel: SearchViewModel,
    onBack: () -> Unit,
    onProductClick: (String) -> Unit,
    onStoreClick: (String) -> Unit,
    onCategoryClick: (String) -> Unit
) {
    val query by viewModel.query.collectAsState()
    val searchState by viewModel.searchState.collectAsState()
    val exploreState by viewModel.exploreState.collectAsState()
    val recentSearches by viewModel.recentSearches.collectAsState()
    val sortOrder by viewModel.sortOrder.collectAsState()
    val filterState by viewModel.filterState.collectAsState()
    val pendingFilter by viewModel.pendingFilter.collectAsState()

    val focusManager = LocalFocusManager.current
    val focusRequester = remember { FocusRequester() }
    var showFilterSheet by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        // Automatically request focus to open keyboard
        try {
            focusRequester.requestFocus()
        } catch (_: Exception) {}
    }

    Scaffold(
        topBar = {
            Column(modifier = Modifier.background(MaterialTheme.colorScheme.surface)) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    IconButton(
                        onClick = onBack,
                        modifier = Modifier.size(40.dp)
                    ) {
                        Text("←", fontSize = 22.sp, color = MaterialTheme.colorScheme.onSurface, fontWeight = FontWeight.Bold)
                    }

                    TextField(
                        value = query,
                        onValueChange = { viewModel.onQueryChange(it) },
                        placeholder = {
                            Text(
                                "Search grocery, fresh food, stores...",
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 14.sp
                            )
                        },
                        singleLine = true,
                        leadingIcon = {
                            Text("🔍", fontSize = 16.sp)
                        },
                        trailingIcon = {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                if (query.isNotEmpty()) {
                                    IconButton(
                                        onClick = { viewModel.clearQuery() },
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Text("✕", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                }
                                Box(
                                    modifier = Modifier
                                        .padding(end = 8.dp)
                                        .size(32.dp)
                                        .clip(CircleShape)
                                        .background(MaterialTheme.colorScheme.surfaceVariant),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text("🎙️", fontSize = 14.sp)
                                }
                            }
                        },
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                            unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                            disabledContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                            focusedTextColor = MaterialTheme.colorScheme.onSurface,
                            unfocusedTextColor = MaterialTheme.colorScheme.onSurface,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent
                        ),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(52.dp)
                            .focusRequester(focusRequester),
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                        keyboardActions = KeyboardActions(onSearch = {
                            focusManager.clearFocus()
                            viewModel.searchNow(query)
                        })
                    )
                }

                // Active Query Toolbar: Sort Chips & Filter Action
                if (query.isNotBlank()) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(start = 16.dp, end = 16.dp, bottom = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // Filter button with badge
                        FilterButton(
                            activeCount = filterState.activeCount,
                            onClick = {
                                viewModel.openFilterSheet()
                                showFilterSheet = true
                            }
                        )

                        // Sort Chips Row
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            items(SearchSortOrder.values()) { order ->
                                val isSelected = sortOrder == order
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(20.dp))
                                        .background(if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface)
                                        .border(
                                            width = 1.dp,
                                            color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant,
                                            shape = RoundedCornerShape(20.dp)
                                        )
                                        .clickable { viewModel.onSortChange(order) }
                                        .padding(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Text(
                                        text = order.label,
                                        style = MaterialTheme.typography.labelSmall.copy(
                                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                        ),
                                        color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                                    )
                                }
                            }
                        }
                    }
                }
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant, thickness = 0.5.dp)
            }
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            if (query.isBlank()) {
                // EXPLORE MODE (Empty Query)
                ExploreView(
                    recentSearches = recentSearches,
                    exploreState = exploreState,
                    onSearchTerm = { term ->
                        focusManager.clearFocus()
                        viewModel.searchNow(term)
                    },
                    onRemoveHistory = { term -> viewModel.removeFromHistory(term) },
                    onClearAllHistory = { viewModel.clearAllHistory() },
                    onCategoryClick = onCategoryClick,
                    onStoreClick = onStoreClick,
                    onProductClick = onProductClick
                )
            } else {
                // SEARCH RESULTS MODE
                when (val res = searchState) {
                    is UiState.Loading -> {
                        SearchResultsSkeleton()
                    }
                    is UiState.Error -> {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(24.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            SectionErrorView(
                                message = res.message,
                                onRetry = { viewModel.searchNow(query) }
                            )
                        }
                    }
                    is UiState.Empty -> {
                        SearchEmptyView(
                            query = query,
                            onSuggestionClick = { term ->
                                focusManager.clearFocus()
                                viewModel.searchNow(term)
                            }
                        )
                    }
                    is UiState.Success -> {
                        SearchResultsView(
                            results = res.data,
                            query = query,
                            onProductClick = onProductClick,
                            onStoreClick = onStoreClick,
                            onCategoryClick = onCategoryClick
                        )
                    }
                }
            }
        }

        // Filter Bottom Sheet
        if (showFilterSheet) {
            ModalBottomSheet(
                onDismissRequest = { showFilterSheet = false },
                containerColor = Surface,
                shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
            ) {
                FilterBottomSheetContent(
                    pendingFilter = pendingFilter,
                    onPriceRangeChange = { viewModel.onPendingPriceRangeChange(it) },
                    onMinRatingChange = { viewModel.onPendingMinRatingChange(it) },
                    onDiscountOnlyChange = { viewModel.onPendingDiscountOnlyChange(it) },
                    onClear = {
                        viewModel.clearFilters()
                        showFilterSheet = false
                    },
                    onApply = {
                        viewModel.applyFilters()
                        showFilterSheet = false
                    }
                )
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER BUTTON
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun FilterButton(
    activeCount: Int,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(20.dp),
        color = if (activeCount > 0) PrimaryGreen.copy(alpha = 0.12f) else Surface,
        border = androidx.compose.foundation.BorderStroke(
            width = 1.dp,
            color = if (activeCount > 0) PrimaryGreen else Border
        ),
        modifier = Modifier.clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text("⚡", fontSize = 12.sp)
            Text(
                text = if (activeCount > 0) "Filters ($activeCount)" else "Filters",
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                color = if (activeCount > 0) PrimaryGreen else PrimaryText
            )
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPLORE VIEW (Empty Search Mode)
// ─────────────────────────────────────────────────────────────────────────────

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ExploreView(
    recentSearches: List<String>,
    exploreState: UiState<SearchResults>,
    onSearchTerm: (String) -> Unit,
    onRemoveHistory: (String) -> Unit,
    onClearAllHistory: () -> Unit,
    onCategoryClick: (String) -> Unit,
    onStoreClick: (String) -> Unit,
    onProductClick: (String) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 32.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // 1. RECENT SEARCHES (if any)
        if (recentSearches.isNotEmpty()) {
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 4.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Recent Searches",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = PrimaryText
                        )
                        Text(
                            text = "Clear all",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                            color = SecondaryText,
                            modifier = Modifier.clickable(onClick = onClearAllHistory)
                        )
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(recentSearches, key = { it }) { term ->
                            Surface(
                                shape = RoundedCornerShape(20.dp),
                                color = Surface,
                                border = androidx.compose.foundation.BorderStroke(1.dp, Border),
                                modifier = Modifier.clickable { onSearchTerm(term) }
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text("🕒", fontSize = 11.sp)
                                    Text(
                                        text = term,
                                        style = MaterialTheme.typography.labelMedium,
                                        color = PrimaryText
                                    )
                                    Text(
                                        text = "✕",
                                        fontSize = 11.sp,
                                        color = SecondaryText,
                                        modifier = Modifier
                                            .padding(start = 2.dp)
                                            .clickable { onRemoveHistory(term) }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // 2. TRENDING SEARCHES
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            ) {
                Text(
                    text = "Trending in Sheopur 🔥",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryText
                )
                Spacer(modifier = Modifier.height(10.dp))
                FlowRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    TRENDING_SEARCHES.forEach { term ->
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = Surface,
                            border = androidx.compose.foundation.BorderStroke(1.dp, Border),
                            modifier = Modifier.clickable { onSearchTerm(term) }
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text("📈", fontSize = 11.sp)
                                Text(
                                    text = term,
                                    style = MaterialTheme.typography.labelMedium,
                                    color = PrimaryText
                                )
                            }
                        }
                    }
                }
            }
        }

        // 3. BROWSE BY CATEGORY / AISLES
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            ) {
                Text(
                    text = "Explore Aisles 🛒",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryText
                )
                Spacer(modifier = Modifier.height(12.dp))

                val quickCategories = listOf(
                    Triple("Groceries & Staples", "🌾", "cat_groceries"),
                    Triple("Dairy & Fresh Bakery", "🥛", "cat_dairy"),
                    Triple("Fruits & Vegetables", "🍎", "cat_produce"),
                    Triple("Spices & Masalas", "🌶️", "cat_spices"),
                    Triple("Snacks & Beverages", "🍪", "cat_snacks"),
                    Triple("Personal Care & Hygiene", "🧼", "cat_care")
                )

                quickCategories.forEach { (catName, emoji, catId) ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Surface)
                            .border(1.dp, Border, RoundedCornerShape(14.dp))
                            .clickable { onCategoryClick(catId) }
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Text(emoji, fontSize = 20.sp)
                            Text(
                                text = catName,
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                                color = PrimaryText
                            )
                        }
                        Text("→", color = PrimaryGreen, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                }
            }
        }

        // 4. POPULAR STORES EXPLORE (from pre-loaded explore state)
        if (exploreState is UiState.Success && exploreState.data.stores.isNotEmpty()) {
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp)
                ) {
                    Text(
                        text = "Popular Local Stores 🏪",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = PrimaryText
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(exploreState.data.stores, key = { it.storeId }) { store ->
                            StoreChipItem(
                                store = store,
                                onClick = { onStoreClick(store.storeId) }
                            )
                        }
                    }
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH RESULTS VIEW
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun SearchResultsView(
    results: SearchResults,
    query: String,
    onProductClick: (String) -> Unit,
    onStoreClick: (String) -> Unit,
    onCategoryClick: (String) -> Unit
) {
    val totalCount = results.products.size + results.stores.size + results.categories.size

    if (totalCount == 0) {
        SearchEmptyView(query = query, onSuggestionClick = {})
        return
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // MATCHING CATEGORIES
        if (results.categories.isNotEmpty()) {
            item {
                Text(
                    text = "Matching Categories",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryText
                )
                Spacer(modifier = Modifier.height(8.dp))
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(results.categories, key = { it.categoryId }) { cat ->
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = Surface,
                            border = androidx.compose.foundation.BorderStroke(1.dp, Border),
                            modifier = Modifier.clickable { onCategoryClick(cat.categoryId) }
                        ) {
                            Text(
                                text = cat.name,
                                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                                color = PrimaryGreen,
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp)
                            )
                        }
                    }
                }
            }
        }

        // MATCHING STORES
        if (results.stores.isNotEmpty()) {
            item {
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "Local Stores (${results.stores.size})",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryText
                )
            }
            items(results.stores, key = { it.storeId }) { store ->
                StoreResultCard(
                    store = store,
                    onClick = { onStoreClick(store.storeId) }
                )
            }
        }

        // MATCHING PRODUCTS
        if (results.products.isNotEmpty()) {
            item {
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "Products (${results.products.size})",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryText
                )
            }
            items(results.products, key = { it.productId }) { prod ->
                ProductResultCard(
                    product = prod,
                    onClick = { onProductClick(prod.productId) }
                )
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// STORE & PRODUCT RESULT CARDS
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun StoreResultCard(
    store: SearchStoreItem,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(MaterialTheme.colorScheme.surface)
            .border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(16.dp))
            .clickable(onClick = onClick)
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.weight(1f)
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.surfaceVariant),
                contentAlignment = Alignment.Center
            ) {
                Text("🏪", fontSize = 20.sp)
            }
            Column {
                Text(
                    text = store.storeName,
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (store.rating != null) {
                        Text(
                            text = "★ ${String.format("%.1f", store.rating)}",
                            style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                            color = Color(0xFFF59E0B)
                        )
                    }
                    if (store.deliveryEnabled) {
                        Text(
                            text = "• ⚡ Fast Delivery",
                            style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }
        }
        Text(
            text = "Visit →",
            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
            color = MaterialTheme.colorScheme.primary
        )
    }
}

@Composable
private fun StoreChipItem(
    store: SearchStoreItem,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface,
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
        modifier = Modifier.clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text("🏪", fontSize = 16.sp)
            Column {
                Text(
                    text = store.storeName,
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                if (store.rating != null) {
                    Text(
                        text = "★ ${String.format("%.1f", store.rating)}",
                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                        color = Color(0xFFF59E0B)
                    )
                }
            }
        }
    }
}

@Composable
private fun ProductResultCard(
    product: SearchProductItem,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(MaterialTheme.colorScheme.surface)
            .border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(16.dp))
            .clickable(onClick = onClick)
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        AsyncImageLoader(
            url = product.thumbnail,
            contentDescription = product.name,
            modifier = Modifier
                .size(64.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant),
            contentScale = ContentScale.Crop,
            fallbackText = product.name
        )

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = product.name,
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                color = MaterialTheme.colorScheme.onSurface,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
            if (!product.categoryName.isNullOrBlank()) {
                Text(
                    text = product.categoryName,
                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            if (product.discountPrice != null) {
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "₹${product.discountPrice.toInt()}",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.ExtraBold),
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }

        Surface(
            shape = RoundedCornerShape(8.dp),
            color = MaterialTheme.colorScheme.primary.copy(alpha = 0.12f)
        ) {
            Text(
                text = "View",
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
            )
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON & EMPTY STATES
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun SearchResultsSkeleton() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        repeat(4) {
            ShimmerPlaceholder(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(84.dp),
                shape = RoundedCornerShape(16.dp)
            )
        }
    }
}

@Composable
private fun SearchEmptyView(
    query: String,
    onSuggestionClick: (String) -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text("🔍", fontSize = 48.sp)
            Text(
                text = "No matches found for \"$query\"",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = PrimaryText,
                textAlign = TextAlign.Center
            )
            Text(
                text = "Try checking your spelling or searching for everyday items like rice, oil, spices, or milk.",
                style = MaterialTheme.typography.bodySmall,
                color = SecondaryText,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Popular searches:",
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                color = PrimaryText
            )
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("Rice", "Milk", "Ghee", "Oil").forEach { term ->
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = MaterialTheme.colorScheme.surface,
                        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
                        modifier = Modifier.clickable { onSuggestionClick(term) }
                    ) {
                        Text(
                            text = term,
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Medium),
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        )
                    }
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER BOTTOM SHEET CONTENT
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun FilterBottomSheetContent(
    pendingFilter: SearchFilterState,
    onPriceRangeChange: (ClosedFloatingPointRange<Float>) -> Unit,
    onMinRatingChange: (Float) -> Unit,
    onDiscountOnlyChange: (Boolean) -> Unit,
    onClear: () -> Unit,
    onApply: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 12.dp)
            .navigationBarsPadding(),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Filter Results",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = "Reset all",
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.clickable(onClick = onClear)
            )
        }

        // 1. Price Range Slider
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Price Range",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "₹${pendingFilter.priceRange.start.toInt()} - ₹${pendingFilter.priceRange.endInclusive.toInt()}",
                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.primary
                )
            }
            RangeSlider(
                value = pendingFilter.priceRange,
                onValueChange = onPriceRangeChange,
                valueRange = 0f..2000f,
                steps = 19,
                colors = SliderDefaults.colors(
                    thumbColor = MaterialTheme.colorScheme.primary,
                    activeTrackColor = MaterialTheme.colorScheme.primary,
                    inactiveTrackColor = MaterialTheme.colorScheme.outlineVariant
                )
            )
        }

        // 2. Minimum Rating
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                text = "Minimum Rating",
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf(0f to "Any", 3.0f to "3★ +", 4.0f to "4★ +", 4.5f to "4.5★ +").forEach { (rating, label) ->
                    val isSelected = pendingFilter.minRating == rating
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface,
                        border = androidx.compose.foundation.BorderStroke(
                            width = 1.dp,
                            color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant
                        ),
                        modifier = Modifier
                            .weight(1f)
                            .clickable { onMinRatingChange(rating) }
                    ) {
                        Text(
                            text = label,
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                            ),
                            color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(vertical = 10.dp)
                        )
                    }
                }
            }
        }

        // 3. Discount Only Checkbox
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { onDiscountOnlyChange(!pendingFilter.discountOnly) },
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = "Discounted Items Only",
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Show only items with active festival or store offers",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Switch(
                checked = pendingFilter.discountOnly,
                onCheckedChange = onDiscountOnlyChange,
                colors = SwitchDefaults.colors(
                    checkedThumbColor = Color.White,
                    checkedTrackColor = MaterialTheme.colorScheme.primary
                )
            )
        }

        // Apply Button
        Button(
            onClick = onApply,
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
        ) {
            Text(
                text = "Apply Filters",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
    }
}
