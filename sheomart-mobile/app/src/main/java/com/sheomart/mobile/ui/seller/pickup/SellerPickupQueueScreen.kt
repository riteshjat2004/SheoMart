package com.sheomart.mobile.ui.seller.pickup

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
import androidx.compose.ui.window.Dialog
import com.sheomart.mobile.data.model.PickupOrderRecord
import com.sheomart.mobile.ui.components.PrimaryButton
import com.sheomart.mobile.ui.components.SectionEmptyView
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.components.StatusBadge
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SellerPickupQueueScreen(
    viewModel: SellerPickupQueueViewModel,
    onBack: () -> Unit
) {
    val colorScheme = MaterialTheme.colorScheme

    val state by viewModel.ordersState.collectAsState()
    val selectedTab by viewModel.selectedTab.collectAsState()
    val actionMsg by viewModel.actionMessage.collectAsState()

    var paymentTargetOrder by remember { mutableStateOf<PickupOrderRecord?>(null) }
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(actionMsg) {
        actionMsg?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearActionMessage()
        }
    }

    // Payment Collection Dialog for Unpaid Pickups
    if (paymentTargetOrder != null) {
        val order = paymentTargetOrder!!
        var chosenMethod by remember { mutableStateOf("CASH") }

        Dialog(onDismissRequest = { paymentTargetOrder = null }) {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = colorScheme.surface,
                modifier = Modifier.fillMaxWidth().padding(12.dp)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Text(
                        text = "Collect Payment & Handover",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = colorScheme.onSurface
                    )
                    Text(
                        text = "Order #${order.orderId.takeLast(6).uppercase()} • Total Due: ₹${order.totalAmount.toInt()}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = colorScheme.primary
                    )

                    Text("Received Payment via:", style = MaterialTheme.typography.labelSmall, color = colorScheme.onSurfaceVariant)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf("CASH", "UPI").forEach { method ->
                            val isSelected = chosenMethod == method
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (isSelected) colorScheme.primary else colorScheme.surfaceContainerHighest)
                                    .clickable { chosenMethod = method }
                                    .padding(vertical = 10.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = method,
                                    style = MaterialTheme.typography.labelMedium.copy(
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                    ),
                                    color = if (isSelected) colorScheme.onPrimary else colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TextButton(onClick = { paymentTargetOrder = null }) {
                            Text("Cancel", color = colorScheme.onSurfaceVariant)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        PrimaryButton(
                            text = "Record & Handover",
                            onClick = {
                                val target = paymentTargetOrder
                                paymentTargetOrder = null
                                if (target != null) {
                                    viewModel.collectPaymentAndHandover(target.orderId, chosenMethod)
                                }
                            },
                            modifier = Modifier.width(170.dp)
                        )
                    }
                }
            }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Pickup Orders Queue",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = colorScheme.onSurface
                        )
                        Text(
                            text = "Store Pickup & Self-Collect Fulfillment",
                            style = MaterialTheme.typography.bodySmall,
                            color = colorScheme.onSurfaceVariant
                        )
                    }
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
                listOf("All", "Preparing", "Ready", "Collected").forEachIndexed { index, label ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { viewModel.selectTab(index) },
                        text = {
                            Text(
                                text = label,
                                fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal,
                                color = if (selectedTab == index) colorScheme.primary else colorScheme.onSurfaceVariant
                            )
                        }
                    )
                }
            }

            Box(modifier = Modifier.fillMaxSize()) {
                when (val res = state) {
                    is UiState.Loading -> {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(color = colorScheme.primary)
                        }
                    }
                    is UiState.Error -> {
                        Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                            SectionErrorView(message = res.message, onRetry = { viewModel.loadPickupOrders() })
                        }
                    }
                    is UiState.Empty -> {
                        Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                            SectionEmptyView(title = "No pickup orders", description = "Online pickup customer orders will show here in real-time.")
                        }
                    }
                    is UiState.Success -> {
                        val filtered = res.data.filter { order ->
                            val s = order.status.uppercase()
                            when (selectedTab) {
                                1 -> s in listOf("ACCEPTED", "PREPARING", "PENDING")
                                2 -> s in listOf("READY_FOR_PICKUP", "PACKED", "READY")
                                3 -> s in listOf("DELIVERED", "PICKED_UP", "COMPLETED")
                                else -> true
                            }
                        }

                        if (filtered.isEmpty()) {
                            Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                                SectionEmptyView(
                                    title = "Queue is clear",
                                    description = "No pickup orders matching this filter."
                                )
                            }
                        } else {
                            LazyColumn(
                                modifier = Modifier.fillMaxSize(),
                                contentPadding = PaddingValues(16.dp),
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                items(filtered, key = { it.orderId }) { order ->
                                    PickupOrderCard(
                                        order = order,
                                        onMarkReady = { viewModel.markReadyForPickup(order.orderId) },
                                        onHandover = {
                                            if (order.paymentStatus.uppercase() == "PAID") {
                                                viewModel.completeHandover(order.orderId)
                                            } else {
                                                paymentTargetOrder = order
                                            }
                                        }
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
private fun PickupOrderCard(
    order: PickupOrderRecord,
    onMarkReady: () -> Unit,
    onHandover: () -> Unit
) {
    val colorScheme = MaterialTheme.colorScheme
    val isReady = order.status.uppercase() in listOf("READY_FOR_PICKUP", "PACKED", "READY")
    val isCompleted = order.status.uppercase() in listOf("DELIVERED", "PICKED_UP", "COMPLETED")

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
                    text = "Pickup #${order.orderId.takeLast(6).uppercase()}",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = colorScheme.onSurface
                )
                Text(
                    text = "Customer: ${order.customerName}",
                    style = MaterialTheme.typography.bodySmall,
                    color = colorScheme.onSurfaceVariant
                )
            }

            StatusBadge(text = order.status)
        }

        if (!order.pickupSlot.isNullOrBlank()) {
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(colorScheme.surfaceContainerHighest)
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("⏰", fontSize = 12.sp)
                    Text(
                        text = "Slot: ${order.pickupSlot}",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = colorScheme.primary
                    )
                }
            }
        }

        HorizontalDivider(color = colorScheme.outlineVariant.copy(alpha = 0.5f), thickness = 0.5.dp)

        // Items list preview
        order.items.forEach { itm ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${itm.quantity}x ${itm.name}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = colorScheme.onSurface
                )
                Text(
                    text = "₹${(itm.price * itm.quantity).toInt()}",
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = colorScheme.onSurface
                )
            }
        }

        HorizontalDivider(color = colorScheme.outlineVariant.copy(alpha = 0.5f), thickness = 0.5.dp)

        // Footer & Actions
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Total: ₹${order.totalAmount.toInt()}",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = colorScheme.primary
                )
                Text(
                    text = "Payment: ${order.paymentStatus.uppercase()} (${order.paymentMethod})",
                    style = MaterialTheme.typography.labelSmall,
                    color = if (order.paymentStatus.uppercase() == "PAID") colorScheme.primary else colorScheme.error
                )
            }

            if (!isCompleted) {
                if (!isReady) {
                    Button(
                        onClick = onMarkReady,
                        colors = ButtonDefaults.buttonColors(containerColor = colorScheme.primary),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text("Mark Ready", fontSize = 12.sp)
                    }
                } else {
                    Button(
                        onClick = onHandover,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (order.paymentStatus.uppercase() == "PAID") colorScheme.primary else Color(0xFFD97706)
                        ),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = if (order.paymentStatus.uppercase() == "PAID") "Hand Over" else "Collect & Handover",
                            fontSize = 12.sp
                        )
                    }
                }
            } else {
                Text("✓ Handed Over", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold), color = colorScheme.primary)
            }
        }
    }
}
