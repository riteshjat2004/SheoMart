package com.sheomart.mobile.ui.product

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.data.model.ProductDetail
import com.sheomart.mobile.ui.components.AsyncImageLoader
import com.sheomart.mobile.ui.components.PrimaryButton
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailScreen(
    productId: String,
    viewModel: ProductDetailViewModel,
    onBack: () -> Unit,
    onNavigateCart: () -> Unit,
    onStoreClick: (String) -> Unit
) {
    LaunchedEffect(productId) {
        viewModel.loadProduct(productId)
    }

    val state by viewModel.productState.collectAsState()
    val selectedImageIdx by viewModel.selectedImageIndex.collectAsState()
    val qty by viewModel.quantity.collectAsState()
    val isWishlisted by viewModel.isWishlisted.collectAsState()
    val cartMsg by viewModel.cartActionMessage.collectAsState()

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
                        maxLines = 1
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Text("←", fontSize = 20.sp, color = PrimaryGreen)
                    }
                },
                actions = {
                    IconButton(onClick = onNavigateCart) {
                        Text("🛍️", fontSize = 18.sp)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        containerColor = Background,
        bottomBar = {
            if (state is UiState.Success) {
                val prod = (state as UiState.Success<ProductDetail>).data
                BottomCartBar(
                    product = prod,
                    quantity = qty,
                    onIncrease = { viewModel.increaseQuantity() },
                    onDecrease = { viewModel.decreaseQuantity() },
                    onAddToCart = { viewModel.addToCart(prod.productId) }
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
                        selectedImageIdx = selectedImageIdx,
                        isWishlisted = isWishlisted,
                        onSelectImage = { viewModel.selectImage(it) },
                        onToggleWishlist = { viewModel.toggleWishlist(res.data.productId) },
                        onStoreClick = onStoreClick
                    )
                }
            }
        }
    }
}

@Composable
private fun ProductDetailContent(
    product: ProductDetail,
    selectedImageIdx: Int,
    isWishlisted: Boolean,
    onSelectImage: (Int) -> Unit,
    onToggleWishlist: () -> Unit,
    onStoreClick: (String) -> Unit
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(bottom = 16.dp)
    ) {
        // Image Gallery Container
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(300.dp)
                .background(Surface)
        ) {
            val mainImageUrl = product.images.getOrNull(selectedImageIdx) ?: product.thumbnail

            AsyncImageLoader(
                url = mainImageUrl,
                contentDescription = product.name,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Fit,
                fallbackText = product.name
            )

            // Wishlist Button
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(16.dp)
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(Color.White.copy(alpha = 0.9f))
                    .clickable(onClick = onToggleWishlist),
                contentAlignment = Alignment.Center
            ) {
                Text(text = if (isWishlisted) "❤️" else "🤍", fontSize = 18.sp)
            }

            // Discount Badge
            if (product.hasDiscount) {
                Box(
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(16.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(PrimaryGreen)
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "${product.discountPercent}% OFF",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    )
                }
            }
        }

        // Thumbnails row if multiple images
        if (product.images.size > 1) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                product.images.forEachIndexed { index, imgUrl ->
                    val isSelected = index == selectedImageIdx
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(Color.White)
                            .border(
                                width = if (isSelected) 2.dp else 1.dp,
                                color = if (isSelected) PrimaryGreen else Border,
                                shape = RoundedCornerShape(10.dp)
                            )
                            .clickable { onSelectImage(index) }
                    ) {
                        AsyncImageLoader(
                            url = imgUrl,
                            contentDescription = "Thumbnail $index",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop,
                            shape = RoundedCornerShape(10.dp)
                        )
                    }
                }
            }
        }

        // Product Main Info Card
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
                .clip(RoundedCornerShape(20.dp))
                .background(Color.White)
                .border(1.dp, Border, RoundedCornerShape(20.dp))
                .padding(16.dp)
        ) {
            // Brand & Rating row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = product.brand ?: "SheoMart Pantry",
                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
                    color = PrimaryGreen
                )

                if (product.rating != null && product.rating > 0) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Text(text = "★", color = Color(0xFFF59E0B), fontSize = 14.sp)
                        Text(
                            text = String.format("%.1f", product.rating),
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                            color = PrimaryText
                        )
                        Text(
                            text = "(${product.totalReviews})",
                            style = MaterialTheme.typography.bodySmall,
                            color = SecondaryText
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = product.name,
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                color = PrimaryText
            )

            if (!product.categoryName.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Category: ${product.categoryName}",
                    style = MaterialTheme.typography.bodySmall,
                    color = SecondaryText
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Pricing
            Row(
                verticalAlignment = Alignment.Bottom,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "₹${product.displayPrice.toInt()}",
                    style = MaterialTheme.typography.headlineMedium.copy(
                        fontWeight = FontWeight.ExtraBold,
                        color = PrimaryText
                    )
                )

                if (product.hasDiscount) {
                    Text(
                        text = "₹${product.price.toInt()}",
                        style = MaterialTheme.typography.titleMedium.copy(
                            textDecoration = TextDecoration.LineThrough,
                            color = SecondaryText
                        )
                    )
                    Text(
                        text = "Save ₹${(product.price - product.discountPrice!!).toInt()}",
                        style = MaterialTheme.typography.labelMedium.copy(
                            color = PrimaryGreen,
                            fontWeight = FontWeight.SemiBold
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Stock status
            val stockColor = when {
                !product.isInStock -> Color(0xFFEF4444)
                product.quantity <= 5 -> Color(0xFFF59E0B)
                else -> PrimaryGreen
            }
            val stockLabel = when {
                !product.isInStock -> "Out of Stock"
                product.quantity <= 5 -> "Only ${product.quantity} left in stock!"
                else -> "In Stock & Ready for Fast Delivery"
            }

            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(stockColor)
                )
                Text(
                    text = stockLabel,
                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
                    color = stockColor
                )
            }
        }

        // Store Information Card
        if (!product.storeName.isNullOrBlank()) {
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color.White)
                    .border(1.dp, Border, RoundedCornerShape(16.dp))
                    .clickable { product.storeId?.let { onStoreClick(it) } }
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .clip(CircleShape)
                            .background(Surface),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("🏪", fontSize = 20.sp)
                    }
                    Column {
                        Text(
                            text = product.storeName,
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = PrimaryText
                        )
                        Text(
                            text = "Local neighborhood verified store",
                            style = MaterialTheme.typography.bodySmall,
                            color = SecondaryText
                        )
                    }
                }
                Text("Visit →", style = MaterialTheme.typography.labelMedium, color = PrimaryGreen)
            }
        }

        // Description Card
        if (!product.description.isNullOrBlank()) {
            Spacer(modifier = Modifier.height(12.dp))
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color.White)
                    .border(1.dp, Border, RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Text(
                    text = "Description",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryText
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = product.description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = SecondaryText,
                    lineHeight = 22.sp
                )
            }
        }

        // Customer Reviews Section
        Spacer(modifier = Modifier.height(12.dp))
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(Color.White)
                .border(1.dp, Border, RoundedCornerShape(16.dp))
                .padding(16.dp)
        ) {
            Text(
                text = "Customer Reviews (${product.reviews.size})",
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                color = PrimaryText
            )
            Spacer(modifier = Modifier.height(10.dp))

            if (product.reviews.isEmpty()) {
                Text(
                    text = "No reviews yet. Be the first to try this item!",
                    style = MaterialTheme.typography.bodySmall,
                    color = SecondaryText
                )
            } else {
                product.reviews.forEachIndexed { idx, review ->
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = review.userName,
                                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                                color = PrimaryText
                            )
                            Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                                repeat(review.rating) {
                                    Text("★", color = Color(0xFFF59E0B), fontSize = 12.sp)
                                }
                            }
                        }
                        if (!review.comment.isNullOrBlank()) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = review.comment,
                                style = MaterialTheme.typography.bodySmall,
                                color = SecondaryText
                            )
                        }
                    }
                    if (idx < product.reviews.size - 1) {
                        Divider(color = Border, thickness = 0.5.dp, modifier = Modifier.padding(vertical = 6.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun BottomCartBar(
    product: ProductDetail,
    quantity: Int,
    onIncrease: () -> Unit,
    onDecrease: () -> Unit,
    onAddToCart: () -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Color.White,
        shadowElevation = 8.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Quantity Selector
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(Surface)
                    .border(1.dp, Border, RoundedCornerShape(12.dp))
                    .padding(horizontal = 4.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                IconButton(
                    onClick = onDecrease,
                    modifier = Modifier.size(32.dp),
                    enabled = quantity > 1
                ) {
                    Text("-", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = PrimaryText)
                }

                Text(
                    text = "$quantity",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryText
                )

                IconButton(
                    onClick = onIncrease,
                    modifier = Modifier.size(32.dp),
                    enabled = quantity < product.quantity
                ) {
                    Text("+", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = PrimaryGreen)
                }
            }

            // Add to Cart Button
            PrimaryButton(
                text = if (product.isInStock) "Add to Basket • ₹${(product.displayPrice * quantity).toInt()}" else "Out of Stock",
                onClick = onAddToCart,
                modifier = Modifier.weight(1f),
                enabled = product.isInStock
            )
        }
    }
}
