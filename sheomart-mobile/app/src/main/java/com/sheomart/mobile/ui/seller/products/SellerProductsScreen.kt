package com.sheomart.mobile.ui.seller.products

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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.sheomart.mobile.data.model.SellerProductItem
import com.sheomart.mobile.ui.components.AsyncImageLoader
import com.sheomart.mobile.ui.components.PrimaryButton
import com.sheomart.mobile.ui.components.SectionEmptyView
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SellerProductsScreen(
    viewModel: SellerProductsViewModel,
    onBack: () -> Unit
) {
    val state by viewModel.productsState.collectAsState()
    val actionMsg by viewModel.actionMessage.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }

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
                title = { Text("Store Products", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Text("←", fontSize = 20.sp, color = PrimaryGreen)
                    }
                },
                actions = {
                    TextButton(onClick = { showAddDialog = true }) {
                        Text("+ Add", color = PrimaryGreen, style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold))
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
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
                            onRetry = { viewModel.loadProducts() }
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
                            Text("📦", fontSize = 48.sp)
                            SectionEmptyView(
                                title = "No products listed yet",
                                description = "List your pantry items, spices, and groceries to start receiving local customer orders."
                            )
                            PrimaryButton(
                                text = "+ Add First Product",
                                onClick = { showAddDialog = true },
                                modifier = Modifier.width(200.dp)
                            )
                        }
                    }
                }
                is UiState.Success -> {
                    val products = res.data
                    if (products.isEmpty()) {
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
                                Text("📦", fontSize = 48.sp)
                                SectionEmptyView(
                                    title = "No products listed yet",
                                    description = "List your pantry items, spices, and groceries to start receiving local customer orders."
                                )
                                PrimaryButton(
                                    text = "+ Add First Product",
                                    onClick = { showAddDialog = true },
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
                            items(products) { item ->
                                SellerProductCard(
                                    product = item,
                                    onToggleStatus = { viewModel.toggleProductStatus(item.productId, item.isActive) },
                                    onDelete = { viewModel.deleteProduct(item.productId) }
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    if (showAddDialog) {
        AddSellerProductDialog(
            onDismiss = { showAddDialog = false },
            onSave = { name, desc, price, discPrice, qty, cat, brand ->
                viewModel.addProduct(name, desc, price, discPrice, qty, cat, brand)
                showAddDialog = false
            }
        )
    }
}

@Composable
private fun SellerProductCard(
    product: SellerProductItem,
    onToggleStatus: () -> Unit,
    onDelete: () -> Unit
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
            url = product.thumbnail,
            contentDescription = product.name,
            modifier = Modifier
                .size(68.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(Surface),
            contentScale = ContentScale.Crop,
            fallbackText = product.name
        )

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = product.name,
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                color = PrimaryText,
                maxLines = 2
            )
            Text(
                text = "Stock: ${product.quantity} units",
                style = MaterialTheme.typography.bodySmall,
                color = if (product.quantity <= 5) Color(0xFFDC2626) else SecondaryText
            )
            Spacer(modifier = Modifier.height(2.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "₹${product.displayPrice.toInt()}",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryGreen
                )
                if (product.discountPrice != null) {
                    Text(
                        text = "₹${product.price.toInt()}",
                        style = MaterialTheme.typography.bodySmall,
                        color = SecondaryText
                    )
                }
            }
        }

        Column(
            horizontalAlignment = Alignment.End,
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Switch(
                checked = product.isActive,
                onCheckedChange = { onToggleStatus() },
                colors = SwitchDefaults.colors(
                    checkedThumbColor = Color.White,
                    checkedTrackColor = PrimaryGreen
                ),
                modifier = Modifier.height(24.dp)
            )

            IconButton(onClick = onDelete, modifier = Modifier.size(24.dp)) {
                Text("🗑️", fontSize = 14.sp)
            }
        }
    }
}

@Composable
private fun AddSellerProductDialog(
    onDismiss: () -> Unit,
    onSave: (
        name: String,
        description: String?,
        price: Double,
        discountPrice: Double?,
        quantity: Int,
        categoryId: String?,
        brand: String?
    ) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var priceStr by remember { mutableStateOf("") }
    var discountPriceStr by remember { mutableStateOf("") }
    var quantityStr by remember { mutableStateOf("10") }
    var brand by remember { mutableStateOf("SheoMart") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = Color.White,
            modifier = Modifier.fillMaxWidth().padding(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "Add Product",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryText
                )

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Product Name") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = priceStr,
                        onValueChange = { priceStr = it },
                        label = { Text("Price (₹)") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = discountPriceStr,
                        onValueChange = { discountPriceStr = it },
                        label = { Text("Offer Price (₹)") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = quantityStr,
                        onValueChange = { quantityStr = it },
                        label = { Text("Quantity") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = brand,
                        onValueChange = { brand = it },
                        label = { Text("Brand") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }

                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Description") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 2
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = onDismiss) { Text("Cancel", color = SecondaryText) }
                    Spacer(modifier = Modifier.width(8.dp))
                    PrimaryButton(
                        text = "Save Product",
                        onClick = {
                            val price = priceStr.toDoubleOrNull() ?: 0.0
                            val discountPrice = discountPriceStr.toDoubleOrNull()
                            val qty = quantityStr.toIntOrNull() ?: 0
                            if (name.isNotBlank() && price > 0.0) {
                                onSave(
                                    name,
                                    description.takeIf { it.isNotBlank() },
                                    price,
                                    discountPrice,
                                    qty,
                                    null,
                                    brand.takeIf { it.isNotBlank() }
                                )
                            }
                        },
                        modifier = Modifier.width(140.dp),
                        enabled = name.isNotBlank() && (priceStr.toDoubleOrNull() ?: 0.0) > 0.0
                    )
                }
            }
        }
    }
}
