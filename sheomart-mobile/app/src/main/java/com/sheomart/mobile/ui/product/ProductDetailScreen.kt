package com.sheomart.mobile.ui.product

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.data.model.Product
import com.sheomart.mobile.data.model.ProductDetail
import com.sheomart.mobile.data.model.ProductReviewItem
import com.sheomart.mobile.ui.components.AsyncImageLoader
import com.sheomart.mobile.ui.components.PrimaryButton
import com.sheomart.mobile.ui.components.ProductCard
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.components.ShimmerPlaceholder
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailScreen(
    productId: String,
    viewModel: ProductDetailViewModel,
    onBack: () -> Unit,
    onNavigateCart: () -> Unit,
    onStoreClick: (String) -> Unit,
    onProductClick: (String) -> Unit = {}
) {
    LaunchedEffect(productId) {
        viewModel.loadProduct(productId)
    }

    val state by viewModel.productState.collectAsState()
    val similarProdsState by viewModel.similarProductsState.collectAsState()
    val selectedImageIdx by viewModel.selectedImageIndex.collectAsState()
    val qty by viewModel.quantity.collectAsState()
    val isWishlisted by viewModel.isWishlisted.collectAsState()
    val cartMsg by viewModel.cartActionMessage.collectAsState()
    val cartItemCount by viewModel.cartItemCount.collectAsState()
    val isInCart by viewModel.isInCart.collectAsState()
    val isSubmittingReview by viewModel.isSubmittingReview.collectAsState()

    var showReviewDialog by remember { mutableStateOf(false) }
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(cartMsg) {
        cartMsg?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearMessage()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = (state as? UiState.Success)?.data?.name ?: "Product Details",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Text("←", fontSize = 22.sp, color = MaterialTheme.colorScheme.onSurface, fontWeight = FontWeight.Bold)
                    }
                },
                actions = {
                    // Wishlist Shortcut
                    IconButton(onClick = { viewModel.toggleWishlist(productId) }) {
                        Text(if (isWishlisted) "❤️" else "🤍", fontSize = 18.sp)
                    }

                    // Cart Shortcut with Badge
                    Box(modifier = Modifier.padding(end = 8.dp)) {
                        IconButton(onClick = onNavigateCart) {
                            Text("🛍️", fontSize = 20.sp)
                        }
                        if (cartItemCount > 0) {
                            Box(
                                modifier = Modifier
                                    .align(Alignment.TopEnd)
                                    .offset(x = (-4).dp, y = 4.dp)
                                    .size(18.dp)
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.primary),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = if (cartItemCount > 99) "99+" else "$cartItemCount",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onPrimary
                                    )
                                )
                            }
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        },
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = {
            if (state is UiState.Success) {
                val prod = (state as UiState.Success<ProductDetail>).data
                BottomCartBar(
                    product = prod,
                    quantity = qty,
                    isInCart = isInCart,
                    onIncrease = { viewModel.increaseQuantity() },
                    onDecrease = { viewModel.decreaseQuantity() },
                    onAddToCart = { viewModel.addToCart(prod.productId) },
                    onViewCart = onNavigateCart
                )
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when (val res = state) {
                is UiState.Loading -> {
                    ProductDetailSkeleton()
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
                            onRetry = { viewModel.loadProduct(productId) }
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
                        Text("Product not found", color = SecondaryText)
                    }
                }
                is UiState.Success -> {
                    ProductDetailContent(
                        product = res.data,
                        similarProdsState = similarProdsState,
                        selectedImageIdx = selectedImageIdx,
                        isWishlisted = isWishlisted,
                        onSelectImage = { viewModel.selectImage(it) },
                        onToggleWishlist = { viewModel.toggleWishlist(res.data.productId) },
                        onStoreClick = onStoreClick,
                        onProductClick = { newId ->
                            viewModel.loadProduct(newId)
                            onProductClick(newId)
                        },
                        onWriteReviewClick = { showReviewDialog = true }
                    )

                    if (showReviewDialog) {
                        WriteReviewDialog(
                            productName = res.data.name,
                            isSubmitting = isSubmittingReview,
                            onSubmit = { rating, title, comment ->
                                viewModel.submitReview(
                                    productId = res.data.productId,
                                    rating = rating,
                                    title = title,
                                    comment = comment,
                                    onSuccess = { showReviewDialog = false }
                                )
                            },
                            onDismiss = { showReviewDialog = false }
                        )
                    }
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT DETAIL MAIN CONTENT
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun ProductDetailContent(
    product: ProductDetail,
    similarProdsState: UiState<List<Product>>,
    selectedImageIdx: Int,
    isWishlisted: Boolean,
    onSelectImage: (Int) -> Unit,
    onToggleWishlist: () -> Unit,
    onStoreClick: (String) -> Unit,
    onProductClick: (String) -> Unit,
    onWriteReviewClick: () -> Unit
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(bottom = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. IMAGE GALLERY
        ProductImageGallery(
            product = product,
            selectedImageIdx = selectedImageIdx,
            isWishlisted = isWishlisted,
            onSelectImage = onSelectImage,
            onToggleWishlist = onToggleWishlist
        )

        // 2. PRODUCT INFO & PRICING CARD
        ProductMainCard(product = product)

        // 3. STORE INFORMATION CARD
        if (!product.storeName.isNullOrBlank()) {
            ProductStoreCard(
                product = product,
                onStoreClick = { product.storeId?.let(onStoreClick) }
            )
        }

        // 4. FAST DELIVERY & SERVICE GUARANTEES
        DeliveryAssurancesCard()

        // 5. DESCRIPTION & SPECIFICATIONS ACCORDION
        ProductDetailsAccordion(product = product)

        // 6. RATINGS & REVIEWS SECTION
        ProductReviewsSection(
            product = product,
            onWriteReviewClick = onWriteReviewClick
        )

        // 7. SIMILAR PRODUCTS CAROUSEL
        SimilarProductsSection(
            similarProdsState = similarProdsState,
            onProductClick = onProductClick
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. IMAGE GALLERY COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun ProductImageGallery(
    product: ProductDetail,
    selectedImageIdx: Int,
    isWishlisted: Boolean,
    onSelectImage: (Int) -> Unit,
    onToggleWishlist: () -> Unit
) {
    val images = remember(product) {
        val list = mutableListOf<String>()
        product.thumbnail?.takeIf { it.isNotBlank() }?.let { list.add(it) }
        product.images.forEach { if (it.isNotBlank() && !list.contains(it)) list.add(it) }
        if (list.isEmpty()) listOf("") else list
    }

    val pagerState = rememberPagerState(initialPage = selectedImageIdx, pageCount = { images.size })
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(selectedImageIdx) {
        if (pagerState.currentPage != selectedImageIdx && selectedImageIdx < images.size) {
            pagerState.animateScrollToPage(selectedImageIdx)
        }
    }

    LaunchedEffect(pagerState.currentPage) {
        onSelectImage(pagerState.currentPage)
    }

    Column(modifier = Modifier.fillMaxWidth()) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(320.dp)
                .background(Surface)
        ) {
            // Horizontal Pager
            HorizontalPager(
                state = pagerState,
                modifier = Modifier.fillMaxSize()
            ) { page ->
                val imageUrl = images.getOrNull(page).orEmpty()
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    AsyncImageLoader(
                        url = imageUrl.ifBlank { null },
                        contentDescription = "${product.name} image ${page + 1}",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Fit,
                        fallbackText = product.name
                    )
                }
            }

            // Floating Discount Badge
            if (product.hasDiscount) {
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = PrimaryGreen,
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(16.dp)
                ) {
                    Text(
                        text = "${product.discountPercent}% OFF",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 11.sp,
                            color = Color.White
                        ),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            // Floating Wishlist Heart Button
            Surface(
                shape = CircleShape,
                color = Color.White.copy(alpha = 0.92f),
                shadowElevation = 3.dp,
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(16.dp)
                    .size(42.dp)
                    .clickable(onClick = onToggleWishlist)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(text = if (isWishlisted) "❤️" else "🤍", fontSize = 18.sp)
                }
            }

            // Page Indicator Dots
            if (images.size > 1) {
                Row(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    images.indices.forEach { index ->
                        val isSelected = pagerState.currentPage == index
                        Box(
                            modifier = Modifier
                                .height(6.dp)
                                .width(if (isSelected) 18.dp else 6.dp)
                                .clip(CircleShape)
                                .background(if (isSelected) PrimaryGreen else Border)
                                .animateContentSize()
                        )
                    }
                }
            }
        }

        // Thumbnails Strip
        if (images.size > 1) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 10.dp)
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                images.forEachIndexed { index, imgUrl ->
                    val isSelected = index == pagerState.currentPage
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Surface,
                        border = androidx.compose.foundation.BorderStroke(
                            width = if (isSelected) 2.dp else 1.dp,
                            color = if (isSelected) PrimaryGreen else Border
                        ),
                        modifier = Modifier
                            .size(54.dp)
                            .clickable {
                                coroutineScope.launch {
                                    pagerState.animateScrollToPage(index)
                                }
                            }
                    ) {
                        AsyncImageLoader(
                            url = imgUrl.ifBlank { null },
                            contentDescription = "Thumb $index",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop,
                            fallbackText = "${index + 1}"
                        )
                    }
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PRODUCT MAIN CARD (Info + Pricing + Savings)
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun ProductMainCard(product: ProductDetail) {
    Surface(
        shape = RoundedCornerShape(20.dp),
        color = Surface,
        border = androidx.compose.foundation.BorderStroke(1.dp, Border),
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Brand & Category row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = product.brand?.uppercase() ?: "SHEOMART PANTRY",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp,
                        fontSize = 11.sp
                    ),
                    color = PrimaryGreen
                )

                // Rating Pill
                if (product.rating != null && product.rating > 0.0) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = Color(0xFFFEF3C7)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text("★", color = Color(0xFFF59E0B), fontSize = 12.sp)
                            Text(
                                text = String.format("%.1f", product.rating),
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp,
                                    color = Color(0xFF92400E)
                                )
                            )
                            Text(
                                text = "(${product.totalReviews})",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontSize = 10.sp,
                                    color = Color(0xFF92400E)
                                )
                            )
                        }
                    }
                }
            }

            // Product Name
            Text(
                text = product.name,
                style = MaterialTheme.typography.titleLarge.copy(
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp
                ),
                color = PrimaryText
            )

            // Category tag (if available)
            if (!product.categoryName.isNullOrBlank()) {
                Text(
                    text = "Aisle: ${product.categoryName}",
                    style = MaterialTheme.typography.bodySmall,
                    color = SecondaryText
                )
            }

            Divider(color = Border, thickness = 0.5.dp)

            // Pricing & Savings
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Bottom,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Row(
                        verticalAlignment = Alignment.Bottom,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "₹${product.displayPrice.toInt()}",
                            style = MaterialTheme.typography.headlineMedium.copy(
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 28.sp
                            ),
                            color = PrimaryText
                        )
                        if (product.hasDiscount) {
                            Text(
                                text = "MRP ₹${product.price.toInt()}",
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontSize = 14.sp,
                                    textDecoration = TextDecoration.LineThrough,
                                    color = SecondaryText
                                )
                            )
                        }
                    }
                    Text(
                        text = "Inclusive of all taxes",
                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                        color = SecondaryText
                    )
                }

                // Savings Badge
                if (product.hasDiscount) {
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = PrimaryGreen.copy(alpha = 0.12f)
                    ) {
                        Text(
                            text = "Save ₹${(product.price - product.discountPrice!!).toInt()}",
                            style = MaterialTheme.typography.labelMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = PrimaryGreen
                            ),
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        )
                    }
                }
            }

            // Stock Availability Badge
            val stockColor = when {
                !product.isInStock -> Color(0xFFEF4444)
                product.quantity <= 5 -> Color(0xFFF59E0B)
                else -> PrimaryGreen
            }
            val stockText = when {
                !product.isInStock -> "Out of Stock"
                product.quantity <= 5 -> "Only ${product.quantity} left in stock - order soon!"
                else -> "In Stock & Ready for Fast Delivery"
            }

            Surface(
                shape = RoundedCornerShape(10.dp),
                color = stockColor.copy(alpha = 0.1f)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(stockColor)
                    )
                    Text(
                        text = stockText,
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = stockColor
                        )
                    )
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. STORE INFORMATION CARD
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun ProductStoreCard(
    product: ProductDetail,
    onStoreClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(20.dp),
        color = Surface,
        border = androidx.compose.foundation.BorderStroke(1.dp, Border),
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .clickable(onClick = onStoreClick)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
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
                        .size(46.dp)
                        .clip(CircleShape)
                        .background(Background),
                    contentAlignment = Alignment.Center
                ) {
                    Text("🏪", fontSize = 22.sp)
                }
                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = product.storeName ?: "Local Store",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = PrimaryText,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        if (product.storeBadge.equals("royal", ignoreCase = true) || product.storeBadge.equals("verified", ignoreCase = true)) {
                            Text("🛡️", fontSize = 12.sp)
                        }
                    }
                    Text(
                        text = "Delivering in 10-15 mins from neighborhood",
                        style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                        color = SecondaryText
                    )
                }
            }
            Text(
                text = "Visit Store →",
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                color = PrimaryGreen
            )
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. DELIVERY & SERVICE GUARANTEES
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun DeliveryAssurancesCard() {
    Surface(
        shape = RoundedCornerShape(20.dp),
        color = Surface,
        border = androidx.compose.foundation.BorderStroke(1.dp, Border),
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "Why Order on SheoMart?",
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                color = PrimaryText
            )

            val assurances = listOf(
                Triple("⚡", "10-15 Minute Delivery", "From local neighborhood stores right to your doorstep"),
                Triple("🚚", "Free Delivery on ₹199+", "Enjoy zero delivery fees on orders above ₹199"),
                Triple("🛡️", "100% Quality Checked", "Fresh produce and handpicked pantry essentials"),
                Triple("🔄", "Easy Return / Replacement", "Instant replacement if quality does not meet standards")
            )

            assurances.forEach { (icon, title, desc) ->
                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Text(icon, fontSize = 16.sp)
                    Column {
                        Text(
                            text = title,
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                            color = PrimaryText
                        )
                        Text(
                            text = desc,
                            style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                            color = SecondaryText
                        )
                    }
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. DESCRIPTION & SPECIFICATIONS ACCORDION
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun ProductDetailsAccordion(product: ProductDetail) {
    var isDescExpanded by remember { mutableStateOf(true) }
    var isSpecsExpanded by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // Description Card
        if (!product.description.isNullOrBlank()) {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Surface,
                border = androidx.compose.foundation.BorderStroke(1.dp, Border),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { isDescExpanded = !isDescExpanded },
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Product Description",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = PrimaryText
                        )
                        Text(
                            text = if (isDescExpanded) "▲" else "▼",
                            fontSize = 12.sp,
                            color = SecondaryText
                        )
                    }

                    AnimatedVisibility(
                        visible = isDescExpanded,
                        enter = fadeIn() + expandVertically(),
                        exit = fadeOut() + shrinkVertically()
                    ) {
                        Column {
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = product.description,
                                style = MaterialTheme.typography.bodyMedium,
                                color = SecondaryText,
                                lineHeight = 22.sp
                            )
                        }
                    }
                }
            }
        }

        // Specifications Card
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = Surface,
            border = androidx.compose.foundation.BorderStroke(1.dp, Border),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { isSpecsExpanded = !isSpecsExpanded },
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Product Specifications",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = PrimaryText
                    )
                    Text(
                        text = if (isSpecsExpanded) "▲" else "▼",
                        fontSize = 12.sp,
                        color = SecondaryText
                    )
                }

                AnimatedVisibility(
                    visible = isSpecsExpanded,
                    enter = fadeIn() + expandVertically(),
                    exit = fadeOut() + shrinkVertically()
                ) {
                    Column(
                        modifier = Modifier.padding(top = 10.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        SpecRow("Brand", product.brand ?: "SheoMart")
                        if (!product.categoryName.isNullOrBlank()) SpecRow("Category", product.categoryName)
                        if (!product.sku.isNullOrBlank()) SpecRow("SKU", product.sku)
                        SpecRow("Packaging", "Standard grocery pack")
                        SpecRow("Storage Instructions", "Store in a cool, dry place away from direct sunlight")
                        SpecRow("Country of Origin", "India")
                    }
                }
            }
        }
    }
}

@Composable
private fun SpecRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, style = MaterialTheme.typography.bodySmall, color = SecondaryText)
        Text(text = value, style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold), color = PrimaryText)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. RATINGS & REVIEWS SECTION
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun ProductReviewsSection(
    product: ProductDetail,
    onWriteReviewClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(20.dp),
        color = Surface,
        border = androidx.compose.foundation.BorderStroke(1.dp, Border),
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Ratings & Reviews",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = PrimaryText
                    )
                    if (product.reviews.isNotEmpty()) {
                        Text(
                            text = "${product.reviews.size} verified reviews",
                            style = MaterialTheme.typography.labelSmall,
                            color = SecondaryText
                        )
                    }
                }

                // Write Review Button
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = PrimaryGreen.copy(alpha = 0.12f),
                    modifier = Modifier.clickable(onClick = onWriteReviewClick)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Text("★", color = PrimaryGreen, fontSize = 12.sp)
                        Text(
                            text = "Write Review",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                            color = PrimaryGreen
                        )
                    }
                }
            }

            if (product.reviews.isEmpty()) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text("⭐", fontSize = 28.sp)
                    Text(
                        text = "No customer reviews yet",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = PrimaryText
                    )
                    Text(
                        text = "Be the first customer in Sheopur to try and rate this item!",
                        style = MaterialTheme.typography.bodySmall,
                        color = SecondaryText,
                        textAlign = TextAlign.Center
                    )
                }
            } else {
                product.reviews.forEachIndexed { idx, review ->
                    ReviewCard(review = review)
                    if (idx < product.reviews.size - 1) {
                        Divider(color = Border, thickness = 0.5.dp, modifier = Modifier.padding(vertical = 4.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun ReviewCard(review: ProductReviewItem) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = review.userName,
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryText
                )
                Text("• Verified Buyer", style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp), color = PrimaryGreen)
            }
            Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                repeat(review.rating) {
                    Text("★", color = Color(0xFFF59E0B), fontSize = 12.sp)
                }
            }
        }
        if (!review.comment.isNullOrBlank()) {
            Text(
                text = review.comment,
                style = MaterialTheme.typography.bodySmall,
                color = SecondaryText,
                lineHeight = 18.sp
            )
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. SIMILAR PRODUCTS SECTION
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun SimilarProductsSection(
    similarProdsState: UiState<List<Product>>,
    onProductClick: (String) -> Unit
) {
    when (similarProdsState) {
        is UiState.Success -> {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "You Might Also Like",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryText,
                    modifier = Modifier.padding(horizontal = 20.dp)
                )

                LazyRow(
                    contentPadding = PaddingValues(horizontal = 20.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(similarProdsState.data, key = { it.productId }) { prod ->
                        ProductCard(
                            product = prod,
                            onClick = { onProductClick(prod.productId) },
                            onAddToCart = {},
                            onToggleWishlist = {}
                        )
                    }
                }
            }
        }
        is UiState.Loading -> {
            Column(modifier = Modifier.padding(horizontal = 20.dp)) {
                ShimmerPlaceholder(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(140.dp),
                    shape = RoundedCornerShape(20.dp)
                )
            }
        }
        else -> {}
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. STICKY BOTTOM CART BAR
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun BottomCartBar(
    product: ProductDetail,
    quantity: Int,
    isInCart: Boolean,
    onIncrease: () -> Unit,
    onDecrease: () -> Unit,
    onAddToCart: () -> Unit,
    onViewCart: () -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 12.dp,
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(horizontal = 20.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Quantity Selector
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(14.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(14.dp))
                    .padding(horizontal = 4.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                IconButton(
                    onClick = onDecrease,
                    modifier = Modifier.size(32.dp),
                    enabled = quantity > 1
                ) {
                    Text("-", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                }

                Text(
                    text = "$quantity",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )

                IconButton(
                    onClick = onIncrease,
                    modifier = Modifier.size(32.dp),
                    enabled = quantity < product.quantity
                ) {
                    Text("+", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                }
            }

            // Main Action Button
            PrimaryButton(
                text = if (!product.isInStock) {
                    "Out of Stock"
                } else if (isInCart) {
                    "Add More • ₹${(product.displayPrice * quantity).toInt()}"
                } else {
                    "Add to Basket • ₹${(product.displayPrice * quantity).toInt()}"
                },
                onClick = onAddToCart,
                modifier = Modifier.weight(1f),
                enabled = product.isInStock
            )
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON PLACEHOLDER
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun ProductDetailSkeleton() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        ShimmerPlaceholder(
            modifier = Modifier
                .fillMaxWidth()
                .height(280.dp),
            shape = RoundedCornerShape(20.dp)
        )
        ShimmerPlaceholder(
            modifier = Modifier
                .fillMaxWidth()
                .height(140.dp),
            shape = RoundedCornerShape(20.dp)
        )
        ShimmerPlaceholder(
            modifier = Modifier
                .fillMaxWidth()
                .height(80.dp),
            shape = RoundedCornerShape(20.dp)
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITE REVIEW DIALOG
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun WriteReviewDialog(
    productName: String,
    isSubmitting: Boolean,
    onSubmit: (rating: Int, title: String?, comment: String?) -> Unit,
    onDismiss: () -> Unit
) {
    var rating by remember { mutableStateOf(5) }
    var title by remember { mutableStateOf("") }
    var comment by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = { if (!isSubmitting) onDismiss() },
        shape = RoundedCornerShape(24.dp),
        containerColor = Surface,
        title = {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "Rate & Review",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryText
                )
                Text(
                    text = productName,
                    style = MaterialTheme.typography.bodySmall,
                    color = SecondaryText,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Interactive Star Rating
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = when (rating) {
                            5 -> "⭐⭐⭐⭐⭐ Excellent"
                            4 -> "⭐⭐⭐⭐ Very Good"
                            3 -> "⭐⭐⭐ Good"
                            2 -> "⭐⭐ Fair"
                            else -> "⭐ Needs Improvement"
                        },
                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                        color = Color(0xFFD97706)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        (1..5).forEach { starIndex ->
                            Text(
                                text = if (starIndex <= rating) "★" else "☆",
                                fontSize = 32.sp,
                                color = if (starIndex <= rating) Color(0xFFF59E0B) else Border,
                                modifier = Modifier.clickable { rating = starIndex }
                            )
                        }
                    }
                }

                // Title Input
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Title (Optional)", fontSize = 12.sp) },
                    placeholder = { Text("e.g., Fresh & high quality!", color = SecondaryText, fontSize = 13.sp) },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = PrimaryGreen,
                        unfocusedBorderColor = Border
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                // Comment Input
                OutlinedTextField(
                    value = comment,
                    onValueChange = { comment = it },
                    label = { Text("Your Review", fontSize = 12.sp) },
                    placeholder = { Text("Tell other shoppers about quality, freshness, packaging...", color = SecondaryText, fontSize = 13.sp) },
                    minLines = 3,
                    maxLines = 5,
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = PrimaryGreen,
                        unfocusedBorderColor = Border
                    ),
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onSubmit(rating, title.takeIf { it.isNotBlank() }, comment.takeIf { it.isNotBlank() }) },
                enabled = !isSubmitting,
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
            ) {
                if (isSubmitting) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text("Submit Review", fontWeight = FontWeight.Bold, color = Color.White)
                }
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                enabled = !isSubmitting
            ) {
                Text("Cancel", color = SecondaryText)
            }
        }
    )
}
