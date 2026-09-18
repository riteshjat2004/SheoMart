package com.sheomart.mobile.ui.admin.products

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.data.model.AdminProductItem
import com.sheomart.mobile.ui.admin.components.AdminFilterChip
import com.sheomart.mobile.ui.admin.components.AdminSearchBar
import com.sheomart.mobile.ui.admin.components.AdminTopAppBar
import com.sheomart.mobile.ui.components.AsyncImageLoader
import com.sheomart.mobile.ui.components.SectionEmptyView
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.components.ShimmerPlaceholder
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@Composable
fun AdminProductsScreen(
    viewModel: AdminProductsViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(uiState.feedbackMessage) {
        uiState.feedbackMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg)
            viewModel.dismissFeedback()
        }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            AdminTopAppBar(
                title = "Product Catalog",
                subtitle = "Platform products, pricing & inventory",
                onBack = onBack,
                actions = {
                    IconButton(onClick = { viewModel.loadProducts() }) {
                        Text(text = "🔄", fontSize = 16.sp)
                    }
                }
            )
        },
        containerColor = Background,
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Search & Status filter chips
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp)
            ) {
                AdminSearchBar(
                    query = uiState.searchQuery,
                    onQueryChange = { viewModel.onSearchChange(it) },
                    placeholder = "Search name, SKU, brand..."
                )

                Spacer(modifier = Modifier.height(10.dp))

                val inventoryFilters = listOf(
                    null to "All Stock",
                    "in_stock" to "In Stock",
                    "low_stock" to "Low Stock",
                    "out_of_stock" to "Out of Stock",
                    "unavailable" to "Unavailable"
                )

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    inventoryFilters.forEach { (statusKey, label) ->
                        AdminFilterChip(
                            selected = uiState.selectedInventoryStatus == statusKey,
                            label = label,
                            onClick = { viewModel.onInventoryStatusFilterChange(statusKey) }
                        )
                    }
                }
            }

            // Products list
            when (val state = uiState.productsState) {
                is UiState.Loading -> {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        repeat(4) {
                            ShimmerPlaceholder(
                                modifier = Modifier.fillMaxWidth().height(140.dp),
                                shape = RoundedCornerShape(20.dp)
                            )
                        }
                    }
                }
                is UiState.Success -> {
                    LazyColumn(
                        modifier = Modifier.weight(1f).fillMaxWidth(),
                        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(state.data, key = { it.productId }) { product ->
                            AdminProductCard(
                                product = product,
                                onUpdateStock = { viewModel.openInventoryDialog(product) },
                                onToggleStatus = { viewModel.toggleProductStatus(product) }
                            )
                        }
                        item {
                            Spacer(modifier = Modifier.height(16.dp))
                        }
                    }

                    // Pagination bar
                    if (uiState.pagination.totalPages > 1) {
                        Surface(
                            modifier = Modifier.fillMaxWidth(),
                            shadowElevation = 4.dp,
                            color = Color.White
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 20.dp, vertical = 10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Page ${uiState.currentPage} of ${uiState.pagination.totalPages} (${uiState.pagination.total} items)",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = SecondaryText
                                )
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    OutlinedButton(
                                        onClick = { viewModel.previousPage() },
                                        enabled = uiState.currentPage > 1,
                                        shape = RoundedCornerShape(8.dp),
                                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                                    ) {
                                        Text("Prev", fontSize = 12.sp)
                                    }
                                    OutlinedButton(
                                        onClick = { viewModel.nextPage() },
                                        enabled = uiState.currentPage < uiState.pagination.totalPages,
                                        shape = RoundedCornerShape(8.dp),
                                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                                    ) {
                                        Text("Next", fontSize = 12.sp)
                                    }
                                }
                            }
                        }
                    }
                }
                is UiState.Empty -> {
                    Box(modifier = Modifier.fillMaxSize().padding(20.dp), contentAlignment = Alignment.Center) {
                        SectionEmptyView(
                            title = "No products found",
                            description = "No products match the selected filters."
                        )
                    }
                }
                is UiState.Error -> {
                    Box(modifier = Modifier.fillMaxSize().padding(20.dp), contentAlignment = Alignment.Center) {
                        SectionErrorView(
                            message = state.message,
                            onRetry = { viewModel.loadProducts() }
                        )
                    }
                }
            }
        }
    }

    // Inventory Update Dialog
    if (uiState.editingInventoryProduct != null) {
        val prod = uiState.editingInventoryProduct!!
        InventoryEditDialog(
            product = prod,
            isSubmitting = uiState.isSubmitting,
            onSave = { qty, status -> viewModel.updateStock(qty, status) },
            onDismiss = { viewModel.dismissInventoryDialog() }
        )
    }
}

@Composable
private fun AdminProductCard(
    product: AdminProductItem,
    onUpdateStock: () -> Unit,
    onToggleStatus: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(2.dp, shape = RoundedCornerShape(20.dp), spotColor = Color(0x14000000))
            .clip(RoundedCornerShape(20.dp))
            .background(Color.White)
            .border(1.dp, Border, RoundedCornerShape(20.dp))
            .padding(14.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Product Thumbnail
                Box(
                    modifier = Modifier
                        .size(68.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(Surface)
                        .border(1.dp, Border, RoundedCornerShape(14.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    if (!product.thumbnail.isNullOrBlank()) {
                        AsyncImageLoader(
                            url = product.thumbnail,
                            contentDescription = product.name,
                            modifier = Modifier.fillMaxSize()
                        )
                    } else {
                        Text(text = "📦", fontSize = 24.sp)
                    }
                }

                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Top
                    ) {
                        Text(
                            text = product.name,
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold, fontSize = 14.sp),
                            color = PrimaryText,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.weight(1f)
                        )

                        // Inventory status pill
                        val (invBg, invFg, invText) = when (product.inventoryStatus.lowercase()) {
                            "in_stock" -> Triple(Color(0xFFECFDF5), Color(0xFF047857), "In Stock")
                            "low_stock" -> Triple(Color(0xFFFEF3C7), Color(0xFFB45309), "Low Stock")
                            "out_of_stock" -> Triple(Color(0xFFFEF2F2), Color(0xFFB91C1C), "Out of Stock")
                            else -> Triple(Color(0xFFF3F4F6), Color(0xFF4B5563), product.inventoryStatus.replace("_", " "))
                        }
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(invBg)
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(text = invText, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = invFg)
                        }
                    }

                    Spacer(modifier = Modifier.height(2.dp))

                    if (product.storeName != null || product.categoryName != null) {
                        Text(
                            text = "${product.storeName ?: "Store"} · ${product.categoryName ?: "Category"}",
                            style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                            color = SecondaryText,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            verticalAlignment = Alignment.Bottom
                        ) {
                            Text(
                                text = "₹${product.displayPrice.toInt()}",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = PrimaryGreen, fontSize = 15.sp)
                            )
                            if (product.discountPrice != null && product.discountPrice < product.price) {
                                Text(
                                    text = "₹${product.price.toInt()}",
                                    style = MaterialTheme.typography.bodySmall.copy(
                                        fontSize = 11.sp,
                                        color = SecondaryText,
                                        textDecoration = androidx.compose.ui.text.style.TextDecoration.LineThrough
                                    )
                                )
                            }
                        }

                        Text(
                            text = "Stock: ${product.quantity}",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = if (product.quantity > 5) PrimaryText else if (product.quantity > 0) Color(0xFFD97706) else Error
                            )
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedButton(
                    onClick = onUpdateStock,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f).height(34.dp),
                    contentPadding = PaddingValues(horizontal = 6.dp)
                ) {
                    Text("📊 Update Stock", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold), color = PrimaryText)
                }

                OutlinedButton(
                    onClick = onToggleStatus,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f).height(34.dp),
                    contentPadding = PaddingValues(horizontal = 6.dp)
                ) {
                    Text(
                        text = if (product.isActive) "Deactivate" else "Activate",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                        color = if (product.isActive) Color(0xFFD97706) else PrimaryGreen
                    )
                }
            }
        }
    }
}

@Composable
private fun InventoryEditDialog(
    product: AdminProductItem,
    isSubmitting: Boolean,
    onSave: (quantity: Int, status: String) -> Unit,
    onDismiss: () -> Unit
) {
    var quantityText by remember { mutableStateOf(product.quantity.toString()) }
    var selectedStatus by remember { mutableStateOf(product.inventoryStatus) }

    val statusOptions = listOf(
        "in_stock" to "In Stock",
        "low_stock" to "Low Stock",
        "out_of_stock" to "Out of Stock",
        "unavailable" to "Unavailable"
    )

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text("Update Stock: ${product.name}", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold), maxLines = 1, overflow = TextOverflow.Ellipsis)
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = quantityText,
                    onValueChange = { quantityText = it.filter { c -> c.isDigit() } },
                    label = { Text("Available Stock Quantity") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Text("Inventory Status", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, color = SecondaryText))

                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    statusOptions.forEach { (key, label) ->
                        val isSelected = selectedStatus.equals(key, ignoreCase = true)
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isSelected) PrimaryGreen.copy(alpha = 0.1f) else Surface)
                                .border(1.dp, if (isSelected) PrimaryGreen else Border, RoundedCornerShape(10.dp))
                                .clickable { selectedStatus = key }
                                .padding(horizontal = 12.dp, vertical = 8.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(text = label, style = MaterialTheme.typography.bodyMedium, color = if (isSelected) PrimaryGreen else PrimaryText, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal)
                                if (isSelected) Text("✓", color = PrimaryGreen, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val qty = quantityText.toIntOrNull() ?: 0
                    onSave(qty, selectedStatus)
                },
                enabled = !isSubmitting,
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text(if (isSubmitting) "Saving..." else "Update Stock", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            OutlinedButton(onClick = onDismiss, shape = RoundedCornerShape(10.dp)) {
                Text("Cancel", color = PrimaryText)
            }
        },
        shape = RoundedCornerShape(20.dp),
        containerColor = Color.White
    )
}
