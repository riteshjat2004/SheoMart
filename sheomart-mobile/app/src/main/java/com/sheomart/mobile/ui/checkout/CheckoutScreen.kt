package com.sheomart.mobile.ui.checkout

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.data.model.AddressItem
import com.sheomart.mobile.data.model.CartData
import com.sheomart.mobile.ui.components.PrimaryButton
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutScreen(
    viewModel: CheckoutViewModel,
    onBack: () -> Unit,
    onManageAddresses: () -> Unit,
    onOrderSuccess: (String) -> Unit
) {
    val colorScheme = MaterialTheme.colorScheme

    val cartState by viewModel.cartState.collectAsState()
    val addressesState by viewModel.addressesState.collectAsState()
    val selectedAddress by viewModel.selectedAddress.collectAsState()
    val deliveryMethod by viewModel.deliveryMethod.collectAsState()
    val pickupDay by viewModel.pickupDay.collectAsState()
    val selectedPickupSlot by viewModel.selectedPickupSlot.collectAsState()
    val deliveryDay by viewModel.deliveryDay.collectAsState()
    val selectedDeliverySlot by viewModel.selectedDeliverySlot.collectAsState()
    val paymentMethod by viewModel.paymentMethod.collectAsState()
    val couponCode by viewModel.couponCode.collectAsState()
    val orderPlacementState by viewModel.orderPlacementState.collectAsState()

    // Local active day tab for pickup slot picker view
    var activePickupTab by remember(pickupDay) { mutableStateOf(pickupDay) }
    var activeDeliveryTab by remember(deliveryDay) { mutableStateOf(deliveryDay) }

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(orderPlacementState) {
        if (orderPlacementState is UiState.Error) {
            snackbarHostState.showSnackbar((orderPlacementState as UiState.Error).message)
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Checkout",
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
        bottomBar = {
            if (cartState is UiState.Success) {
                val cart = (cartState as UiState.Success<CartData>).data
                val isPickup = deliveryMethod == "pickup"
                val effectiveDeliveryFee = if (isPickup) 0.0 else cart.deliveryFee
                val effectiveTotal = (cart.subtotal + effectiveDeliveryFee + cart.platformFee - cart.discountAmount).coerceAtLeast(0.0)

                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = colorScheme.surface,
                    shadowElevation = 10.dp
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 20.dp, vertical = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = if (isPickup) "Pickup Total" else "Total Payable",
                                style = MaterialTheme.typography.bodySmall,
                                color = colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = "₹${effectiveTotal.toInt()}",
                                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold),
                                color = colorScheme.primary
                            )
                        }

                        PrimaryButton(
                            text = if (orderPlacementState is UiState.Loading) {
                                "Placing Order..."
                            } else {
                                "Place Order • ₹${effectiveTotal.toInt()}"
                            },
                            onClick = { viewModel.placeOrder(onOrderSuccess) },
                            modifier = Modifier.width(220.dp),
                            enabled = orderPlacementState !is UiState.Loading && cart.items.isNotEmpty()
                        )
                    }
                }
            }
        },
        containerColor = colorScheme.background
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when (val state = cartState) {
                is UiState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = colorScheme.primary)
                    }
                }
                is UiState.Error -> {
                    Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                        SectionErrorView(
                            message = state.message,
                            onRetry = { viewModel.loadCheckoutData() }
                        )
                    }
                }
                UiState.Empty -> {
                    Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                        Text("Your basket is empty", color = colorScheme.onSurfaceVariant)
                    }
                }
                is UiState.Success -> {
                    val cart = state.data
                    val addresses = (addressesState as? UiState.Success)?.data ?: emptyList()
                    val isPickup = deliveryMethod == "pickup"

                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .verticalScroll(rememberScrollState())
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        // ── 1. Delivery Mode Segmented Switcher ───────────────
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(16.dp))
                                .background(colorScheme.surface)
                                .border(1.dp, colorScheme.outlineVariant, RoundedCornerShape(16.dp))
                                .padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Text(
                                text = "Fulfillment Method",
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                color = colorScheme.onSurface
                            )

                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(colorScheme.surfaceContainerHighest)
                                    .padding(4.dp),
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                // Home Delivery Tab
                                val isDeliverySelected = deliveryMethod == "delivery"
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(if (isDeliverySelected) colorScheme.surface else Color.Transparent)
                                        .clickable { viewModel.setDeliveryMethod("delivery") }
                                        .padding(vertical = 10.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Text("🚚", fontSize = 16.sp)
                                        Text(
                                            text = "Home Delivery",
                                            style = MaterialTheme.typography.labelMedium.copy(
                                                fontWeight = if (isDeliverySelected) FontWeight.Bold else FontWeight.Medium
                                            ),
                                            color = if (isDeliverySelected) colorScheme.onSurface else colorScheme.onSurfaceVariant
                                        )
                                    }
                                }

                                // Store Pickup Tab
                                val isPickupSelected = deliveryMethod == "pickup"
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(if (isPickupSelected) colorScheme.surface else Color.Transparent)
                                        .clickable { viewModel.setDeliveryMethod("pickup") }
                                        .padding(vertical = 10.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Text("🛍️", fontSize = 16.sp)
                                        Text(
                                            text = "Store Pickup",
                                            style = MaterialTheme.typography.labelMedium.copy(
                                                fontWeight = if (isPickupSelected) FontWeight.Bold else FontWeight.Medium
                                            ),
                                            color = if (isPickupSelected) colorScheme.onSurface else colorScheme.onSurfaceVariant
                                        )
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(4.dp))
                                                .background(colorScheme.primary.copy(alpha = 0.15f))
                                                .padding(horizontal = 4.dp, vertical = 1.dp)
                                        ) {
                                            Text(
                                                text = "FREE",
                                                style = MaterialTheme.typography.labelSmall.copy(
                                                    fontWeight = FontWeight.Bold,
                                                    fontSize = 9.sp,
                                                    color = colorScheme.primary
                                                )
                                            )
                                        }
                                    }
                                }
                            }
                        }

                        // ── 2A. If Delivery: Address Selector Card ─────────────
                        if (!isPickup) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(colorScheme.surface)
                                    .border(1.dp, colorScheme.outlineVariant, RoundedCornerShape(16.dp))
                                    .padding(16.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "Delivery Address",
                                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                        color = colorScheme.onSurface
                                    )
                                    Text(
                                        text = "Change",
                                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                                        color = colorScheme.primary,
                                        modifier = Modifier.clickable(onClick = onManageAddresses)
                                    )
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                if (selectedAddress != null) {
                                    val addr = selectedAddress!!
                                    Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                        Text("📍", fontSize = 18.sp)
                                        Column {
                                            Text(
                                                text = "${addr.title} - ${addr.receiverName ?: "Customer"}",
                                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                                                color = colorScheme.onSurface
                                            )
                                            Text(
                                                text = "${addr.addressLine}, ${addr.city}, ${addr.pincode}",
                                                style = MaterialTheme.typography.bodySmall,
                                                color = colorScheme.onSurfaceVariant
                                            )
                                            if (!addr.receiverMobile.isNullOrBlank()) {
                                                Text(
                                                    text = "Phone: ${addr.receiverMobile}",
                                                    style = MaterialTheme.typography.bodySmall,
                                                    color = colorScheme.onSurfaceVariant
                                                )
                                            }
                                        }
                                    }
                                } else if (addresses.isNotEmpty()) {
                                    Text(
                                        text = "Select an address below:",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = colorScheme.onSurfaceVariant
                                    )
                                    addresses.forEach { addr ->
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(vertical = 4.dp)
                                                .clickable { viewModel.selectAddress(addr) },
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            RadioButton(
                                                selected = selectedAddress?.addressId == addr.addressId,
                                                onClick = { viewModel.selectAddress(addr) },
                                                colors = RadioButtonDefaults.colors(selectedColor = colorScheme.primary)
                                            )
                                            Text(
                                                text = "${addr.title}: ${addr.addressLine}",
                                                style = MaterialTheme.typography.bodySmall,
                                                color = colorScheme.onSurface
                                            )
                                        }
                                    }
                                } else {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clickable(onClick = onManageAddresses)
                                            .padding(vertical = 8.dp),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text("➕", color = colorScheme.primary)
                                        Text(
                                            text = "Add delivery address to continue",
                                            style = MaterialTheme.typography.labelMedium,
                                            color = colorScheme.primary
                                        )
                                    }
                                }
                            }

                            // Delivery Slot Picker Card
                            val deliverySlots = viewModel.getDeliverySlotsForDay(activeDeliveryTab)
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
                                    Text(
                                        text = "Delivery Time Slot",
                                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                        color = colorScheme.onSurface
                                    )

                                    // Day Tabs (Today / Tomorrow)
                                    Row(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(colorScheme.surfaceContainerHighest)
                                            .padding(2.dp)
                                    ) {
                                        listOf("Today", "Tomorrow").forEach { day ->
                                            val isTabSelected = activeDeliveryTab == day
                                            Box(
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(6.dp))
                                                    .background(if (isTabSelected) colorScheme.surface else Color.Transparent)
                                                    .clickable {
                                                        activeDeliveryTab = day
                                                        viewModel.setDeliveryDay(day)
                                                    }
                                                    .padding(horizontal = 10.dp, vertical = 4.dp)
                                            ) {
                                                Text(
                                                    text = day,
                                                    style = MaterialTheme.typography.labelSmall.copy(
                                                        fontWeight = if (isTabSelected) FontWeight.Bold else FontWeight.Medium
                                                    ),
                                                    color = if (isTabSelected) colorScheme.onSurface else colorScheme.onSurfaceVariant
                                                )
                                            }
                                        }
                                    }
                                }

                                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                    deliverySlots.forEach { slot ->
                                        // A slot is selected ONLY if the active tab matches deliveryDay AND slot.label matches selectedDeliverySlot
                                        val isSelected = deliveryDay == activeDeliveryTab && selectedDeliverySlot == slot.label
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .clip(RoundedCornerShape(10.dp))
                                                .background(
                                                    if (isSelected) colorScheme.primary.copy(alpha = 0.1f)
                                                    else colorScheme.surfaceContainerHighest.copy(alpha = 0.5f)
                                                )
                                                .border(
                                                    1.dp,
                                                    if (isSelected) colorScheme.primary else Color.Transparent,
                                                    RoundedCornerShape(10.dp)
                                                )
                                                .clickable(enabled = !slot.isPast) {
                                                    viewModel.setDeliverySlot(slot.label, activeDeliveryTab)
                                                }
                                                .padding(horizontal = 12.dp, vertical = 10.dp),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Row(
                                                verticalAlignment = Alignment.CenterVertically,
                                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                                            ) {
                                                Text("🕒", fontSize = 14.sp)
                                                Text(
                                                    text = slot.label,
                                                    style = MaterialTheme.typography.bodySmall.copy(
                                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                                    ),
                                                    color = if (slot.isPast) colorScheme.onSurfaceVariant.copy(alpha = 0.4f)
                                                    else colorScheme.onSurface
                                                )
                                            }
                                            if (slot.isPast) {
                                                Text(
                                                    text = "Past",
                                                    style = MaterialTheme.typography.labelSmall,
                                                    color = colorScheme.onSurfaceVariant.copy(alpha = 0.4f)
                                                )
                                            } else if (isSelected) {
                                                Text(
                                                    text = "✓ Selected",
                                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                                    color = colorScheme.primary
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // ── 2B. If Store Pickup: Pickup Location & Slot Picker ──
                        if (isPickup) {
                            // Store Location Details Card
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(colorScheme.surface)
                                    .border(1.dp, colorScheme.outlineVariant, RoundedCornerShape(16.dp))
                                    .padding(16.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "Store Pickup Location",
                                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                        color = colorScheme.onSurface
                                    )
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(colorScheme.primary.copy(alpha = 0.12f))
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = "Ready in ~15 mins",
                                            style = MaterialTheme.typography.labelSmall.copy(
                                                fontWeight = FontWeight.Bold,
                                                color = colorScheme.primary,
                                                fontSize = 10.sp
                                            )
                                        )
                                    }
                                }

                                Row(
                                    verticalAlignment = Alignment.Top,
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    Text("🏪", fontSize = 20.sp)
                                    Column {
                                        Text(
                                            text = "SheoMart Local Fulfillment Hub",
                                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                                            color = colorScheme.onSurface
                                        )
                                        Text(
                                            text = "Main Market Road, Near Gandhi Chowk, Sheopur (M.P.) - 476337",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = colorScheme.onSurfaceVariant
                                        )
                                        Text(
                                            text = "Timings: 09:00 AM - 09:00 PM (Daily)",
                                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp),
                                            color = colorScheme.primary
                                        )
                                    }
                                }
                            }

                            // Pickup Slots Picker Card
                            val pickupSlots = viewModel.getPickupSlotsForDay(activePickupTab)
                            val availableCount = pickupSlots.count { !it.isPast }
                            val isTodayClosed = activePickupTab == "Today" && availableCount == 0

                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(colorScheme.surface)
                                    .border(1.dp, colorScheme.outlineVariant, RoundedCornerShape(16.dp))
                                    .padding(16.dp),
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            text = "Select Pickup Time Slot",
                                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                            color = colorScheme.onSurface
                                        )
                                        Text(
                                            text = if (isTodayClosed) "Store closed for today's pickup" else "$availableCount slots available",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = if (isTodayClosed) MaterialTheme.colorScheme.error else colorScheme.onSurfaceVariant
                                        )
                                    }

                                    // Day Tabs (Today / Tomorrow)
                                    Row(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(colorScheme.surfaceContainerHighest)
                                            .padding(2.dp)
                                    ) {
                                        listOf("Today", "Tomorrow").forEach { day ->
                                            val isTabSelected = activePickupTab == day
                                            Box(
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(6.dp))
                                                    .background(if (isTabSelected) colorScheme.surface else Color.Transparent)
                                                    .clickable {
                                                        activePickupTab = day
                                                        viewModel.setPickupDay(day)
                                                    }
                                                    .padding(horizontal = 10.dp, vertical = 4.dp)
                                            ) {
                                                Text(
                                                    text = day,
                                                    style = MaterialTheme.typography.labelSmall.copy(
                                                        fontWeight = if (isTabSelected) FontWeight.Bold else FontWeight.Medium
                                                    ),
                                                    color = if (isTabSelected) colorScheme.onSurface else colorScheme.onSurfaceVariant
                                                )
                                            }
                                        }
                                    }
                                }

                                if (isTodayClosed) {
                                    // Notice to switch to tomorrow
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(Color(0xFFFEF3C7))
                                            .padding(12.dp)
                                    ) {
                                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                            Text(
                                                text = "Today's pickup hours have passed",
                                                style = MaterialTheme.typography.labelMedium.copy(
                                                    fontWeight = FontWeight.Bold,
                                                    color = Color(0xFF92400E)
                                                )
                                            )
                                            Text(
                                                text = "Please choose a slot for Tomorrow to reserve your pickup order.",
                                                style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                                                color = Color(0xFFB45309)
                                            )
                                            Button(
                                                onClick = {
                                                    activePickupTab = "Tomorrow"
                                                    viewModel.setPickupDay("Tomorrow")
                                                },
                                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD97706)),
                                                shape = RoundedCornerShape(8.dp),
                                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                                                modifier = Modifier.height(32.dp)
                                            ) {
                                                Text("View Tomorrow's Slots", style = MaterialTheme.typography.labelSmall.copy(color = Color.White))
                                            }
                                        }
                                    }
                                } else {
                                    // Responsive Slots Grid
                                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                        pickupSlots.chunked(2).forEach { rowSlots ->
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                                            ) {
                                                rowSlots.forEach { slot ->
                                                    // MUTUALLY EXCLUSIVE BUG FIX:
                                                    // Slot is selected ONLY if the active tab matches pickupDay AND slot.label matches selectedPickupSlot
                                                    val isSelected = pickupDay == activePickupTab && selectedPickupSlot == slot.label

                                                    Box(
                                                        modifier = Modifier
                                                            .weight(1f)
                                                            .clip(RoundedCornerShape(10.dp))
                                                            .background(
                                                                if (isSelected) colorScheme.primary.copy(alpha = 0.12f)
                                                                else colorScheme.surfaceContainerHighest.copy(alpha = 0.5f)
                                                            )
                                                            .border(
                                                                1.dp,
                                                                if (isSelected) colorScheme.primary else colorScheme.outlineVariant.copy(alpha = 0.5f),
                                                                RoundedCornerShape(10.dp)
                                                            )
                                                            .clickable(enabled = !slot.isPast) {
                                                                viewModel.setPickupSlot(slot.label, activePickupTab)
                                                            }
                                                            .padding(horizontal = 10.dp, vertical = 8.dp)
                                                    ) {
                                                        Column {
                                                            Text(
                                                                text = slot.label,
                                                                style = MaterialTheme.typography.labelSmall.copy(
                                                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                                                ),
                                                                color = if (slot.isPast) colorScheme.onSurfaceVariant.copy(alpha = 0.35f)
                                                                else if (isSelected) colorScheme.primary
                                                                else colorScheme.onSurface
                                                            )
                                                            Text(
                                                                text = if (slot.isPast) "Passed" else if (isSelected) "✓ Chosen" else "$activePickupTab",
                                                                style = MaterialTheme.typography.labelSmall.copy(
                                                                    fontSize = 9.sp,
                                                                    color = if (isSelected) colorScheme.primary else colorScheme.onSurfaceVariant
                                                                )
                                                            )
                                                        }
                                                    }
                                                }
                                                if (rowSlots.size == 1) {
                                                    Spacer(modifier = Modifier.weight(1f))
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // ── 3. Payment Method Card ───────────────────────────
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(16.dp))
                                .background(colorScheme.surface)
                                .border(1.dp, colorScheme.outlineVariant, RoundedCornerShape(16.dp))
                                .padding(16.dp)
                        ) {
                            Text(
                                text = "Payment Method",
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                color = colorScheme.onSurface
                            )
                            Spacer(modifier = Modifier.height(8.dp))

                            // Cash / Pay-at Option
                            val payAtLabel = if (isPickup) "Pay at Store Counter (Cash / UPI)" else "Cash on Delivery (COD)"
                            val payAtDesc = if (isPickup) "Pay when picking up your packaged order" else "Pay cash or UPI at the time of doorstep delivery"

                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(if (paymentMethod == "COD") colorScheme.surfaceContainerHighest else Color.Transparent)
                                    .clickable { viewModel.setPaymentMethod("COD") }
                                    .padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                RadioButton(
                                    selected = paymentMethod == "COD",
                                    onClick = { viewModel.setPaymentMethod("COD") },
                                    colors = RadioButtonDefaults.colors(selectedColor = colorScheme.primary)
                                )
                                Column {
                                    Text(
                                        text = payAtLabel,
                                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                                        color = colorScheme.onSurface
                                    )
                                    Text(
                                        text = payAtDesc,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = colorScheme.onSurfaceVariant
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(6.dp))

                            // Online Option
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(if (paymentMethod == "ONLINE") colorScheme.surfaceContainerHighest else Color.Transparent)
                                    .clickable { viewModel.setPaymentMethod("ONLINE") }
                                    .padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                RadioButton(
                                    selected = paymentMethod == "ONLINE",
                                    onClick = { viewModel.setPaymentMethod("ONLINE") },
                                    colors = RadioButtonDefaults.colors(selectedColor = colorScheme.primary)
                                )
                                Column {
                                    Text(
                                        text = "Online Payment (Instant)",
                                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                                        color = colorScheme.onSurface
                                    )
                                    Text(
                                        text = "Pay via UPI, Cards, NetBanking directly",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }

                        // ── 4. Coupon Voucher Entry ──────────────────────────
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(16.dp))
                                .background(colorScheme.surface)
                                .border(1.dp, colorScheme.outlineVariant, RoundedCornerShape(16.dp))
                                .padding(horizontal = 16.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Text("🏷️", fontSize = 18.sp)
                            TextField(
                                value = couponCode,
                                onValueChange = { viewModel.setCouponCode(it.uppercase()) },
                                placeholder = {
                                    Text(
                                        "Enter Promo / Coupon Code",
                                        fontSize = 13.sp,
                                        color = colorScheme.onSurfaceVariant
                                    )
                                },
                                singleLine = true,
                                colors = TextFieldDefaults.colors(
                                    focusedContainerColor = Color.Transparent,
                                    unfocusedContainerColor = Color.Transparent,
                                    focusedIndicatorColor = Color.Transparent,
                                    unfocusedIndicatorColor = Color.Transparent,
                                    focusedTextColor = colorScheme.onSurface,
                                    unfocusedTextColor = colorScheme.onSurface
                                ),
                                modifier = Modifier.weight(1f)
                            )
                            if (couponCode.isNotBlank()) {
                                Text(
                                    text = "Applied",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                    color = colorScheme.primary
                                )
                            }
                        }

                        // ── 5. Order Summary Breakdown Card ──────────────────
                        val effectiveDeliveryFee = if (isPickup) 0.0 else cart.deliveryFee
                        val effectiveTotal = (cart.subtotal + effectiveDeliveryFee + cart.platformFee - cart.discountAmount).coerceAtLeast(0.0)

                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(16.dp))
                                .background(colorScheme.surface)
                                .border(1.dp, colorScheme.outlineVariant, RoundedCornerShape(16.dp))
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text(
                                text = "Order Breakdown (${cart.items.size} items)",
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                color = colorScheme.onSurface
                            )

                            HorizontalDivider(color = colorScheme.outlineVariant.copy(alpha = 0.5f), thickness = 0.5.dp, modifier = Modifier.padding(vertical = 4.dp))

                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Items Subtotal", style = MaterialTheme.typography.bodyMedium, color = colorScheme.onSurfaceVariant)
                                Text("₹${cart.subtotal.toInt()}", style = MaterialTheme.typography.bodyMedium, color = colorScheme.onSurface)
                            }

                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Delivery Charges", style = MaterialTheme.typography.bodyMedium, color = colorScheme.onSurfaceVariant)
                                if (isPickup) {
                                    Text("FREE (STORE PICKUP)", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold), color = colorScheme.primary)
                                } else if (cart.deliveryFee == 0.0) {
                                    Text("FREE", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold), color = colorScheme.primary)
                                } else {
                                    Text("₹${cart.deliveryFee.toInt()}", style = MaterialTheme.typography.bodyMedium, color = colorScheme.onSurface)
                                }
                            }

                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Platform Convenience Fee", style = MaterialTheme.typography.bodyMedium, color = colorScheme.onSurfaceVariant)
                                Text("₹${cart.platformFee.toInt()}", style = MaterialTheme.typography.bodyMedium, color = colorScheme.onSurface)
                            }

                            if (cart.discountAmount > 0) {
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("Coupon Savings", style = MaterialTheme.typography.bodyMedium, color = colorScheme.primary)
                                    Text("-₹${cart.discountAmount.toInt()}", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold), color = colorScheme.primary)
                                }
                            }

                            HorizontalDivider(color = colorScheme.outlineVariant.copy(alpha = 0.5f), thickness = 0.5.dp, modifier = Modifier.padding(vertical = 4.dp))

                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Grand Total", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold), color = colorScheme.onSurface)
                                Text(
                                    text = "₹${effectiveTotal.toInt()}",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.ExtraBold),
                                    color = colorScheme.primary
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(20.dp))
                    }
                }
            }
        }
    }
}
