package com.sheomart.mobile.ui.seller.inventory

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
import com.sheomart.mobile.data.model.SellerInventoryItem
import com.sheomart.mobile.ui.components.AsyncImageLoader
import com.sheomart.mobile.ui.components.SectionEmptyView
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.components.StatusBadge
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SellerInventoryScreen(
    viewModel: SellerInventoryViewModel,
    onBack: () -> Unit
) {
    val colorScheme = MaterialTheme.colorScheme

    val state by viewModel.inventoryState.collectAsState()
    val query by viewModel.searchQuery.collectAsState()
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
                        text = "Inventory & Stock Sync",
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
            // Search Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(colorScheme.surface)
                    .padding(horizontal = 16.dp, vertical = 10.dp)
            ) {
                TextField(
                    value = query,
                    onValueChange = { viewModel.onSearchQueryChange(it) },
                    placeholder = {
                        Text(
                            text = "Search product inventory...",
                            color = colorScheme.onSurfaceVariant,
                            fontSize = 14.sp
                        )
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
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth().height(48.dp)
                )
            }

            HorizontalDivider(color = colorScheme.outlineVariant.copy(alpha = 0.5f), thickness = 0.5.dp)

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
                                onRetry = { viewModel.loadInventory() }
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
                                title = "No inventory items found",
                                description = "All products and shelf quantities will be synchronized here."
                            )
                        }
                    }
                    is UiState.Success -> {
                        val list = res.data
                        if (list.isEmpty()) {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(24.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                SectionEmptyView(
                                    title = "No inventory items found",
                                    description = "All products and shelf quantities will be synchronized here."
                                )
                            }
                        } else {
                            LazyColumn(
                                modifier = Modifier.fillMaxSize(),
                                contentPadding = PaddingValues(16.dp),
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                items(list, key = { it.productId }) { item ->
                                    SellerInventoryCard(
                                        item = item,
                                        onIncrease = { viewModel.updateStock(item.productId, item.quantity + 5) },
                                        onDecrease = { viewModel.updateStock(item.productId, (item.quantity - 1).coerceAtLeast(0)) }
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
private fun SellerInventoryCard(
    item: SellerInventoryItem,
    onIncrease: () -> Unit,
    onDecrease: () -> Unit
) {
    val colorScheme = MaterialTheme.colorScheme

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(colorScheme.surface)
            .border(1.dp, colorScheme.outlineVariant, RoundedCornerShape(16.dp))
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        AsyncImageLoader(
            url = item.thumbnail,
            contentDescription = item.productName,
            modifier = Modifier
                .size(60.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(colorScheme.surfaceContainerHighest),
            contentScale = ContentScale.Crop,
            fallbackText = item.productName
        )

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = item.productName,
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                color = colorScheme.onSurface,
                maxLines = 2
            )
            Spacer(modifier = Modifier.height(2.dp))
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                StatusBadge(text = item.status)
                Text(
                    text = "Stock: ${item.quantity}",
                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                    color = if (item.quantity <= 5) colorScheme.error else colorScheme.onSurface
                )
            }
        }

        // Quick adjust
        Row(
            modifier = Modifier
                .clip(RoundedCornerShape(10.dp))
                .background(colorScheme.surfaceContainerHighest)
                .border(1.dp, colorScheme.outlineVariant, RoundedCornerShape(10.dp))
                .padding(horizontal = 4.dp, vertical = 2.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            IconButton(onClick = onDecrease, modifier = Modifier.size(28.dp)) {
                Text("-1", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = colorScheme.onSurface)
            }
            IconButton(onClick = onIncrease, modifier = Modifier.size(28.dp)) {
                Text("+5", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = colorScheme.primary)
            }
        }
    }
}
