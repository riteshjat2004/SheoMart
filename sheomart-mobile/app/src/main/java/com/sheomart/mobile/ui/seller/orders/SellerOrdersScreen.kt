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
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SellerOrdersScreen(
    viewModel: SellerOrdersViewModel,
    onBack: () -> Unit
) {
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
                title = { Text("Customer Orders", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Text("←", fontSize = 20.sp, color = PrimaryGreen)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        containerColor = Background
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color.White,
                contentColor = PrimaryGreen
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { viewModel.selectTab(0) },
                    text = { Text("All", fontWeight = if (selectedTab == 0) FontWeight.Bold else FontWeight.Normal) }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { viewModel.selectTab(1) },
                    text = { Text("Pending / Prep", fontWeight = if (selectedTab == 1) FontWeight.Bold else FontWeight.Normal) }
                )
                Tab(
                    selected = selectedTab == 2,
                    onClick = { viewModel.selectTab(2) },
                    text = { Text("Completed", fontWeight = if (selectedTab == 2) FontWeight.Bold else FontWeight.Normal) }
                )
            }

            Box(modifier = Modifier.fillMaxSize()) {
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
                                items(filteredOrders) { order ->
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
    val (statusColor, statusBg) = when (order.status.lowercase()) {
        "delivered" -> Color(0xFF059669) to Color(0xFFD1FAE5)
        "cancelled" -> Color(0xFFDC2626) to Color(0xFFFEE2E2)
        "dispatched", "out_for_delivery" -> Color(0xFF2563EB) to Color(0xFFDBEAFE)
        else -> Color(0xFFD97706) to Color(0xFFFEF3C7)
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .border(1.dp, Border, RoundedCornerShape(16.dp))
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
                    color = PrimaryText
                )
                Text(
                    text = "Customer: ${order.customerName ?: "Shopper"}",
                    style = MaterialTheme.typography.bodySmall,
                    color = SecondaryText
                )
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(statusBg)
                    .padding(horizontal = 10.dp, vertical = 4.dp)
            ) {
                Text(
                    text = order.status.replace("_", " ").uppercase(),
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    color = statusColor
                )
            }
        }

        Divider(color = Border, thickness = 0.5.dp)

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
                    color = PrimaryText
                )
                Text(
                    text = "₹${(item.price * item.quantity).toInt()}",
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = PrimaryText
                )
            }
        }

        Divider(color = Border, thickness = 0.5.dp)

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Total: ₹${order.totalAmount.toInt()}",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = PrimaryGreen
            )

            // Status action buttons
            when (order.status.uppercase()) {
                "PENDING" -> {
                    Button(
                        onClick = { onUpdateStatus("ACCEPTED") },
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
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
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
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
