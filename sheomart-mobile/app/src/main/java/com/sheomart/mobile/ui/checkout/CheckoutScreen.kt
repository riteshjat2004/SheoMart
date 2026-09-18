package com.sheomart.mobile.ui.checkout

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
    val cartState by viewModel.cartState.collectAsState()
    val addressesState by viewModel.addressesState.collectAsState()
    val selectedAddress by viewModel.selectedAddress.collectAsState()
    val paymentMethod by viewModel.paymentMethod.collectAsState()
    val couponCode by viewModel.couponCode.collectAsState()
    val orderPlacementState by viewModel.orderPlacementState.collectAsState()

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
                title = { Text("Checkout", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Text("←", fontSize = 20.sp, color = PrimaryGreen)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        bottomBar = {
            if (cartState is UiState.Success) {
                val cart = (cartState as UiState.Success<CartData>).data
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
                            Text("Total Payable", style = MaterialTheme.typography.bodySmall, color = SecondaryText)
                            Text(
                                text = "₹${cart.totalAmount.toInt()}",
                                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold),
                                color = PrimaryGreen
                            )
                        }

                        PrimaryButton(
                            text = if (orderPlacementState is UiState.Loading) "Placing Order..." else "Place Order • ₹${cart.totalAmount.toInt()}",
                            onClick = { viewModel.placeOrder(onOrderSuccess) },
                            modifier = Modifier.width(220.dp),
                            enabled = orderPlacementState !is UiState.Loading && cart.items.isNotEmpty()
                        )
                    }
                }
            }
        },
        containerColor = Background
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            if (cartState is UiState.Loading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = PrimaryGreen)
                }
            } else if (cartState is UiState.Error) {
                Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                    SectionErrorView(
                        message = (cartState as UiState.Error).message,
                        onRetry = { viewModel.loadCheckoutData() }
                    )
                }
            } else if (cartState is UiState.Success) {
                val cart = (cartState as UiState.Success<CartData>).data
                val addresses = (addressesState as? UiState.Success)?.data ?: emptyList()

                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // 1. Delivery Address Card
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(Color.White)
                            .border(1.dp, Border, RoundedCornerShape(16.dp))
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
                                color = PrimaryText
                            )
                            Text(
                                text = "Change",
                                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                                color = PrimaryGreen,
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
                                        color = PrimaryText
                                    )
                                    Text(
                                        text = "${addr.addressLine}, ${addr.city}, ${addr.pincode}",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = SecondaryText
                                    )
                                    if (!addr.receiverMobile.isNullOrBlank()) {
                                        Text(
                                            text = "Phone: ${addr.receiverMobile}",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = SecondaryText
                                        )
                                    }
                                }
                            }
                        } else if (addresses.isNotEmpty()) {
                            Text(
                                text = "Select an address below:",
                                style = MaterialTheme.typography.bodySmall,
                                color = SecondaryText
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
                                        colors = RadioButtonDefaults.colors(selectedColor = PrimaryGreen)
                                    )
                                    Text(text = "${addr.title}: ${addr.addressLine}", style = MaterialTheme.typography.bodySmall)
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
                                Text("➕", color = PrimaryGreen)
                                Text("Add delivery address to continue", style = MaterialTheme.typography.labelMedium, color = PrimaryGreen)
                            }
                        }
                    }

                    // 2. Payment Method Card
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(Color.White)
                            .border(1.dp, Border, RoundedCornerShape(16.dp))
                            .padding(16.dp)
                    ) {
                        Text(
                            text = "Payment Method",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = PrimaryText
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        // COD Option
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (paymentMethod == "COD") Surface else Color.Transparent)
                                .clickable { viewModel.setPaymentMethod("COD") }
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            RadioButton(
                                selected = paymentMethod == "COD",
                                onClick = { viewModel.setPaymentMethod("COD") },
                                colors = RadioButtonDefaults.colors(selectedColor = PrimaryGreen)
                            )
                            Column {
                                Text("Cash on Delivery (COD)", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold), color = PrimaryText)
                                Text("Pay cash or UPI at the time of doorstep delivery", style = MaterialTheme.typography.bodySmall, color = SecondaryText)
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        // Online Option
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (paymentMethod == "ONLINE") Surface else Color.Transparent)
                                .clickable { viewModel.setPaymentMethod("ONLINE") }
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            RadioButton(
                                selected = paymentMethod == "ONLINE",
                                onClick = { viewModel.setPaymentMethod("ONLINE") },
                                colors = RadioButtonDefaults.colors(selectedColor = PrimaryGreen)
                            )
                            Column {
                                Text("Online Payment (Instant)", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold), color = PrimaryText)
                                Text("Pay via UPI, Cards, NetBanking directly", style = MaterialTheme.typography.bodySmall, color = SecondaryText)
                            }
                        }
                    }

                    // 3. Coupon Voucher Entry
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(Color.White)
                            .border(1.dp, Border, RoundedCornerShape(16.dp))
                            .padding(horizontal = 16.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text("🏷️", fontSize = 18.sp)
                        TextField(
                            value = couponCode,
                            onValueChange = { viewModel.setCouponCode(it.uppercase()) },
                            placeholder = { Text("Enter Promo / Coupon Code", fontSize = 13.sp, color = SecondaryText) },
                            singleLine = true,
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = Color.Transparent,
                                unfocusedContainerColor = Color.Transparent,
                                focusedIndicatorColor = Color.Transparent,
                                unfocusedIndicatorColor = Color.Transparent
                            ),
                            modifier = Modifier.weight(1f)
                        )
                        if (couponCode.isNotBlank()) {
                            Text(
                                text = "Applied",
                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                color = PrimaryGreen
                            )
                        }
                    }

                    // 4. Order Summary Breakdown Card
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
                            text = "Order Breakdown (${cart.items.size} items)",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = PrimaryText
                        )

                        Divider(color = Border, thickness = 0.5.dp, modifier = Modifier.padding(vertical = 4.dp))

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Items Subtotal", style = MaterialTheme.typography.bodyMedium, color = SecondaryText)
                            Text("₹${cart.subtotal.toInt()}", style = MaterialTheme.typography.bodyMedium, color = PrimaryText)
                        }

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Delivery Charges", style = MaterialTheme.typography.bodyMedium, color = SecondaryText)
                            if (cart.deliveryFee == 0.0) {
                                Text("FREE", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold), color = PrimaryGreen)
                            } else {
                                Text("₹${cart.deliveryFee.toInt()}", style = MaterialTheme.typography.bodyMedium, color = PrimaryText)
                            }
                        }

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Platform Convenience Fee", style = MaterialTheme.typography.bodyMedium, color = SecondaryText)
                            Text("₹${cart.platformFee.toInt()}", style = MaterialTheme.typography.bodyMedium, color = PrimaryText)
                        }

                        Divider(color = Border, thickness = 0.5.dp, modifier = Modifier.padding(vertical = 4.dp))

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Grand Total", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold), color = PrimaryText)
                            Text(
                                text = "₹${cart.totalAmount.toInt()}",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.ExtraBold),
                                color = PrimaryGreen
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))
                }
            }
        }
    }
}
