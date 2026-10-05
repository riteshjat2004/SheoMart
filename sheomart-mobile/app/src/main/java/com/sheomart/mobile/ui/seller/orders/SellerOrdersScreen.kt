package com.sheomart.mobile.ui.seller.orders

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.data.model.SellerOrderItem
import com.sheomart.mobile.ui.components.SectionEmptyView
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.components.StatusBadge
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SellerOrdersScreen(
    viewModel: SellerOrdersViewModel,
    onBack: () -> Unit
) {
    val colorScheme = MaterialTheme.colorScheme

    val state by viewModel.ordersState.collectAsState()
    val selectedTab by viewModel.selectedTab.collectAsState()
    val actionMsg by viewModel.actionMessage.collectAsState()

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(actionMsg) {
        actionMsg?.let {
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
                        text = "Customer Orders",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = colorScheme.onSurface
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Text("←", fontSize = 22.sp, color = colorScheme.primary, fontWeight = FontWeight.Bold)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = colorScheme.surface)
            )
        },
        containerColor = colorScheme.background
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = colorScheme.surface,
                contentColor = colorScheme.primary
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { viewModel.selectTab(0) },
                    text = {
                        Text(
                            text = "All",
                            fontWeight = if (selectedTab == 0) FontWeight.Bold else FontWeight.Normal,
                            color = if (selectedTab == 0) colorScheme.primary else colorScheme.onSurfaceVariant
                        )
                    }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { viewModel.selectTab(1) },
                    text = {
                        Text(
                            text = "Pending / Prep",
                            fontWeight = if (selectedTab == 1) FontWeight.Bold else FontWeight.Normal,
                            color = if (selectedTab == 1) colorScheme.primary else colorScheme.onSurfaceVariant
                        )
                    }
                )
                Tab(
                    selected = selectedTab == 2,
                    onClick = { viewModel.selectTab(2) },
                    text = {
                        Text(
                            text = "Delivered",
                            fontWeight = if (selectedTab == 2) FontWeight.Bold else FontWeight.Normal,
                            color = if (selectedTab == 2) colorScheme.primary else colorScheme.onSurfaceVariant
                        )
                    }
                )
            }

            Box(modifier = Modifier.fillMaxSize()) {
                when (val res = state) {
                    is UiState.Loading -> {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(color = colorScheme.primary)
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
                                onRetry = { viewModel.loadOrders() }
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
                                title = "No orders in this queue",
                                description = "New customer pickup and delivery orders will show here in real-time."
                            )
                        }
                    }
                    is UiState.Success -> {
                        val filteredOrders = res.data.filter { order ->
                            when (selectedTab) {
                                1 -> order.status.lowercase() != "delivered" && order.status.lowercase() != "cancelled"
                                2 -> order.status.lowercase() == "delivered"
                                else -> true
                            }
                        }

                        if (filteredOrders.isEmpty()) {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(24.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                SectionEmptyView(
                                    title = "No orders in this queue",
                                    description = "New customer pickup and delivery orders will show here in real-time."
                                )
                            }
                        } else {
                            LazyColumn(
                                modifier = Modifier.fillMaxSize(),
                                contentPadding = PaddingValues(16.dp),
                                verticalArrangement = Arrangement.spacedBy(14.dp)
                            ) {
                                items(filteredOrders, key = { it.orderId }) { order ->
                                    SellerOrderCard(
                                        order = order,
                                        onUpdateStatus = { next -> viewModel.updateStatus(order.orderId, next) }
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

@Composable
private fun SellerOrderCard(
    order: SellerOrderItem,
    onUpdateStatus: (String) -> Unit
) {
    val colorScheme = MaterialTheme.colorScheme

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(colorScheme.surface)
            .border(1.dp, colorScheme.outlineVariant, RoundedCornerShape(16.dp))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Order #${order.orderId.takeLast(8).uppercase()}",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = colorScheme.onSurface
                )
                Text(
                    text = "Customer: ${order.customerName ?: "Shopper"}",
                    style = MaterialTheme.typography.bodySmall,
                    color = colorScheme.onSurfaceVariant
                )
            }

            StatusBadge(text = order.status)
        }

        HorizontalDivider(color = colorScheme.outlineVariant.copy(alpha = 0.5f), thickness = 0.5.dp)

        // Items preview
        order.items.forEach { item ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${item.quantity}x ${item.name}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = colorScheme.onSurface
                )
                Text(
                    text = "₹${(item.price * item.quantity).toInt()}",
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = colorScheme.onSurface
                )
            }
        }

        HorizontalDivider(color = colorScheme.outlineVariant.copy(alpha = 0.5f), thickness = 0.5.dp)

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Total: ₹${order.totalAmount.toInt()}",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = colorScheme.primary
            )

            // Status action buttons
            when (order.status.uppercase()) {
                "PENDING" -> {
                    Button(
                        onClick = { onUpdateStatus("ACCEPTED") },
                        colors = ButtonDefaults.buttonColors(containerColor = colorScheme.primary),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text("Accept Order", fontSize = 12.sp)
                    }
                }
                "ACCEPTED" -> {
                    Button(
                        onClick = { onUpdateStatus("PREPARING") },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB)),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text("Mark Preparing", fontSize = 12.sp)
                    }
                }
                "PREPARING" -> {
                    Button(
                        onClick = { onUpdateStatus("READY_FOR_DISPATCH") },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF065F46)),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text("Ready to Ship", fontSize = 12.sp)
                    }
                }
                "READY_FOR_DISPATCH" -> {
                    Button(
                        onClick = { onUpdateStatus("DELIVERED") },
                        colors = ButtonDefaults.buttonColors(containerColor = colorScheme.primary),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text("Mark Delivered", fontSize = 12.sp)
                    }
                }
                else -> {}
            }
        }
    }
}
