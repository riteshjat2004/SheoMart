package com.sheomart.mobile.ui.seller.pos

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import androidx.compose.ui.window.Dialog
import com.sheomart.mobile.data.model.BillingCartItem
import com.sheomart.mobile.data.model.InvoiceRecord
import com.sheomart.mobile.data.model.PosCustomer
import com.sheomart.mobile.data.model.PosProductItem
import com.sheomart.mobile.ui.components.AsyncImageLoader
import com.sheomart.mobile.ui.components.PrimaryButton
import com.sheomart.mobile.ui.components.SectionEmptyView
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SellerPosScreen(
    viewModel: SellerPosViewModel,
    onBack: () -> Unit
) {
    val colorScheme = MaterialTheme.colorScheme

    val catalogState by viewModel.catalogState.collectAsState()
    val customersState by viewModel.customersState.collectAsState()
    val customerType by viewModel.customerType.collectAsState()
    val walkInName by viewModel.walkInName.collectAsState()
    val walkInPhone by viewModel.walkInPhone.collectAsState()
    val selectedCustomer by viewModel.selectedCustomer.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val selectedCategory by viewModel.selectedCategory.collectAsState()
    val cartItems by viewModel.cartItems.collectAsState()
    val paymentMethod by viewModel.paymentMethod.collectAsState()
    val generatedInvoice by viewModel.generatedInvoice.collectAsState()
    val isGeneratingInvoice by viewModel.isGeneratingInvoice.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()

    var showCartSheet by remember { mutableStateOf(false) }
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(errorMessage) {
        errorMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearError()
        }
    }

    // Invoice Receipt Modal / Dialog
    if (generatedInvoice != null) {
        InvoiceReceiptDialog(
            invoice = generatedInvoice!!,
            onDismiss = { viewModel.dismissInvoiceReceipt() }
        )
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "POS Billing Terminal",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = colorScheme.onSurface
                        )
                        Text(
                            text = "Walk-in & Customer Counter Sales",
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
                actions = {
                    // Floating cart count indicator
                    Box(
                        modifier = Modifier
                            .padding(end = 12.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(colorScheme.primary)
                            .clickable { showCartSheet = true }
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text("🛒", fontSize = 14.sp)
                            Text(
                                text = "${cartItems.sumOf { it.quantity }} items • ₹${viewModel.grandTotal.toInt()}",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = colorScheme.onPrimary
                                )
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = colorScheme.surface)
            )
        },
        bottomBar = {
            if (cartItems.isNotEmpty()) {
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = colorScheme.surface,
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
                            Text(
                                text = "Grand Total",
                                style = MaterialTheme.typography.bodySmall,
                                color = colorScheme.onSurfaceVariant
                            )
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text(
                                    text = "₹${viewModel.grandTotal.toInt()}",
                                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold),
                                    color = colorScheme.primary
                                )
                                if (viewModel.plusDiscount > 0) {
                                    Text(
                                        text = "(-₹${viewModel.plusDiscount.toInt()} PLUS)",
                                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                        color = colorScheme.primary
                                    )
                                }
                            }
                        }

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedButton(
                                onClick = { showCartSheet = true },
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Text("View Cart (${cartItems.size})", color = colorScheme.primary)
                            }

                            PrimaryButton(
                                text = if (isGeneratingInvoice) "Billing..." else "Bill • ₹${viewModel.grandTotal.toInt()}",
                                onClick = { viewModel.generateInvoice() },
                                modifier = Modifier.width(150.dp),
                                enabled = !isGeneratingInvoice && cartItems.isNotEmpty()
                            )
                        }
                    }
                }
            }
        },
        containerColor = colorScheme.background
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // ── 1. Customer Type Selector (Walk-in / Registered / Plus) ──
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(colorScheme.surface)
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(colorScheme.surfaceContainerHighest)
                        .padding(3.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    CustomerBillingType.values().forEach { type ->
                        val isSelected = customerType == type
                        val label = when (type) {
                            CustomerBillingType.WALK_IN -> "🚶 Walk-in"
                            CustomerBillingType.REGISTERED -> "👤 Registered"
                            CustomerBillingType.PLUS_MEMBER -> "⭐ Plus Member"
                        }

                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) colorScheme.surface else Color.Transparent)
                                .clickable { viewModel.setCustomerType(type) }
                                .padding(vertical = 8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = label,
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                ),
                                color = if (isSelected) colorScheme.primary else colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                // Dynamic inputs based on customer type
                when (customerType) {
                    CustomerBillingType.WALK_IN -> {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedTextField(
                                value = walkInName,
                                onValueChange = { viewModel.setWalkInName(it) },
                                label = { Text("Customer Name") },
                                singleLine = true,
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp)
                            )
                            OutlinedTextField(
                                value = walkInPhone,
                                onValueChange = { viewModel.setWalkInPhone(it) },
                                label = { Text("Phone (Optional)") },
                                singleLine = true,
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp)
                            )
                        }
                    }
                    CustomerBillingType.REGISTERED, CustomerBillingType.PLUS_MEMBER -> {
                        val customers = (customersState as? UiState.Success)?.data ?: emptyList()
                        val relevantCustomers = if (customerType == CustomerBillingType.PLUS_MEMBER) {
                            customers.filter { it.isPlus }
                        } else customers

                        if (relevantCustomers.isNotEmpty()) {
                            LazyRow(
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                contentPadding = PaddingValues(vertical = 2.dp)
                            ) {
                                items(relevantCustomers) { cust ->
                                    val isSelected = selectedCustomer?.customerId == cust.customerId
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(10.dp))
                                            .background(
                                                if (isSelected) colorScheme.primary.copy(alpha = 0.12f)
                                                else colorScheme.surfaceContainerHighest
                                            )
                                            .border(
                                                1.dp,
                                                if (isSelected) colorScheme.primary else colorScheme.outlineVariant,
                                                RoundedCornerShape(10.dp)
                                            )
                                            .clickable { viewModel.selectCustomer(cust) }
                                            .padding(horizontal = 10.dp, vertical = 6.dp)
                                    ) {
                                        Column {
                                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                                Text(
                                                    text = cust.name,
                                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                                    color = colorScheme.onSurface
                                                )
                                                if (cust.isPlus) {
                                                    Text("⭐", fontSize = 10.sp)
                                                }
                                            }
                                            Text(
                                                text = cust.mobile ?: "No phone",
                                                style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
                                                color = colorScheme.onSurfaceVariant
                                            )
                                        }
                                    }
                                }
                            }
                        } else {
                            Text(
                                text = if (customerType == CustomerBillingType.PLUS_MEMBER) "No PLUS members enrolled yet." else "No registered customers found.",
                                style = MaterialTheme.typography.bodySmall,
                                color = colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }

            HorizontalDivider(color = colorScheme.outlineVariant.copy(alpha = 0.5f), thickness = 0.5.dp)

            // ── 2. Search Box & Category Filter ──────────────────────────
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(colorScheme.surface)
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TextField(
                    value = searchQuery,
                    onValueChange = { viewModel.setSearchQuery(it) },
                    placeholder = {
                        Text("Search catalog or SKU...", color = colorScheme.onSurfaceVariant, fontSize = 13.sp)
                    },
                    singleLine = true,
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = colorScheme.surfaceContainerHighest,
                        unfocusedContainerColor = colorScheme.surfaceContainerHighest,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent,
                        focusedTextColor = colorScheme.onSurface,
                        unfocusedTextColor = colorScheme.onSurface
                    ),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth().height(44.dp)
                )

                // Category chips
                val allCategories = listOf("All", "Spices", "Dairy & Eggs", "Grains & Flours", "Oil & Ghee", "Snacks")
                LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    items(allCategories) { cat ->
                        val isSelected = (cat == "All" && selectedCategory == null) || (selectedCategory == cat)
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(
                                    if (isSelected) colorScheme.primary
                                    else colorScheme.surfaceContainerHighest
                                )
                                .clickable { viewModel.selectCategory(if (cat == "All") null else cat) }
                                .padding(horizontal = 10.dp, vertical = 5.dp)
                        ) {
                            Text(
                                text = cat,
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                    fontSize = 11.sp
                                ),
                                color = if (isSelected) colorScheme.onPrimary else colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }

            HorizontalDivider(color = colorScheme.outlineVariant.copy(alpha = 0.5f), thickness = 0.5.dp)

            // ── 3. Product Catalog List ──────────────────────────────────
            Box(modifier = Modifier.fillMaxSize()) {
                when (val res = catalogState) {
                    is UiState.Loading -> {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(color = colorScheme.primary)
                        }
                    }
                    is UiState.Error -> {
                        Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                            SectionErrorView(message = res.message, onRetry = { viewModel.loadPosData() })
                        }
                    }
                    is UiState.Empty, null -> {
                        Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                            SectionEmptyView(title = "No products found", description = "Add products to your catalog to bill customers.")
                        }
                    }
                    is UiState.Success -> {
                        val filtered = res.data.filter { prod ->
                            val matchesSearch = searchQuery.isBlank() || prod.name.contains(searchQuery, ignoreCase = true) || (prod.sku?.contains(searchQuery, ignoreCase = true) == true)
                            val matchesCategory = selectedCategory == null || prod.categoryName?.equals(selectedCategory, ignoreCase = true) == true
                            matchesSearch && matchesCategory
                        }

                        if (filtered.isEmpty()) {
                            Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                                SectionEmptyView(title = "No matches", description = "Try searching for a different product name or category.")
                            }
                        } else {
                            LazyColumn(
                                modifier = Modifier.fillMaxSize(),
                                contentPadding = PaddingValues(16.dp),
                                verticalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                items(filtered, key = { it.productId }) { prod ->
                                    val inCart = cartItems.firstOrNull { it.product.productId == prod.productId }
                                    PosProductCard(
                                        product = prod,
                                        quantityInCart = inCart?.quantity ?: 0,
                                        onAdd = { viewModel.addToCart(prod) },
                                        onDecrease = { viewModel.updateQuantity(prod.productId, (inCart?.quantity ?: 0) - 1) },
                                        onIncrease = { viewModel.updateQuantity(prod.productId, (inCart?.quantity ?: 0) + 1) }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Cart Bottom Sheet / Modal View
    if (showCartSheet) {
        BillingCartModal(
            cartItems = cartItems,
            customerType = customerType,
            subtotal = viewModel.subtotal,
            plusDiscount = viewModel.plusDiscount,
            grandTotal = viewModel.grandTotal,
            paymentMethod = paymentMethod,
            isGenerating = isGeneratingInvoice,
            onPaymentMethodChange = { viewModel.setPaymentMethod(it) },
            onUpdateQuantity = { id, qty -> viewModel.updateQuantity(id, qty) },
            onClearCart = { viewModel.clearCart() },
            onGenerateInvoice = {
                showCartSheet = false
                viewModel.generateInvoice()
            },
            onDismiss = { showCartSheet = false }
        )
    }
}

@Composable
private fun PosProductCard(
    product: PosProductItem,
    quantityInCart: Int,
    onAdd: () -> Unit,
    onDecrease: () -> Unit,
    onIncrease: () -> Unit
) {
    val colorScheme = MaterialTheme.colorScheme

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(colorScheme.surface)
            .border(1.dp, colorScheme.outlineVariant, RoundedCornerShape(14.dp))
            .padding(10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        AsyncImageLoader(
            url = product.thumbnail,
            contentDescription = product.name,
            modifier = Modifier
                .size(54.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(colorScheme.surfaceContainerHighest),
            contentScale = ContentScale.Crop,
            fallbackText = product.name
        )

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = product.name,
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                color = colorScheme.onSurface,
                maxLines = 1
            )
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "₹${product.displayPrice.toInt()}",
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                    color = colorScheme.primary
                )
                if (product.discountPrice != null) {
                    Text(
                        text = "₹${product.price.toInt()}",
                        style = MaterialTheme.typography.bodySmall,
                        color = colorScheme.onSurfaceVariant
                    )
                }
                Text(
                    text = "• ${product.availableQuantity} in stock",
                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp),
                    color = colorScheme.onSurfaceVariant
                )
            }
        }

        if (quantityInCart == 0) {
            Button(
                onClick = onAdd,
                colors = ButtonDefaults.buttonColors(containerColor = colorScheme.primary),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                modifier = Modifier.height(34.dp)
            ) {
                Text("+ Add", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold))
            }
        } else {
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(colorScheme.surfaceContainerHighest)
                    .border(1.dp, colorScheme.primary.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
                    .padding(horizontal = 4.dp, vertical = 2.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                IconButton(onClick = onDecrease, modifier = Modifier.size(26.dp)) {
                    Text("-", fontWeight = FontWeight.Bold, color = colorScheme.primary)
                }
                Text(
                    text = "$quantityInCart",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                    color = colorScheme.onSurface
                )
                IconButton(onClick = onIncrease, modifier = Modifier.size(26.dp)) {
                    Text("+", fontWeight = FontWeight.Bold, color = colorScheme.primary)
                }
            }
        }
    }
}

@Composable
private fun BillingCartModal(
    cartItems: List<BillingCartItem>,
    customerType: CustomerBillingType,
    subtotal: Double,
    plusDiscount: Double,
    grandTotal: Double,
    paymentMethod: String,
    isGenerating: Boolean,
    onPaymentMethodChange: (String) -> Unit,
    onUpdateQuantity: (String, Int) -> Unit,
    onClearCart: () -> Unit,
    onGenerateInvoice: () -> Unit,
    onDismiss: () -> Unit
) {
    val colorScheme = MaterialTheme.colorScheme

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = colorScheme.surface,
            modifier = Modifier.fillMaxWidth().fillMaxHeight(0.85f).padding(8.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Billing Cart (${cartItems.size} items)",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = colorScheme.onSurface
                    )
                    TextButton(onClick = onClearCart) {
                        Text("Clear", color = colorScheme.error, style = MaterialTheme.typography.labelMedium)
                    }
                }

                HorizontalDivider(color = colorScheme.outlineVariant.copy(alpha = 0.5f), thickness = 0.5.dp)

                // Items list
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(cartItems) { item ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(colorScheme.surfaceContainerHighest.copy(alpha = 0.5f))
                                .padding(10.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = item.product.name,
                                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                                    color = colorScheme.onSurface,
                                    maxLines = 1
                                )
                                Text(
                                    text = "₹${item.unitPrice.toInt()} × ${item.quantity} = ₹${item.lineTotal.toInt()}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = colorScheme.primary
                                )
                            }

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                IconButton(onClick = { onUpdateQuantity(item.product.productId, item.quantity - 1) }, modifier = Modifier.size(28.dp)) {
                                    Text("-", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = colorScheme.onSurface)
                                }
                                Text("${item.quantity}", fontWeight = FontWeight.Bold, color = colorScheme.onSurface)
                                IconButton(onClick = { onUpdateQuantity(item.product.productId, item.quantity + 1) }, modifier = Modifier.size(28.dp)) {
                                    Text("+", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = colorScheme.primary)
                                }
                            }
                        }
                    }
                }

                HorizontalDivider(color = colorScheme.outlineVariant.copy(alpha = 0.5f), thickness = 0.5.dp)

                // Payment Method Selector: CASH / UPI / CREDIT
                Text("Payment Method", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold), color = colorScheme.onSurface)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("CASH", "UPI", "CREDIT").forEach { method ->
                        val isSelected = paymentMethod == method
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) colorScheme.primary else colorScheme.surfaceContainerHighest)
                                .clickable { onPaymentMethodChange(method) }
                                .padding(vertical = 8.dp),
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

                // Breakdown
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Subtotal", style = MaterialTheme.typography.bodySmall, color = colorScheme.onSurfaceVariant)
                        Text("₹${subtotal.toInt()}", style = MaterialTheme.typography.bodySmall, color = colorScheme.onSurface)
                    }
                    if (plusDiscount > 0) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("⭐ PLUS Member 5% Off", style = MaterialTheme.typography.bodySmall, color = colorScheme.primary)
                            Text("-₹${plusDiscount.toInt()}", style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold), color = colorScheme.primary)
                        }
                    }
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Grand Total", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold), color = colorScheme.onSurface)
                        Text("₹${grandTotal.toInt()}", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.ExtraBold), color = colorScheme.primary)
                    }
                }

                PrimaryButton(
                    text = if (isGenerating) "Generating..." else "Confirm & Generate Invoice",
                    onClick = onGenerateInvoice,
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isGenerating && cartItems.isNotEmpty()
                )
            }
        }
    }
}

@Composable
private fun InvoiceReceiptDialog(
    invoice: InvoiceRecord,
    onDismiss: () -> Unit
) {
    val colorScheme = MaterialTheme.colorScheme

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = colorScheme.surface,
            modifier = Modifier.fillMaxWidth().padding(12.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(CircleShape)
                        .background(colorScheme.primary.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("🧾", fontSize = 28.sp)
                }

                Text(
                    text = "Invoice Generated Successfully 🎉",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = colorScheme.onSurface
                )

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(colorScheme.surfaceContainerHighest.copy(alpha = 0.6f))
                        .padding(14.dp)
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Invoice #", style = MaterialTheme.typography.bodySmall, color = colorScheme.onSurfaceVariant)
                            Text(invoice.invoiceNumber, style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold), color = colorScheme.onSurface)
                        }
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Customer", style = MaterialTheme.typography.bodySmall, color = colorScheme.onSurfaceVariant)
                            Text(invoice.customerName, style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium), color = colorScheme.onSurface)
                        }
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Payment", style = MaterialTheme.typography.bodySmall, color = colorScheme.onSurfaceVariant)
                            Text("${invoice.paymentMethod} • ${invoice.paymentStatus}", style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold), color = colorScheme.primary)
                        }
                        HorizontalDivider(color = colorScheme.outlineVariant.copy(alpha = 0.5f), thickness = 0.5.dp, modifier = Modifier.padding(vertical = 2.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Total Paid", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold), color = colorScheme.onSurface)
                            Text("₹${invoice.grandTotal.toInt()}", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.ExtraBold), color = colorScheme.primary)
                        }
                    }
                }

                PrimaryButton(
                    text = "Done & Start New Sale",
                    onClick = onDismiss,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}
