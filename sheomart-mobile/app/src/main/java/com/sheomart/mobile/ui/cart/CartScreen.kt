package com.sheomart.mobile.ui.cart

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.data.model.CartData
import com.sheomart.mobile.data.model.CartItem
import com.sheomart.mobile.ui.components.AsyncImageLoader
import com.sheomart.mobile.ui.components.CustomerNavTab
import com.sheomart.mobile.ui.components.PrimaryButton
import com.sheomart.mobile.ui.components.SectionEmptyView
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.components.SheoBottomNavigation
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartScreen(
    viewModel: CartViewModel,
    onNavigateTab: (CustomerNavTab) -> Unit,
    onProductClick: (String) -> Unit,
    onCheckoutClick: () -> Unit
) {
    val state by viewModel.cartState.collectAsState()
    val isUpdating by viewModel.isUpdating.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.loadCart()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "My Basket",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                },
                actions = {
                    if (state is UiState.Success && (state as UiState.Success<CartData>).data.items.isNotEmpty()) {
                        TextButton(onClick = { viewModel.clearCart() }) {
                            Text("Clear", color = Color(0xFFEF4444), style = MaterialTheme.typography.labelMedium)
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        bottomBar = {
            Column {
                if (state is UiState.Success && (state as UiState.Success<CartData>).data.items.isNotEmpty()) {
                    val cart = (state as UiState.Success<CartData>).data
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        color = Color.White,
                        shadowElevation = 8.dp
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 20.dp, vertical = 12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("Total", style = MaterialTheme.typography.bodySmall, color = SecondaryText)
                                Text(
                                    text = "₹${cart.totalAmount.toInt()}",
                                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold),
                                    color = PrimaryText
                                )
                            }

                            PrimaryButton(
                                text = "Proceed to Checkout →",
                                onClick = onCheckoutClick,
                                modifier = Modifier.width(220.dp),
                                enabled = !isUpdating
                            )
                        }
                    }
                }
                SheoBottomNavigation(
                    currentTab = CustomerNavTab.CART,
                    onTabSelected = onNavigateTab
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
                            onRetry = { viewModel.loadCart() }
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
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            Text("🛒", fontSize = 48.sp)
                            SectionEmptyView(
                                title = "Your basket is empty",
                                description = "Discover local spices, fresh farm produce, and daily staples."
                            )
                            PrimaryButton(
                                text = "Explore SheoMart",
                                onClick = { onNavigateTab(CustomerNavTab.EXPLORE) },
                                modifier = Modifier.width(200.dp)
                            )
                        }
                    }
                }
                is UiState.Success -> {
                    val cart = res.data
                    if (cart.items.isEmpty()) {
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
                                Text("🛒", fontSize = 48.sp)
                                SectionEmptyView(
                                    title = "Your basket is empty",
                                    description = "Discover local spices, fresh farm produce, and daily staples."
                                )
                                PrimaryButton(
                                    text = "Explore SheoMart",
                                    onClick = { onNavigateTab(CustomerNavTab.EXPLORE) },
                                    modifier = Modifier.width(200.dp)
                                )
                            }
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            items(cart.items) { item ->
                                CartItemCard(
                                    item = item,
                                    onIncrease = { viewModel.updateQuantity(item.cartItemId, item.quantity + 1) },
                                    onDecrease = { viewModel.updateQuantity(item.cartItemId, item.quantity - 1) },
                                    onRemove = { viewModel.removeItem(item.cartItemId) },
                                    onItemClick = { onProductClick(item.productId) }
                                )
                            }

                            item {
                                Spacer(modifier = Modifier.height(8.dp))
                                BillSummaryCard(cart = cart)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CartItemCard(
    item: CartItem,
    onIncrease: () -> Unit,
    onDecrease: () -> Unit,
    onRemove: () -> Unit,
    onItemClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .border(1.dp, Border, RoundedCornerShape(16.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        AsyncImageLoader(
            url = item.thumbnail,
            contentDescription = item.productName,
            modifier = Modifier
                .size(70.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(Surface)
                .clickable(onClick = onItemClick),
            contentScale = ContentScale.Crop,
            fallbackText = item.productName
        )

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = item.productName,
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                color = PrimaryText,
                maxLines = 2
            )
            if (!item.storeName.isNullOrBlank()) {
                Text(
                    text = item.storeName,
                    style = MaterialTheme.typography.bodySmall,
                    color = SecondaryText
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "₹${item.totalPrice.toInt()}",
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                color = PrimaryGreen
            )
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
            IconButton(onClick = onDecrease, modifier = Modifier.size(28.dp)) {
                Text(if (item.quantity == 1) "🗑️" else "-", fontSize = if (item.quantity == 1) 12.sp else 16.sp, fontWeight = FontWeight.Bold, color = PrimaryText)
            }
            Text(
                text = "${item.quantity}",
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                color = PrimaryText
            )
            IconButton(onClick = onIncrease, modifier = Modifier.size(28.dp)) {
                Text("+", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = PrimaryGreen)
            }
        }
    }
}

@Composable
private fun BillSummaryCard(cart: CartData) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .border(1.dp, Border, RoundedCornerShape(16.dp))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            text = "Bill Details",
            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
            color = PrimaryText
        )

        Divider(color = Border, thickness = 0.5.dp, modifier = Modifier.padding(vertical = 4.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Item Total", style = MaterialTheme.typography.bodyMedium, color = SecondaryText)
            Text("₹${cart.subtotal.toInt()}", style = MaterialTheme.typography.bodyMedium, color = PrimaryText)
        }

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Delivery Fee", style = MaterialTheme.typography.bodyMedium, color = SecondaryText)
            if (cart.deliveryFee == 0.0) {
                Text("FREE", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold), color = PrimaryGreen)
            } else {
                Text("₹${cart.deliveryFee.toInt()}", style = MaterialTheme.typography.bodyMedium, color = PrimaryText)
            }
        }

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Platform Fee", style = MaterialTheme.typography.bodyMedium, color = SecondaryText)
            Text("₹${cart.platformFee.toInt()}", style = MaterialTheme.typography.bodyMedium, color = PrimaryText)
        }

        if (cart.discountAmount > 0) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Discount Applied", style = MaterialTheme.typography.bodyMedium, color = PrimaryGreen)
                Text("-₹${cart.discountAmount.toInt()}", style = MaterialTheme.typography.bodyMedium, color = PrimaryGreen)
            }
        }

        Divider(color = Border, thickness = 0.5.dp, modifier = Modifier.padding(vertical = 4.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("To Pay", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold), color = PrimaryText)
            Text(
                text = "₹${cart.totalAmount.toInt()}",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.ExtraBold),
                color = PrimaryGreen
            )
        }
    }
}
