package com.sheomart.mobile.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.data.model.*
import com.sheomart.mobile.ui.components.*
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*
import java.util.Calendar


@Composable
fun HomeScreen(
    user: AuthUser?,
    viewModel: HomeViewModel,
    onNavigateTab: (CustomerNavTab) -> Unit,
    onSearchClick: () -> Unit,
    onCategoryClick: (String) -> Unit,
    onProductClick: (String) -> Unit,
    onStoreClick: (String) -> Unit,
    onNotificationsClick: () -> Unit,
    onProfileClick: () -> Unit,
    onOrdersClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    // Display feedback message when item is added to cart or wishlisted
    LaunchedEffect(uiState.feedbackMessage) {
        uiState.feedbackMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg)
            viewModel.dismissFeedback()
        }
    }

    val scrollState = rememberScrollState()

    // Time-based greeting calculation
    val currentHour = remember { Calendar.getInstance().get(Calendar.HOUR_OF_DAY) }
    val greeting = remember(currentHour) {
        when (currentHour) {
            in 4..11 -> "Good Morning"
            in 12..16 -> "Good Afternoon"
            else -> "Good Evening"
        }
    }
    val firstName = user?.name?.trim()?.split(" ")?.firstOrNull()?.ifBlank { "Neighbor" } ?: "Neighbor"

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = Background,
        snackbarHost = { SnackbarHost(snackbarHostState) },
        bottomBar = {
            SheoBottomNavigation(
                currentTab = CustomerNavTab.HOME,
                onTabSelected = onNavigateTab
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(scrollState)
        ) {
            // ==========================================
            // 1. TOP GREETING HEADER
            // ==========================================
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp)
            ) {
                // Location Bar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(text = "📍", fontSize = 14.sp)
                        Column {
                            Text(
                                text = "Delivering to",
                                style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                                color = SecondaryText
                            )
                            Text(
                                text = "Sheopur, MP 476337",
                                style = MaterialTheme.typography.titleSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp
                                ),
                                color = PrimaryText
                            )
                        }
                    }

                    // Notification & Profile action icons
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Notifications Button
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(Surface)
                                .border(1.dp, Border, CircleShape)
                                .clickable(onClick = onNotificationsClick),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = "🔔", fontSize = 16.sp)
                        }

                        // Profile Avatar Button
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(PrimaryGreen)
                                .border(1.5.dp, Color.White, CircleShape)
                                .clickable(onClick = onProfileClick),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = firstName.take(1).uppercase(),
                                style = MaterialTheme.typography.titleSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Welcome Greeting
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Bottom
                ) {
                    Column {
                        Text(
                            text = "$greeting, $firstName 👋",
                            style = MaterialTheme.typography.headlineSmall.copy(
                                fontWeight = FontWeight.Bold,
                                fontSize = 22.sp
                            ),
                            color = PrimaryText
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Fresh groceries delivered from neighborhood stores",
                            style = MaterialTheme.typography.bodySmall,
                            color = SecondaryText
                        )
                    }
                }
            }

            // ==========================================
            // 2. SEARCH BAR
            // ==========================================
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 6.dp)
            ) {
                HomeSearchBar(
                    onClick = onSearchClick,
                    placeholderText = "Search fresh fruits, veggies, stores..."
                )
            }

            Spacer(modifier = Modifier.height(18.dp))

            // ==========================================
            // 3. PROMOTIONAL BANNER CAROUSEL
            // ==========================================
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            ) {
                when (val state = uiState.bannersState) {
                    is UiState.Loading -> {
                        ShimmerPlaceholder(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(170.dp),
                            shape = RoundedCornerShape(22.dp)
                        )
                    }
                    is UiState.Success -> {
                        BannerCard(
                            items = state.data,
                            onItemClick = { item ->
                                when (item.type.lowercase()) {
                                    "product" -> item.productId?.let(onProductClick)
                                    "category" -> item.categoryId?.let(onCategoryClick)
                                    "store" -> item.storeId?.let(onStoreClick)
                                    else -> item.productId?.let(onProductClick) ?: onSearchClick()
                                }
                            }
                        )
                    }
                    is UiState.Error -> {
                        SectionErrorView(
                            message = state.message,
                            onRetry = { viewModel.loadBanners() }
                        )
                    }
                    is UiState.Empty -> {
                        // If banners are empty, gracefully collapse
                    }
                }
            }

            Spacer(modifier = Modifier.height(26.dp))

            // ==========================================
            // 4. CATEGORIES SECTION
            // ==========================================
            Column(modifier = Modifier.fillMaxWidth()) {
                SectionHeader(
                    eyebrow = "Featured categories",
                    title = "Shop by Category",
                    subtitle = "Explore fresh picks & essentials",
                    actionText = "See all",
                    onActionClick = { onCategoryClick("all") },
                    modifier = Modifier.padding(horizontal = 20.dp)
                )

                Spacer(modifier = Modifier.height(12.dp))

                when (val state = uiState.categoriesState) {
                    is UiState.Loading -> {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 20.dp),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            items(6) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    ShimmerPlaceholder(
                                        modifier = Modifier.size(68.dp),
                                        shape = RoundedCornerShape(20.dp)
                                    )
                                    Spacer(modifier = Modifier.height(6.dp))
                                    ShimmerPlaceholder(
                                        modifier = Modifier.size(width = 54.dp, height = 12.dp),
                                        shape = RoundedCornerShape(6.dp)
                                    )
                                }
                            }
                        }
                    }
                    is UiState.Success -> {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 20.dp),
                            horizontalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            items(state.data, key = { it.categoryId }) { category ->
                                CategoryCard(
                                    category = category,
                                    onClick = { onCategoryClick(category.categoryId) }
                                )
                            }
                        }
                    }
                    is UiState.Error -> {
                        Box(modifier = Modifier.padding(horizontal = 20.dp)) {
                            SectionErrorView(
                                message = state.message,
                                onRetry = { viewModel.loadCategories() }
                            )
                        }
                    }
                    is UiState.Empty -> {
                        Box(modifier = Modifier.padding(horizontal = 20.dp)) {
                            SectionEmptyView(
                                title = "Categories will appear soon",
                                description = "Fresh categories are being added"
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // ==========================================
            // 5. FEATURED PRODUCTS SECTION
            // ==========================================
            Column(modifier = Modifier.fillMaxWidth()) {
                SectionHeader(
                    eyebrow = "Trending in Sheopur",
                    title = "Featured Products",
                    subtitle = "Top selections this week",
                    actionText = "View all",
                    onActionClick = onSearchClick,
                    modifier = Modifier.padding(horizontal = 20.dp)
                )

                Spacer(modifier = Modifier.height(14.dp))

                when (val state = uiState.featuredProductsState) {
                    is UiState.Loading -> {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 20.dp),
                            horizontalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            items(3) {
                                ShimmerPlaceholder(
                                    modifier = Modifier.size(width = 180.dp, height = 260.dp),
                                    shape = RoundedCornerShape(20.dp)
                                )
                            }
                        }
                    }
                    is UiState.Success -> {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 20.dp),
                            horizontalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            items(state.data, key = { it.productId }) { product ->
                                ProductCard(
                                    product = product,
                                    onClick = { onProductClick(product.productId) },
                                    onAddToCart = { viewModel.addToCart(product.productId) },
                                    onToggleWishlist = { viewModel.toggleWishlist(product.productId) },
                                    isWishlisted = uiState.wishlistProductIds.contains(product.productId)
                                )
                            }
                        }
                    }
                    is UiState.Error -> {
                        Box(modifier = Modifier.padding(horizontal = 20.dp)) {
                            SectionErrorView(
                                message = state.message,
                                onRetry = { viewModel.loadFeaturedProducts() }
                            )
                        }
                    }
                    is UiState.Empty -> {
                        Box(modifier = Modifier.padding(horizontal = 20.dp)) {
                            SectionEmptyView(
                                title = "No featured products",
                                description = "Check back soon for fresh arrivals"
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // ==========================================
            // 6. POPULAR PRODUCTS SECTION
            // ==========================================
            Column(modifier = Modifier.fillMaxWidth()) {
                SectionHeader(
                    eyebrow = "Popular picks",
                    title = "Most Loved Essentials",
                    subtitle = "Highly rated by local shoppers",
                    actionText = "View all",
                    onActionClick = onSearchClick,
                    modifier = Modifier.padding(horizontal = 20.dp)
                )

                Spacer(modifier = Modifier.height(14.dp))

                when (val state = uiState.popularProductsState) {
                    is UiState.Loading -> {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 20.dp),
                            horizontalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            items(3) {
                                ShimmerPlaceholder(
                                    modifier = Modifier.size(width = 180.dp, height = 260.dp),
                                    shape = RoundedCornerShape(20.dp)
                                )
                            }
                        }
                    }
                    is UiState.Success -> {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 20.dp),
                            horizontalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            items(state.data, key = { it.productId }) { product ->
                                ProductCard(
                                    product = product,
                                    onClick = { onProductClick(product.productId) },
                                    onAddToCart = { viewModel.addToCart(product.productId) },
                                    onToggleWishlist = { viewModel.toggleWishlist(product.productId) },
                                    isWishlisted = uiState.wishlistProductIds.contains(product.productId)
                                )
                            }
                        }
                    }
                    is UiState.Error -> {
                        Box(modifier = Modifier.padding(horizontal = 20.dp)) {
                            SectionErrorView(
                                message = state.message,
                                onRetry = { viewModel.loadPopularAndNewProducts() }
                            )
                        }
                    }
                    is UiState.Empty -> {
                        Box(modifier = Modifier.padding(horizontal = 20.dp)) {
                            SectionEmptyView(
                                title = "No popular products yet",
                                description = "Explore our wide catalog"
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // ==========================================
            // 7. NEW ARRIVALS SECTION
            // ==========================================
            Column(modifier = Modifier.fillMaxWidth()) {
                SectionHeader(
                    eyebrow = "Just in",
                    title = "New Arrivals",
                    subtitle = "Fresh stocks directly from stores",
                    actionText = "View all",
                    onActionClick = onSearchClick,
                    modifier = Modifier.padding(horizontal = 20.dp)
                )

                Spacer(modifier = Modifier.height(14.dp))

                when (val state = uiState.newArrivalsState) {
                    is UiState.Loading -> {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 20.dp),
                            horizontalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            items(3) {
                                ShimmerPlaceholder(
                                    modifier = Modifier.size(width = 180.dp, height = 260.dp),
                                    shape = RoundedCornerShape(20.dp)
                                )
                            }
                        }
                    }
                    is UiState.Success -> {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 20.dp),
                            horizontalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            items(state.data, key = { it.productId }) { product ->
                                ProductCard(
                                    product = product,
                                    onClick = { onProductClick(product.productId) },
                                    onAddToCart = { viewModel.addToCart(product.productId) },
                                    onToggleWishlist = { viewModel.toggleWishlist(product.productId) },
                                    isWishlisted = uiState.wishlistProductIds.contains(product.productId)
                                )
                            }
                        }
                    }
                    is UiState.Error -> {
                        Box(modifier = Modifier.padding(horizontal = 20.dp)) {
                            SectionErrorView(
                                message = state.message,
                                onRetry = { viewModel.loadPopularAndNewProducts() }
                            )
                        }
                    }
                    is UiState.Empty -> {
                        Box(modifier = Modifier.padding(horizontal = 20.dp)) {
                            SectionEmptyView(
                                title = "New arrivals coming soon",
                                description = "Stay tuned for weekly restocks"
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // ==========================================
            // 8. NEARBY STORES SECTION
            // ==========================================
            Column(modifier = Modifier.fillMaxWidth()) {
                SectionHeader(
                    eyebrow = "Neighborhood partners",
                    title = "Nearby Stores",
                    subtitle = "Verified local shops delivering near you",
                    actionText = "All stores",
                    onActionClick = onSearchClick,
                    modifier = Modifier.padding(horizontal = 20.dp)
                )

                Spacer(modifier = Modifier.height(14.dp))

                when (val state = uiState.storesState) {
                    is UiState.Loading -> {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 20.dp),
                            horizontalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            items(2) {
                                ShimmerPlaceholder(
                                    modifier = Modifier.size(width = 220.dp, height = 180.dp),
                                    shape = RoundedCornerShape(20.dp)
                                )
                            }
                        }
                    }
                    is UiState.Success -> {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 20.dp),
                            horizontalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            items(state.data, key = { it.storeId }) { store ->
                                StoreCard(
                                    store = store,
                                    onClick = { onStoreClick(store.storeId) }
                                )
                            }
                        }
                    }
                    is UiState.Error -> {
                        Box(modifier = Modifier.padding(horizontal = 20.dp)) {
                            SectionErrorView(
                                message = state.message,
                                onRetry = { viewModel.loadStores() }
                            )
                        }
                    }
                    is UiState.Empty -> {
                        Box(modifier = Modifier.padding(horizontal = 20.dp)) {
                            SectionEmptyView(
                                title = "No stores found in your area",
                                description = "Try exploring other areas in Sheopur"
                            )
                        }
                    }
                }
            }

            // ==========================================
            // 9. BOTTOM SPACING
            // ==========================================
            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}
