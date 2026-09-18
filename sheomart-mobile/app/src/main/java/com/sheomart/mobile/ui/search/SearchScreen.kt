package com.sheomart.mobile.ui.search

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.data.model.SearchResults
import com.sheomart.mobile.ui.components.AsyncImageLoader
import com.sheomart.mobile.ui.components.SectionEmptyView
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
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
    val recentSearches by viewModel.recentSearches.collectAsState()
    val focusManager = LocalFocusManager.current

    Scaffold(
        topBar = {
            Column(modifier = Modifier.background(Color.White)) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    IconButton(onClick = onBack) {
                        Text("←", fontSize = 22.sp, color = PrimaryGreen)
                    }

                    TextField(
                        value = query,
                        onValueChange = { viewModel.onQueryChange(it) },
                        placeholder = { Text("Search pantry, groceries, stores...", color = SecondaryText, fontSize = 14.sp) },
                        singleLine = true,
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Surface,
                            unfocusedContainerColor = Surface,
                            disabledContainerColor = Surface,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent
                        ),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(52.dp),
                        trailingIcon = {
                            if (query.isNotEmpty()) {
                                IconButton(onClick = { viewModel.clearQuery() }) {
                                    Text("✕", fontSize = 14.sp, color = SecondaryText)
                                }
                            }
                        },
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                        keyboardActions = KeyboardActions(onSearch = {
                            focusManager.clearFocus()
                            viewModel.searchNow(query)
                        })
                    )
                }
                Divider(color = Border, thickness = 0.5.dp)
            }
        },
        containerColor = Background
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            if (query.isBlank()) {
                // Recent / Trending Suggestions
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp)
                ) {
                    Text(
                        text = "Popular in Sheopur",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = PrimaryText
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // Display chips
                    }

                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(recentSearches) { term ->
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(20.dp))
                                    .background(Color.White)
                                    .border(1.dp, Border, RoundedCornerShape(20.dp))
                                    .clickable { viewModel.searchNow(term) }
                                    .padding(horizontal = 14.dp, vertical = 8.dp)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text("🔍", fontSize = 12.sp)
                                    Text(
                                        text = term,
                                        style = MaterialTheme.typography.labelMedium,
                                        color = PrimaryText
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))
                    Text(
                        text = "Search by Aisles",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = PrimaryText
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    val quickCategories = listOf(
                        Triple("Groceries & Staples", "🌾", "cat_groceries"),
                        Triple("Dairy & Fresh Bakery", "🥛", "cat_dairy"),
                        Triple("Fruits & Vegetables", "🍎", "cat_produce"),
                        Triple("Spices & Masalas", "🌶️", "cat_spices"),
                        Triple("Personal Care & Hygeine", "🧼", "cat_care")
                    )

                    quickCategories.forEach { (catName, emoji, catId) ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color.White)
                                .border(1.dp, Border, RoundedCornerShape(12.dp))
                                .clickable { onCategoryClick(catId) }
                                .padding(horizontal = 14.dp, vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Text(emoji, fontSize = 18.sp)
                                Text(
                                    text = catName,
                                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                                    color = PrimaryText
                                )
                            }
                            Text("→", color = PrimaryGreen, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            } else {
                when (val res = searchState) {
                    is UiState.Loading -> {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(color = PrimaryGreen)
                        }
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
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(24.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            SectionEmptyView(
                                title = "No results found",
                                description = "Try searching for pantry items, spices, or local stores."
                            )
                        }
                    }
                    is UiState.Success -> {
                        SearchResultsList(
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
    }
}

@Composable
private fun SearchResultsList(
    results: SearchResults,
    query: String,
    onProductClick: (String) -> Unit,
    onStoreClick: (String) -> Unit,
    onCategoryClick: (String) -> Unit
) {
    val totalCount = results.products.size + results.stores.size + results.categories.size

    if (totalCount == 0) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            SectionEmptyView(
                title = "No matches found for \"$query\"",
                description = "Try searching for everyday items like 'rice', 'oil', 'milk', or check spelling."
            )
        }
        return
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Categories Section
        if (results.categories.isNotEmpty()) {
            item {
                Text(
                    text = "Matching Categories",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryText
                )
            }
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(results.categories) { cat ->
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(14.dp))
                                .background(Color.White)
                                .border(1.dp, Border, RoundedCornerShape(14.dp))
                                .clickable { onCategoryClick(cat.categoryId) }
                                .padding(horizontal = 14.dp, vertical = 10.dp)
                        ) {
                            Text(
                                text = cat.name,
                                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                                color = PrimaryGreen
                            )
                        }
                    }
                }
            }
        }

        // Stores Section
        if (results.stores.isNotEmpty()) {
            item {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Local Stores",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryText
                )
            }
            items(results.stores) { store ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color.White)
                        .border(1.dp, Border, RoundedCornerShape(14.dp))
                        .clickable { onStoreClick(store.storeId) }
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(Surface),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("🏪", fontSize = 18.sp)
                        }
                        Column {
                            Text(
                                text = store.storeName,
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                color = PrimaryText
                            )
                            if (store.rating != null) {
                                Text(
                                    text = "★ ${String.format("%.1f", store.rating)} rating",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = Color(0xFFF59E0B)
                                )
                            }
                        }
                    }
                    Text("Visit →", style = MaterialTheme.typography.labelMedium, color = PrimaryGreen)
                }
            }
        }

        // Products Section
        if (results.products.isNotEmpty()) {
            item {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Products (${results.products.size})",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryText
                )
            }
            items(results.products) { prod ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color.White)
                        .border(1.dp, Border, RoundedCornerShape(14.dp))
                        .clickable { onProductClick(prod.productId) }
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    AsyncImageLoader(
                        url = prod.thumbnail,
                        contentDescription = prod.name,
                        modifier = Modifier
                            .size(60.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(Surface),
                        contentScale = ContentScale.Crop,
                        fallbackText = prod.name
                    )

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = prod.name,
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                            color = PrimaryText,
                            maxLines = 2
                        )
                        if (!prod.categoryName.isNullOrBlank()) {
                            Text(
                                text = prod.categoryName,
                                style = MaterialTheme.typography.bodySmall,
                                color = SecondaryText
                            )
                        }
                        if (prod.discountPrice != null) {
                            Text(
                                text = "₹${prod.discountPrice.toInt()}",
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                color = PrimaryGreen
                            )
                        }
                    }

                    Text("View", style = MaterialTheme.typography.labelMedium, color = PrimaryGreen)
                }
            }
        }
    }
}
