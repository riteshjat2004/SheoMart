package com.sheomart.mobile.ui.cart

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.data.model.AddressItem
import com.sheomart.mobile.data.model.CartData
import com.sheomart.mobile.data.model.CartItem
import com.sheomart.mobile.data.model.Coupon
import com.sheomart.mobile.ui.components.AsyncImageLoader
import com.sheomart.mobile.ui.components.CustomerNavTab
import com.sheomart.mobile.ui.components.PrimaryButton
import com.sheomart.mobile.ui.components.SheoBottomNavigation
import com.sheomart.mobile.ui.components.ShimmerPlaceholder
import com.sheomart.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartScreen(
    viewModel: CartViewModel,
    onNavigateTab: (CustomerNavTab) -> Unit,
    onProductClick: (String) -> Unit,
    onCheckoutClick: () -> Unit
) {
    val cart by viewModel.cartData.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val actionMsg by viewModel.actionMessage.collectAsState()
    val updatingIds by viewModel.updatingItemIds.collectAsState()
    val selectedAddress by viewModel.selectedAddress.collectAsState()
    val availableCoupons by viewModel.availableCoupons.collectAsState()
    val couponInput by viewModel.couponInput.collectAsState()
    val showClearDialog by viewModel.showClearDialog.collectAsState()
    val appliedCoupon by viewModel.appliedCoupon.collectAsState()

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        viewModel.refresh()
    }

    LaunchedEffect(actionMsg) {
        actionMsg?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearMessage()
        }
    }

    // Clear Cart Confirmation Dialog
    if (showClearDialog) {
        AlertDialog(
            onDismissRequest = { viewModel.dismissClearDialog() },
            title = {
                Text(
                    text = "Clear Basket?",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                )
            },
            text = {
                Text(
                    text = "Are you sure you want to remove all items from your basket?",
                    style = MaterialTheme.typography.bodyMedium,
                    color = SecondaryText
                )
            },
            confirmButton = {
                Button(
                    onClick = { viewModel.confirmClearCart() },
                    colors = ButtonDefaults.buttonColors(containerColor = Error)
                ) {
                    Text("Clear Basket", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.dismissClearDialog() }) {
                    Text("Cancel", color = PrimaryText)
                }
            },
            containerColor = Color.White,
            shape = RoundedCornerShape(16.dp)
        )
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "My Basket",
                            style = MaterialTheme.typography.titleLarge.copy(
                                fontWeight = FontWeight.Bold,
                                fontSize = 20.sp
                            ),
                            color = PrimaryText
                        )
                        if (cart.items.isNotEmpty()) {
                            Box(
                                modifier = Modifier
                                    .clip(CircleShape)
                                    .background(PrimaryGreen.copy(alpha = 0.12f))
                                    .padding(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "${cart.totalItems} items",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = PrimaryGreen
                                    )
                                )
                            }
                        }
                    }
                },
                actions = {
                    if (cart.items.isNotEmpty()) {
                        TextButton(onClick = { viewModel.requestClearCart() }) {
                            Text(
                                text = "Clear",
                                color = Error,
                                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold)
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        bottomBar = {
            Column {
                // Sticky Checkout Bar
                if (cart.items.isNotEmpty()) {
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        color = Color.White,
                        shadowElevation = 12.dp
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Text(
                                        text = "₹${cart.totalAmount.toInt()}",
                                        style = MaterialTheme.typography.titleLarge.copy(
                                            fontWeight = FontWeight.ExtraBold,
                                            fontSize = 20.sp
                                        ),
                                        color = PrimaryText
                                    )
                                    if (cart.totalSavings > 0) {
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(4.dp))
                                                .background(PrimaryGreen.copy(alpha = 0.12f))
                                                .padding(horizontal = 4.dp, vertical = 1.dp)
                                        ) {
                                            Text(
                                                text = "Save ₹${cart.totalSavings.toInt()}",
                                                style = MaterialTheme.typography.labelSmall.copy(
                                                    fontWeight = FontWeight.Bold,
                                                    color = PrimaryGreen,
                                                    fontSize = 10.sp
                                                )
                                            )
                                        }
                                    }
                                }
                                Text(
                                    text = "${cart.totalItems} item(s) to order",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = SecondaryText
                                )
                            }

                            PrimaryButton(
                                text = if (cart.hasUnavailableItems) "Items Unavailable" else "Proceed to Checkout →",
                                onClick = onCheckoutClick,
                                modifier = Modifier.width(200.dp),
                                enabled = cart.canCheckout && updatingIds.isEmpty()
                            )
                        }
                    }
                }
                SheoBottomNavigation(
                    currentTab = CustomerNavTab.CART,
                    onTabSelected = onNavigateTab,
                    cartCount = cart.totalItems
                )
            }
        },
        containerColor = Background
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when {
                isLoading && cart.items.isEmpty() -> {
                    CartSkeletonLoading()
                }
                cart.items.isEmpty() -> {
                    EmptyCartView(onExploreClick = { onNavigateTab(CustomerNavTab.EXPLORE) })
                }
                else -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // ── 1. Delivery Address Preview ──────────────────────
                        item(key = "address_preview") {
                            AddressPreviewCard(
                                address = selectedAddress,
                                onChangeClick = { onNavigateTab(CustomerNavTab.PROFILE) }
                            )
                        }

                        // ── 2. Unavailable Items Warning Banner ───────────────
                        if (cart.hasUnavailableItems) {
                            item(key = "unavailable_warning") {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(14.dp))
                                        .background(Color(0xFFFEF3C7))
                                        .border(1.dp, Color(0xFFF59E0B), RoundedCornerShape(14.dp))
                                        .padding(12.dp)
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Text("⚠️", fontSize = 18.sp)
                                        Column {
                                            Text(
                                                text = "Stock Alert",
                                                style = MaterialTheme.typography.labelMedium.copy(
                                                    fontWeight = FontWeight.Bold,
                                                    color = Color(0xFF92400E)
                                                )
                                            )
                                            Text(
                                                text = "Some items are currently out of stock or exceed inventory. Please adjust quantities to checkout.",
                                                style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                                                color = Color(0xFFB45309)
                                            )
                                        }
                                    }
                                }
                            }
                        }

                        // ── 3. Cart Items ────────────────────────────────────
                        items(
                            items = cart.items,
                            key = { it.cartItemId }
                        ) { item ->
                            CartItemCard(
                                item = item,
                                isUpdating = updatingIds.contains(item.cartItemId) || updatingIds.contains(item.productId),
                                onIncrease = { viewModel.updateQuantity(item.cartItemId, item.quantity + 1) },
                                onDecrease = { viewModel.updateQuantity(item.cartItemId, item.quantity - 1) },
                                onRemove = { viewModel.removeItem(item.cartItemId) },
                                onSaveForLater = { viewModel.moveToWishlist(item) },
                                onItemClick = { onProductClick(item.productId) }
                            )
                        }

                        // ── 4. Coupon Section ────────────────────────────────
                        item(key = "coupons_section") {
                            CouponsSection(
                                couponInput = couponInput,
                                onInputChange = { viewModel.onCouponInputChange(it) },
                                onApplyInput = { viewModel.applyCouponFromInput() },
                                availableCoupons = availableCoupons,
                                appliedCoupon = appliedCoupon,
                                onApplyCoupon = { viewModel.applyCoupon(it) },
                                onRemoveCoupon = { viewModel.removeCoupon() }
                            )
                        }

                        // ── 5. Bill Summary Card ─────────────────────────────
                        item(key = "bill_summary") {
                            BillSummaryCard(cart = cart)
                        }

                        item(key = "cart_bottom_spacer") {
                            Spacer(modifier = Modifier.height(16.dp))
                        }
                    }
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Delivery Address Preview Card
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun AddressPreviewCard(
    address: AddressItem?,
    onChangeClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .border(1.dp, Border, RoundedCornerShape(16.dp))
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                modifier = Modifier.weight(1f),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(PrimaryGreen.copy(alpha = 0.12f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("📍", fontSize = 18.sp)
                }

                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = "Deliver to ${address?.title ?: "Home"}",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = PrimaryText
                        )
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(PrimaryGreen.copy(alpha = 0.12f))
                                .padding(horizontal = 5.dp, vertical = 1.dp)
                        ) {
                            Text(
                                text = "⚡ 15-25 mins",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = PrimaryGreen,
                                    fontSize = 9.sp
                                )
                            )
                        }
                    }
                    Text(
                        text = address?.addressLine ?: "Sheopur, Madhya Pradesh 476337",
                        style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                        color = SecondaryText,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            TextButton(
                onClick = onChangeClick,
                contentPadding = PaddingValues(horizontal = 8.dp)
            ) {
                Text(
                    text = "Change",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryGreen
                )
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Cart Item Card with Stepper & Save for Later
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun CartItemCard(
    item: CartItem,
    isUpdating: Boolean,
    onIncrease: () -> Unit,
    onDecrease: () -> Unit,
    onRemove: () -> Unit,
    onSaveForLater: () -> Unit,
    onItemClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .border(
                1.dp,
                if (!item.isAvailable) Color(0xFFFCA5A5) else Border,
                RoundedCornerShape(16.dp)
            )
            .padding(12.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.Top
            ) {
                // Product Thumbnail
                Box(modifier = Modifier.size(76.dp)) {
                    AsyncImageLoader(
                        url = item.thumbnail,
                        contentDescription = item.productName,
                        modifier = Modifier
                            .fillMaxSize()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Surface)
                            .clickable(onClick = onItemClick),
                        contentScale = ContentScale.Crop,
                        fallbackText = item.productName
                    )
                    if (!item.isAvailable) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color.Black.copy(alpha = 0.5f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Unavailable",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White,
                                    fontSize = 9.sp
                                )
                            )
                        }
                    }
                }

                // Details
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(2.dp)
                ) {
                    if (!item.storeName.isNullOrBlank()) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text(
                                text = item.storeName,
                                style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp),
                                color = SecondaryText,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            when (item.storeBadge.lowercase()) {
                                "royal" -> Text("👑", fontSize = 10.sp)
                                "verified" -> Text("✓", fontSize = 10.sp, color = PrimaryGreen, fontWeight = FontWeight.Bold)
                            }
                        }
                    }

                    Text(
                        text = item.productName,
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                        color = PrimaryText,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )

                    if (!item.brand.isNullOrBlank()) {
                        Text(
                            text = item.brand,
                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                            color = SecondaryText
                        )
                    }

                    Spacer(modifier = Modifier.height(2.dp))

                    // Price & Savings
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = "₹${item.totalPrice.toInt()}",
                            style = MaterialTheme.typography.titleSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = PrimaryGreen,
                                fontSize = 15.sp
                            )
                        )
                        if (item.hasDiscount && item.originalTotalPrice > item.totalPrice) {
                            Text(
                                text = "₹${item.originalTotalPrice.toInt()}",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    textDecoration = TextDecoration.LineThrough,
                                    color = SecondaryText,
                                    fontSize = 11.sp
                                )
                            )
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(Color(0xFFFEF3C7))
                                    .padding(horizontal = 4.dp, vertical = 1.dp)
                            ) {
                                Text(
                                    text = "${item.discountPercent}% OFF",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFFD97706),
                                        fontSize = 9.sp
                                    )
                                )
                            }
                        }
                    }
                }

                // Stepper
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(Surface)
                        .border(1.dp, Border, RoundedCornerShape(10.dp))
                        .padding(horizontal = 4.dp, vertical = 2.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    IconButton(
                        onClick = onDecrease,
                        enabled = !isUpdating,
                        modifier = Modifier.size(28.dp)
                    ) {
                        if (item.quantity == 1) {
                            Icon(
                                imageVector = Icons.Default.Delete,
                                contentDescription = "Remove",
                                tint = Error,
                                modifier = Modifier.size(14.dp)
                            )
                        } else {
                            Text("-", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = PrimaryText)
                        }
                    }

                    if (isUpdating) {
                        CircularProgressIndicator(
                            color = PrimaryGreen,
                            modifier = Modifier.size(12.dp),
                            strokeWidth = 1.5.dp
                        )
                    } else {
                        Text(
                            text = "${item.quantity}",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                            color = PrimaryText
                        )
                    }

                    IconButton(
                        onClick = onIncrease,
                        enabled = !isUpdating && item.quantity < item.maxAvailableQuantity,
                        modifier = Modifier.size(28.dp)
                    ) {
                        Text(
                            text = "+",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (item.quantity < item.maxAvailableQuantity) PrimaryGreen else SecondaryText
                        )
                    }
                }
            }

            // Bottom Actions (Save for later)
            HorizontalDivider(color = Border.copy(alpha = 0.4f), thickness = 0.5.dp)

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (!item.isAvailable) {
                    Text(
                        text = item.availabilityMessage,
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = Error
                    )
                } else if (item.maxAvailableQuantity <= 5) {
                    Text(
                        text = "Only ${item.maxAvailableQuantity} left in stock",
                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                        color = Color(0xFFD97706)
                    )
                } else {
                    Spacer(modifier = Modifier.width(1.dp))
                }

                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Save for later",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.SemiBold,
                            color = SecondaryText
                        ),
                        modifier = Modifier
                            .clickable(onClick = onSaveForLater)
                            .padding(vertical = 2.dp)
                    )

                    Text(
                        text = "Remove",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.SemiBold,
                            color = Error
                        ),
                        modifier = Modifier
                            .clickable(onClick = onRemove)
                            .padding(vertical = 2.dp)
                    )
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Coupons Section (Interactive 1-Tap Carousel & Code Input)
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun CouponsSection(
    couponInput: String,
    onInputChange: (String) -> Unit,
    onApplyInput: () -> Unit,
    availableCoupons: List<Coupon>,
    appliedCoupon: Coupon?,
    onApplyCoupon: (Coupon) -> Unit,
    onRemoveCoupon: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .border(1.dp, Border, RoundedCornerShape(16.dp))
            .padding(14.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text("🏷️", fontSize = 16.sp)
                Text(
                    text = "Offers & Coupons",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryText
                )
            }

            if (appliedCoupon != null) {
                // Applied Coupon Card
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(PrimaryGreen.copy(alpha = 0.08f))
                        .border(1.dp, PrimaryGreen.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                        .padding(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text("🎉", fontSize = 18.sp)
                            Column {
                                Text(
                                    text = "'${appliedCoupon.code}' Applied",
                                    style = MaterialTheme.typography.labelMedium.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = PrimaryGreen
                                    )
                                )
                                Text(
                                    text = appliedCoupon.title,
                                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp),
                                    color = SecondaryText
                                )
                            }
                        }

                        TextButton(
                            onClick = onRemoveCoupon,
                            contentPadding = PaddingValues(horizontal = 6.dp)
                        ) {
                            Text(
                                text = "Remove",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = Error
                                )
                            )
                        }
                    }
                }
            } else {
                // Coupon Input Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = couponInput,
                        onValueChange = onInputChange,
                        placeholder = {
                            Text("Enter coupon code", style = MaterialTheme.typography.bodySmall, color = SecondaryText)
                        },
                        singleLine = true,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PrimaryGreen,
                            unfocusedBorderColor = Border,
                            focusedContainerColor = Color.White,
                            unfocusedContainerColor = Surface
                        )
                    )

                    Button(
                        onClick = onApplyInput,
                        enabled = couponInput.isNotBlank(),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
                    ) {
                        Text("Apply", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold))
                    }
                }

                // Available Coupons Carousel
                if (availableCoupons.isNotEmpty()) {
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        contentPadding = PaddingValues(vertical = 4.dp)
                    ) {
                        items(availableCoupons, key = { it.code }) { coupon ->
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Surface)
                                    .border(1.dp, Border, RoundedCornerShape(10.dp))
                                    .clickable { onApplyCoupon(coupon) }
                                    .padding(horizontal = 10.dp, vertical = 6.dp)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Column {
                                        Text(
                                            text = coupon.code,
                                            style = MaterialTheme.typography.labelSmall.copy(
                                                fontWeight = FontWeight.Bold,
                                                color = PrimaryText
                                            )
                                        )
                                        Text(
                                            text = "Min ₹${coupon.minimumCartValue.toInt()}",
                                            style = MaterialTheme.typography.labelSmall.copy(
                                                fontSize = 9.sp,
                                                color = SecondaryText
                                            )
                                        )
                                    }
                                    Text(
                                        text = "APPLY",
                                        style = MaterialTheme.typography.labelSmall.copy(
                                            fontWeight = FontWeight.Bold,
                                            color = PrimaryGreen,
                                            fontSize = 10.sp
                                        )
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Bill Summary Card with Savings Celebration
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun BillSummaryCard(cart: CartData) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .border(1.dp, Border, RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(
                text = "Bill Details",
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                color = PrimaryText
            )

            HorizontalDivider(color = Border.copy(alpha = 0.5f), thickness = 0.5.dp)

            // Item Total
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Item Total", style = MaterialTheme.typography.bodyMedium, color = SecondaryText)
                Text("₹${cart.subtotal.toInt()}", style = MaterialTheme.typography.bodyMedium, color = PrimaryText)
            }

            // Delivery Fee
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text("Delivery Fee", style = MaterialTheme.typography.bodyMedium, color = SecondaryText)
                    if (cart.deliveryFee == 0.0) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(PrimaryGreen.copy(alpha = 0.12f))
                                .padding(horizontal = 4.dp, vertical = 1.dp)
                        ) {
                            Text(
                                text = "FREE OVER ₹499",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = PrimaryGreen,
                                    fontSize = 8.sp
                                )
                            )
                        }
                    }
                }
                if (cart.deliveryFee == 0.0) {
                    Text("FREE", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold), color = PrimaryGreen)
                } else {
                    Text("₹${cart.deliveryFee.toInt()}", style = MaterialTheme.typography.bodyMedium, color = PrimaryText)
                }
            }

            // Platform Fee
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Platform Fee", style = MaterialTheme.typography.bodyMedium, color = SecondaryText)
                Text("₹${cart.platformFee.toInt()}", style = MaterialTheme.typography.bodyMedium, color = PrimaryText)
            }

            // Coupon Discount
            if (cart.discountAmount > 0) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Coupon Discount", style = MaterialTheme.typography.bodyMedium, color = PrimaryGreen)
                    Text("-₹${cart.discountAmount.toInt()}", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold), color = PrimaryGreen)
                }
            }

            HorizontalDivider(color = Border.copy(alpha = 0.5f), thickness = 0.5.dp)

            // Grand Total
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("To Pay", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold), color = PrimaryText)
                Text(
                    text = "₹${cart.totalAmount.toInt()}",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.ExtraBold),
                    color = PrimaryGreen
                )
            }

            // Savings Banner
            if (cart.totalSavings > 0) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(PrimaryGreen.copy(alpha = 0.08f))
                        .padding(horizontal = 10.dp, vertical = 8.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text("🎉", fontSize = 14.sp)
                        Text(
                            text = "You saved ₹${cart.totalSavings.toInt()} on this order!",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = PrimaryGreen
                            )
                        )
                    }
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Skeleton Loading
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun CartSkeletonLoading() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        ShimmerPlaceholder(
            modifier = Modifier
                .fillMaxWidth()
                .height(60.dp),
            shape = RoundedCornerShape(16.dp)
        )
        repeat(3) {
            ShimmerPlaceholder(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(110.dp),
                shape = RoundedCornerShape(16.dp)
            )
        }
        ShimmerPlaceholder(
            modifier = Modifier
                .fillMaxWidth()
                .height(140.dp),
            shape = RoundedCornerShape(16.dp)
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Empty State View
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun EmptyCartView(onExploreClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(90.dp)
                    .clip(CircleShape)
                    .background(Surface),
                contentAlignment = Alignment.Center
            ) {
                Text("🛒", fontSize = 42.sp)
            }

            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = "Your basket is empty",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryText
                )
                Text(
                    text = "Discover local spices, fresh farm produce, and daily staples from stores in Sheopur.",
                    style = MaterialTheme.typography.bodySmall,
                    color = SecondaryText,
                    modifier = Modifier.padding(horizontal = 16.dp),
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            PrimaryButton(
                text = "Explore SheoMart",
                onClick = onExploreClick,
                modifier = Modifier.width(220.dp)
            )
        }
    }
}
