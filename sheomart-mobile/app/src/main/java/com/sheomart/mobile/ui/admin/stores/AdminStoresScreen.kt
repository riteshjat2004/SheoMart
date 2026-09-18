package com.sheomart.mobile.ui.admin.stores

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
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
import com.sheomart.mobile.data.model.AdminStoreItem
import com.sheomart.mobile.ui.admin.components.*
import com.sheomart.mobile.ui.components.SectionEmptyView
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.components.ShimmerPlaceholder
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@Composable
fun AdminStoresScreen(
    viewModel: AdminStoresViewModel,
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
                title = "Store Management",
                subtitle = "Review store applications & marketplace badges",
                onBack = onBack,
                actions = {
                    IconButton(onClick = { viewModel.loadStores() }) {
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
            // Search & Filters bar
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp)
            ) {
                AdminSearchBar(
                    query = uiState.searchQuery,
                    onQueryChange = { viewModel.onSearchChange(it) },
                    placeholder = "Search store, owner, phone, city..."
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Status Filter Chips
                val filterOptions = listOf(
                    "all" to "All Stores",
                    "pending" to "Pending",
                    "approved" to "Approved",
                    "rejected" to "Rejected",
                    "suspended" to "Suspended"
                )

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    filterOptions.forEach { (key, label) ->
                        AdminFilterChip(
                            selected = uiState.selectedStatusFilter == key,
                            label = label,
                            onClick = { viewModel.onStatusFilterChange(key) }
                        )
                    }
                }
            }

            // Store List
            when (val state = uiState.storesState) {
                is UiState.Loading -> {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        repeat(4) {
                            ShimmerPlaceholder(
                                modifier = Modifier.fillMaxWidth().height(160.dp),
                                shape = RoundedCornerShape(20.dp)
                            )
                        }
                    }
                }
                is UiState.Success -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(state.data, key = { it.storeId }) { store ->
                            AdminStoreCard(
                                store = store,
                                onApprove = { viewModel.requestStatusAction(store, "approved") },
                                onReject = { viewModel.requestStatusAction(store, "rejected") },
                                onSuspend = { viewModel.requestStatusAction(store, "suspended") },
                                onEditBadge = { viewModel.openBadgeDialog(store) }
                            )
                        }
                        item {
                            Spacer(modifier = Modifier.height(24.dp))
                        }
                    }
                }
                is UiState.Empty -> {
                    Box(modifier = Modifier.fillMaxSize().padding(20.dp), contentAlignment = Alignment.Center) {
                        SectionEmptyView(
                            title = "No stores found",
                            description = "No store matches the selected search and filter."
                        )
                    }
                }
                is UiState.Error -> {
                    Box(modifier = Modifier.fillMaxSize().padding(20.dp), contentAlignment = Alignment.Center) {
                        SectionErrorView(
                            message = state.message,
                            onRetry = { viewModel.loadStores() }
                        )
                    }
                }
            }
        }
    }

    // Status Confirmation Dialog
    if (uiState.pendingActionStore != null) {
        val store = uiState.pendingActionStore!!
        val action = uiState.pendingActionStatus ?: "approved"
        AdminConfirmDialog(
            title = "Update store to $action?",
            description = "This will update the access status of '${store.storeName}' across the marketplace.",
            confirmText = action.replaceFirstChar { it.uppercase() },
            confirmColor = when (action) {
                "approved" -> PrimaryGreen
                "rejected" -> Error
                else -> Color(0xFFD97706)
            },
            onConfirm = { viewModel.confirmStatusAction() },
            onDismiss = { viewModel.dismissStatusAction() }
        )
    }

    // Badge Selection Dialog
    if (uiState.badgeDialogStore != null) {
        val store = uiState.badgeDialogStore!!
        BadgeSelectionDialog(
            store = store,
            onSelectBadge = { viewModel.updateBadge(it) },
            onDismiss = { viewModel.dismissBadgeDialog() }
        )
    }
}

@Composable
private fun AdminStoreCard(
    store: AdminStoreItem,
    onApprove: () -> Unit,
    onReject: () -> Unit,
    onSuspend: () -> Unit,
    onEditBadge: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(2.dp, shape = RoundedCornerShape(20.dp), spotColor = Color(0x14000000))
            .clip(RoundedCornerShape(20.dp))
            .background(Color.White)
            .border(1.dp, Border, RoundedCornerShape(20.dp))
            .padding(16.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Row(
                    modifier = Modifier.weight(1f),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(Surface)
                            .border(1.dp, Border, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = store.storeName.take(1).uppercase(),
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = PrimaryGreen
                        )
                    }

                    Column {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text(
                                text = store.storeName,
                                style = MaterialTheme.typography.titleSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp
                                ),
                                color = PrimaryText,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )

                            // Store Badge Pill
                            when (store.badge.lowercase()) {
                                "royal" -> {
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(Color(0xFFFEF3C7))
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text("👑 Royal", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFFB45309))
                                    }
                                }
                                "verified" -> {
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(Color(0xFFECFDF5))
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text("✓ Verified", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFF047857))
                                    }
                                }
                            }
                        }

                        if (store.ownerName != null) {
                            Text(
                                text = "Owner: ${store.ownerName}${if (!store.ownerMobile.isNullOrBlank()) " · 📱 ${store.ownerMobile}" else ""}",
                                style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                                color = SecondaryText,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }

                        if (store.address != null || store.city != null) {
                            Text(
                                text = "📍 ${store.address ?: store.city ?: "Sheopur"}",
                                style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                                color = SecondaryText,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }

                // Status Pill
                val (statusBg, statusFg, statusText) = when (store.status.lowercase()) {
                    "approved" -> Triple(Color(0xFFECFDF5), Color(0xFF047857), "Approved")
                    "rejected" -> Triple(Color(0xFFFEF2F2), Color(0xFFB91C1C), "Rejected")
                    "suspended" -> Triple(Color(0xFFF3F4F6), Color(0xFF4B5563), "Suspended")
                    else -> Triple(Color(0xFFFEF3C7), Color(0xFFB45309), "Pending")
                }
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(statusBg)
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(text = statusText, style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, fontWeight = FontWeight.Bold), color = statusFg)
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Action Buttons Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedButton(
                    onClick = onEditBadge,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f).height(36.dp),
                    contentPadding = PaddingValues(horizontal = 8.dp)
                ) {
                    Text("🏷️ Badge", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold), color = PrimaryText)
                }

                if (store.isPending) {
                    Button(
                        onClick = onApprove,
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f).height(36.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp)
                    ) {
                        Text("✓ Approve", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold))
                    }
                    OutlinedButton(
                        onClick = onReject,
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Error),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f).height(36.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp)
                    ) {
                        Text("✕ Reject", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold))
                    }
                } else if (store.isApproved) {
                    OutlinedButton(
                        onClick = onSuspend,
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFD97706)),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f).height(36.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp)
                    ) {
                        Text("⏸ Suspend", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold))
                    }
                } else {
                    Button(
                        onClick = onApprove,
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f).height(36.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp)
                    ) {
                        Text("✓ Activate", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold))
                    }
                }
            }
        }
    }
}

@Composable
private fun BadgeSelectionDialog(
    store: AdminStoreItem,
    onSelectBadge: (String) -> Unit,
    onDismiss: () -> Unit
) {
    val badges = listOf(
        Triple("normal", "Standard Store", "Default verified neighborhood seller"),
        Triple("verified", "✓ Verified Store", "Verified address and local inventory"),
        Triple("royal", "👑 Royal Partner", "Exclusive top-tier SheoMart partner store")
    )

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text("Assign Badge to ${store.storeName}", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                badges.forEach { (badgeKey, label, desc) ->
                    val isSelected = store.badge.equals(badgeKey, ignoreCase = true)
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (isSelected) PrimaryGreen.copy(alpha = 0.1f) else Surface)
                            .border(1.dp, if (isSelected) PrimaryGreen else Border, RoundedCornerShape(12.dp))
                            .clickable { onSelectBadge(badgeKey) }
                            .padding(12.dp)
                    ) {
                        Column {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(text = label, fontWeight = FontWeight.Bold, color = if (isSelected) PrimaryGreen else PrimaryText)
                                if (isSelected) Text("✓", color = PrimaryGreen, fontWeight = FontWeight.Bold)
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(text = desc, style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp), color = SecondaryText)
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close", color = PrimaryText)
            }
        },
        shape = RoundedCornerShape(20.dp),
        containerColor = Color.White
    )
}
