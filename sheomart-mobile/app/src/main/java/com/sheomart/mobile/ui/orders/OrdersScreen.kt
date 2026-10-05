package com.sheomart.mobile.ui.orders

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.data.model.CustomerOrder
import com.sheomart.mobile.ui.components.AsyncImageLoader
import com.sheomart.mobile.ui.components.SectionEmptyView
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.components.StatusBadge
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdersScreen(
    viewModel: OrdersViewModel,
    onBack: () -> Unit
) {
    val colorScheme = MaterialTheme.colorScheme

    val state by viewModel.ordersState.collectAsState()
    val selectedTab by viewModel.selectedTab.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.loadOrders()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "My Orders",
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
            // Tab Selector
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = colorScheme.surface,
                contentColor = colorScheme.primary,
                indicator = { tabPositions ->
                    TabRowDefaults.SecondaryIndicator(
                        Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                        color = colorScheme.primary
                    )
                }
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
                            text = "Active",
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
                            text = "Completed",
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
                                title = "No orders found",
                                description = "Your placed orders and delivery timelines will appear here."
                            )
                        }
                    }
                    is UiState.Success -> {
                        val filteredOrders = res.data.filter { order ->
                            when (selectedTab) {
                                1 -> order.isActiveOrder
                                2 -> !order.isActiveOrder
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
                                    title = if (selectedTab == 1) "No active orders" else "No orders found",
                                    description = if (selectedTab == 1) "You don't have any ongoing or dispatched orders." else "Your past order history will appear here."
                                )
                            }
                        } else {
                            LazyColumn(
                                modifier = Modifier.fillMaxSize(),
                                contentPadding = PaddingValues(16.dp),
                                verticalArrangement = Arrangement.spacedBy(14.dp)
                            ) {
                                items(filteredOrders, key = { it.orderId }) { order ->
                                    CustomerOrderCard(order = order)
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
private fun CustomerOrderCard(order: CustomerOrder) {
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
        // Header
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
                    text = order.storeName,
                    style = MaterialTheme.typography.bodySmall,
                    color = colorScheme.onSurfaceVariant
                )
            }

            StatusBadge(text = order.status)
        }

        HorizontalDivider(color = colorScheme.outlineVariant.copy(alpha = 0.5f), thickness = 0.5.dp)

        // Order Progress Tracker (visual step indicator for active orders)
        if (order.isActiveOrder) {
            OrderTimelineIndicator(status = order.status)
            HorizontalDivider(color = colorScheme.outlineVariant.copy(alpha = 0.5f), thickness = 0.5.dp)
        }

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

        // Footer
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Payment: ${order.paymentMethod} • ${order.paymentStatus.replace("_", " ").uppercase()}",
                    style = MaterialTheme.typography.bodySmall,
                    color = colorScheme.onSurfaceVariant
                )
                if (!order.estimatedDeliveryEta.isNullOrBlank()) {
                    Text(
                        text = "ETA: ${order.estimatedDeliveryEta}",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                        color = colorScheme.primary
                    )
                }
            }

            Text(
                text = "Total: ₹${order.totalAmount.toInt()}",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = colorScheme.primary
            )
        }
    }
}

@Composable
private fun OrderTimelineIndicator(status: String) {
    val colorScheme = MaterialTheme.colorScheme
    val normalizedStatus = status.lowercase().trim()

    val currentStep = when {
        normalizedStatus in listOf("pending", "draft", "created") -> 0
        normalizedStatus in listOf("confirmed", "accepted", "preparing", "processing") -> 1
        normalizedStatus in listOf("packed", "ready_for_pickup", "ready") -> 2
        normalizedStatus in listOf("dispatched", "out_for_delivery") -> 3
        normalizedStatus in listOf("delivered", "completed") -> 4
        else -> 1
    }

    val steps = listOf("Placed", "Confirmed", "Packed", "On Way")

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        steps.forEachIndexed { index, stepName ->
            val isDone = index <= currentStep
            val isCurrent = index == currentStep

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(18.dp)
                        .clip(CircleShape)
                        .background(
                            if (isDone) colorScheme.primary
                            else colorScheme.surfaceContainerHighest
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    if (isDone) {
                        Text("✓", fontSize = 10.sp, color = colorScheme.onPrimary, fontWeight = FontWeight.Bold)
                    } else {
                        Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(colorScheme.onSurfaceVariant.copy(alpha = 0.4f)))
                    }
                }
                Text(
                    text = stepName,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 10.sp,
                        fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.Normal
                    ),
                    color = if (isDone) colorScheme.primary else colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                )
            }
        }
    }
}
