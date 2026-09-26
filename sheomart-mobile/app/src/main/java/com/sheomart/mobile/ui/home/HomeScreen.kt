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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
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
    val wishlistProductIds by viewModel.wishlistProductIds.collectAsState()
    val cartItemCount by viewModel.cartItemCount.collectAsState()
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
                onTabSelected = onNavigateTab,
                wishlistCount = wishlistProductIds.size,
                cartCount = cartItemCount
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
                                    isWishlisted = wishlistProductIds.contains(product.productId)
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
                                    isWishlisted = wishlistProductIds.contains(product.productId)
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
                                    isWishlisted = wishlistProductIds.contains(product.productId)
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
            // 9. FESTIVAL OFFERS SECTION
            // ==========================================
            val offersUiState = uiState.offersState
            if (offersUiState !is UiState.Empty) {
                Spacer(modifier = Modifier.height(28.dp))
                Column(modifier = Modifier.fillMaxWidth()) {
                    SectionHeader(
                        eyebrow = "Limited time deals",
                        title = "Festival Offers 🎉",
                        subtitle = "Seasonal savings just for you",
                        actionText = null,
                        onActionClick = {},
                        modifier = Modifier.padding(horizontal = 20.dp)
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                    when (val state = offersUiState) {
                        is UiState.Loading -> {
                            LazyRow(
                                contentPadding = PaddingValues(horizontal = 20.dp),
                                horizontalArrangement = Arrangement.spacedBy(14.dp)
                            ) {
                                items(3) {
                                    ShimmerPlaceholder(
                                        modifier = Modifier.size(width = 220.dp, height = 130.dp),
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
                                items(state.data, key = { it.offerId }) { offer ->
                                    FestivalOfferCard(offer = offer)
                                }
                            }
                        }
                        is UiState.Error -> {
                            Box(modifier = Modifier.padding(horizontal = 20.dp)) {
                                SectionErrorView(
                                    message = state.message,
                                    onRetry = { viewModel.loadOffers() }
                                )
                            }
                        }
                        else -> {}
                    }
                }
            }

            // ==========================================
            // 10. COUPONS SECTION
            // ==========================================
            val couponsUiState = uiState.couponsState
            if (couponsUiState !is UiState.Empty) {
                Spacer(modifier = Modifier.height(28.dp))
                Column(modifier = Modifier.fillMaxWidth()) {
                    SectionHeader(
                        eyebrow = "Save more today",
                        title = "Live Coupons 🏷️",
                        subtitle = "Apply at checkout for instant savings",
                        actionText = null,
                        onActionClick = {},
                        modifier = Modifier.padding(horizontal = 20.dp)
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                    val clipboardManager = LocalClipboardManager.current
                    when (val state = couponsUiState) {
                        is UiState.Loading -> {
                            LazyRow(
                                contentPadding = PaddingValues(horizontal = 20.dp),
                                horizontalArrangement = Arrangement.spacedBy(14.dp)
                            ) {
                                items(3) {
                                    ShimmerPlaceholder(
                                        modifier = Modifier.size(width = 200.dp, height = 120.dp),
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
                                items(state.data, key = { it.couponId }) { coupon ->
                                    CouponCard(
                                        coupon = coupon,
                                        onCopyCode = {
                                            clipboardManager.setText(AnnotatedString(coupon.code))
                                            viewModel.onCouponCopied(coupon.code)
                                        }
                                    )
                                }
                            }
                        }
                        is UiState.Error -> {
                            Box(modifier = Modifier.padding(horizontal = 20.dp)) {
                                SectionErrorView(
                                    message = state.message,
                                    onRetry = { viewModel.loadCoupons() }
                                )
                            }
                        }
                        else -> {}
                    }
                }
            }

            // ==========================================
            // 11. WHY CHOOSE SHEOMART TRUST BADGES
            // ==========================================
            Spacer(modifier = Modifier.height(32.dp))
            WhyChooseSheoMart()

            // ==========================================
            // 12. BOTTOM SPACING
            // ==========================================
            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// FESTIVAL OFFER CARD
// ─────────────────────────────────────────────────────────────────────────────
@Composable
private fun FestivalOfferCard(offer: PromotionOffer) {
    Box(
        modifier = Modifier
            .width(220.dp)
            .height(130.dp)
            .clip(RoundedCornerShape(20.dp))
            .background(
                Brush.linearGradient(
                    colors = listOf(
                        Color(0xFFFF6B35),
                        Color(0xFFFF8C42)
                    )
                )
            )
            .border(1.dp, Color.White.copy(alpha = 0.2f), RoundedCornerShape(20.dp))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Festival name badge
            offer.festivalName?.let { festival ->
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Color.White.copy(alpha = 0.2f)
                ) {
                    Text(
                        text = "🎊 $festival",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        ),
                        color = Color.White,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Column {
                Text(
                    text = offer.displayDiscount,
                    style = MaterialTheme.typography.headlineSmall.copy(
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 26.sp
                    ),
                    color = Color.White
                )
                Text(
                    text = offer.title,
                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp),
                    color = Color.White.copy(alpha = 0.9f),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }

        // Decorative circle
        Box(
            modifier = Modifier
                .size(80.dp)
                .align(Alignment.TopEnd)
                .offset(x = 20.dp, y = (-20).dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.1f))
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// COUPON CARD
// ─────────────────────────────────────────────────────────────────────────────
@Composable
private fun CouponCard(
    coupon: Coupon,
    onCopyCode: () -> Unit
) {
    var copied by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .width(200.dp)
            .wrapContentHeight()
            .clip(RoundedCornerShape(20.dp))
            .background(Surface)
            .border(1.5.dp, Border, RoundedCornerShape(20.dp))
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Discount badge
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = PrimaryGreen.copy(alpha = 0.12f)
            ) {
                Text(
                    text = coupon.displayDiscount,
                    style = MaterialTheme.typography.labelMedium.copy(
                        fontWeight = FontWeight.ExtraBold
                    ),
                    color = PrimaryGreen,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                )
            }

            Text(
                text = coupon.title,
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                color = PrimaryText,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            coupon.minOrderText?.let {
                Text(
                    text = it,
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                    color = SecondaryText
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Code + Copy row
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Dashed code box
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Background
                ) {
                    Text(
                        text = coupon.code,
                        style = MaterialTheme.typography.labelMedium.copy(
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        ),
                        color = PrimaryText,
                        modifier = Modifier
                            .border(1.dp, Border, RoundedCornerShape(8.dp))
                            .padding(horizontal = 8.dp, vertical = 5.dp)
                    )
                }

                // Copy button
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (copied) PrimaryGreen else PrimaryGreen.copy(alpha = 0.12f),
                    modifier = Modifier.clickable {
                        onCopyCode()
                        copied = true
                    }
                ) {
                    Text(
                        text = if (copied) "✓ Copied" else "Copy",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
                        ),
                        color = if (copied) Color.White else PrimaryGreen,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// WHY CHOOSE SHEOMART
// ─────────────────────────────────────────────────────────────────────────────
@Composable
private fun WhyChooseSheoMart() {
    val features = listOf(
        Triple("⚡", "10-min Delivery", "From store to door"),
        Triple("🔒", "Secure Payments", "100% safe checkout"),
        Triple("✅", "Verified Stores", "Quality guaranteed"),
        Triple("🥗", "Fresh Products", "Farm to table daily")
    )

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
    ) {
        Text(
            text = "Why Choose SheoMart?",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
            color = PrimaryText
        )
        Spacer(modifier = Modifier.height(14.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            features.forEach { (emoji, title, subtitle) ->
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(16.dp))
                        .background(Surface)
                        .border(1.dp, Border, RoundedCornerShape(16.dp))
                        .padding(10.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(text = emoji, fontSize = 22.sp)
                    Text(
                        text = title,
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp
                        ),
                        color = PrimaryText,
                        textAlign = TextAlign.Center,
                        maxLines = 2
                    )
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
                        color = SecondaryText,
                        textAlign = TextAlign.Center,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }
    }
}
