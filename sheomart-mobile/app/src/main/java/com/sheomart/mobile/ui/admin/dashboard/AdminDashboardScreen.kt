package com.sheomart.mobile.ui.admin.dashboard

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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.data.model.AdminStoreItem
import com.sheomart.mobile.data.model.AuthUser
import com.sheomart.mobile.ui.admin.components.AdminActionCard
import com.sheomart.mobile.ui.admin.components.AdminConfirmDialog
import com.sheomart.mobile.ui.admin.components.AdminStatCard
import com.sheomart.mobile.ui.components.SectionEmptyView
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.components.ShimmerPlaceholder
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@Composable
fun AdminDashboardScreen(
    user: AuthUser?,
    viewModel: AdminDashboardViewModel,
    onNavigateStores: () -> Unit,
    onNavigateProducts: () -> Unit,
    onNavigateCategories: () -> Unit,
    onNavigateCoupons: () -> Unit,
    onNavigateOffers: () -> Unit,
    onNavigateUsers: () -> Unit,
    onNavigateAnalytics: () -> Unit,
    onNavigateSettings: () -> Unit,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val scrollState = rememberScrollState()

    LaunchedEffect(uiState.feedbackMessage) {
        uiState.feedbackMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg)
            viewModel.dismissFeedback()
        }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = Background,
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(scrollState)
        ) {
            // ==========================================
            // 1. ADMIN HEADER
            // ==========================================
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp)
                    .shadow(2.dp, shape = RoundedCornerShape(24.dp), spotColor = Color(0x14000000))
                    .clip(RoundedCornerShape(24.dp))
                    .background(Color.White)
                    .border(1.dp, Border, RoundedCornerShape(24.dp))
                    .padding(20.dp)
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(14.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            // Avatar
                            Box(
                                modifier = Modifier
                                    .size(56.dp)
                                    .clip(CircleShape)
                                    .background(PrimaryGreen),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = (user?.name?.take(1) ?: "A").uppercase(),
                                    style = MaterialTheme.typography.titleLarge.copy(
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 22.sp
                                    ),
                                    color = Color.White
                                )
                            }

                            Column {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text(
                                        text = user?.name ?: "Administrator",
                                        style = MaterialTheme.typography.titleMedium.copy(
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 17.sp
                                        ),
                                        color = PrimaryText,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(Color(0xFFECFDF5))
                                            .border(1.dp, Color(0xFFA7F3D0), RoundedCornerShape(8.dp))
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = "🛡️ Admin",
                                            style = MaterialTheme.typography.labelSmall.copy(
                                                fontSize = 9.sp,
                                                fontWeight = FontWeight.Bold
                                            ),
                                            color = Color(0xFF047857)
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = user?.email ?: "admin@sheomart.com",
                                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp),
                                    color = SecondaryText,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }

                        // Settings shortcut button
                        Box(
                            modifier = Modifier
                                .size(42.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(Surface)
                                .border(1.dp, Border, RoundedCornerShape(12.dp))
                                .clickable(onClick = onNavigateSettings),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = "⚙️", fontSize = 18.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Location / Scope badge
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Surface.copy(alpha = 0.6f))
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "📍 Sheopur Marketplace Operations",
                            style = MaterialTheme.typography.bodySmall.copy(
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium
                            ),
                            color = PrimaryText
                        )
                        Text(
                            text = "Control Center",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = PrimaryGreen
                            )
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // ==========================================
            // 2. MARKETPLACE OVERVIEW METRICS
            // ==========================================
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            ) {
                Text(
                    text = "MARKETPLACE OVERVIEW",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    ),
                    color = SecondaryText
                )

                Spacer(modifier = Modifier.height(10.dp))

                when (val state = uiState.dashboardState) {
                    is UiState.Loading -> {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            ShimmerPlaceholder(modifier = Modifier.weight(1f).height(100.dp), shape = RoundedCornerShape(20.dp))
                            ShimmerPlaceholder(modifier = Modifier.weight(1f).height(100.dp), shape = RoundedCornerShape(20.dp))
                        }
                    }
                    is UiState.Success -> {
                        val d = state.data
                        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                AdminStatCard(
                                    title = "Customers",
                                    value = "${d.kpis.customers}",
                                    description = "Registered shoppers",
                                    icon = "👥",
                                    modifier = Modifier.weight(1f),
                                    onClick = onNavigateUsers
                                )
                                AdminStatCard(
                                    title = "Stores",
                                    value = "${d.totalStores}",
                                    description = "${d.pendingApprovalCount} pending approval",
                                    icon = "🏪",
                                    modifier = Modifier.weight(1f),
                                    accentColor = if (d.pendingApprovalCount > 0) Color(0xFFD97706) else PrimaryGreen,
                                    onClick = onNavigateStores
                                )
                            }
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                AdminStatCard(
                                    title = "Products",
                                    value = "${d.kpis.products}",
                                    description = "${d.totalCategories} categories active",
                                    icon = "📦",
                                    modifier = Modifier.weight(1f),
                                    onClick = onNavigateProducts
                                )
                                AdminStatCard(
                                    title = "Orders",
                                    value = "${d.kpis.orders}",
                                    description = "Paid checkouts",
                                    icon = "🧾",
                                    modifier = Modifier.weight(1f),
                                    onClick = onNavigateAnalytics
                                )
                            }
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                AdminStatCard(
                                    title = "Revenue",
                                    value = "₹${d.kpis.revenue.toInt()}",
                                    description = "Gross revenue (30d)",
                                    icon = "💰",
                                    modifier = Modifier.weight(1f),
                                    onClick = onNavigateAnalytics
                                )
                                AdminStatCard(
                                    title = "Coupons",
                                    value = "${d.activeCouponsCount}",
                                    description = "Live promotional codes",
                                    icon = "🏷️",
                                    modifier = Modifier.weight(1f),
                                    onClick = onNavigateCoupons
                                )
                            }
                        }
                    }
                    is UiState.Error -> {
                        SectionErrorView(
                            message = state.message,
                            onRetry = { viewModel.loadDashboard() }
                        )
                    }
                    is UiState.Empty -> {}
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ==========================================
            // 3. QUICK ACTION GRID
            // ==========================================
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            ) {
                Text(
                    text = "OPERATIONS & CONTROL",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    ),
                    color = SecondaryText
                )

                Spacer(modifier = Modifier.height(10.dp))

                val pendingCount = (uiState.dashboardState as? UiState.Success)?.data?.pendingApprovalCount ?: 0

                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        AdminActionCard(
                            title = "Store Approvals",
                            subtitle = "Review seller requests",
                            icon = "🏪",
                            badge = if (pendingCount > 0) "$pendingCount New" else null,
                            onClick = onNavigateStores,
                            modifier = Modifier.weight(1f)
                        )
                        AdminActionCard(
                            title = "Product Catalog",
                            subtitle = "Review inventory & prices",
                            icon = "📦",
                            onClick = onNavigateProducts,
                            modifier = Modifier.weight(1f)
                        )
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        AdminActionCard(
                            title = "Categories",
                            subtitle = "Organize taxonomy",
                            icon = "🗂️",
                            onClick = onNavigateCategories,
                            modifier = Modifier.weight(1f)
                        )
                        AdminActionCard(
                            title = "Coupons & Discounts",
                            subtitle = "Vouchers & usage limits",
                            icon = "🏷️",
                            onClick = onNavigateCoupons,
                            modifier = Modifier.weight(1f)
                        )
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        AdminActionCard(
                            title = "Festival Offers",
                            subtitle = "Seasonal banner campaigns",
                            icon = "🎉",
                            onClick = onNavigateOffers,
                            modifier = Modifier.weight(1f)
                        )
                        AdminActionCard(
                            title = "User Accounts",
                            subtitle = "Customers, sellers, admins",
                            icon = "👥",
                            onClick = onNavigateUsers,
                            modifier = Modifier.weight(1f)
                        )
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        AdminActionCard(
                            title = "Business Analytics",
                            subtitle = "KPIs, trends, breakdowns",
                            icon = "📊",
                            onClick = onNavigateAnalytics,
                            modifier = Modifier.weight(1f)
                        )
                        AdminActionCard(
                            title = "Admin Settings",
                            subtitle = "Fee config & security",
                            icon = "⚙️",
                            onClick = onNavigateSettings,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ==========================================
            // 4. PENDING STORE APPROVALS
            // ==========================================
            val pendingStores = (uiState.dashboardState as? UiState.Success)?.data?.pendingStores ?: emptyList()
            if (pendingStores.isNotEmpty()) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "PENDING STORE REQUESTS (${pendingStores.size})",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                            ),
                            color = Color(0xFFB45309)
                        )
                        Text(
                            text = "See All →",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = PrimaryGreen
                            ),
                            modifier = Modifier.clickable(onClick = onNavigateStores)
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        pendingStores.take(3).forEach { store ->
                            PendingStoreDashboardCard(
                                store = store,
                                onApprove = { viewModel.requestStoreAction(store, "approved") },
                                onReject = { viewModel.requestStoreAction(store, "rejected") }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))
            }

            // ==========================================
            // 5. SIGN OUT BUTTON
            // ==========================================
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            ) {
                OutlinedButton(
                    onClick = onLogout,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Error),
                    border = ButtonDefaults.outlinedButtonBorder.copy(
                        brush = androidx.compose.ui.graphics.SolidColor(Error.copy(alpha = 0.5f))
                    )
                ) {
                    Text(
                        text = "Sign Out Administrator",
                        style = MaterialTheme.typography.labelLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = Error
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(40.dp))
        }
    }

    // Confirmation dialog for approving/rejecting store from dashboard
    if (uiState.pendingActionStore != null) {
        val store = uiState.pendingActionStore!!
        val action = uiState.pendingActionType ?: "approved"
        AdminConfirmDialog(
            title = if (action == "approved") "Approve ${store.storeName}?" else "Reject ${store.storeName}?",
            description = if (action == "approved") {
                "This will grant ${store.storeName} active marketplace selling status."
            } else {
                "This will reject this store application."
            },
            confirmText = if (action == "approved") "Approve Store" else "Reject Store",
            confirmColor = if (action == "approved") PrimaryGreen else Error,
            onConfirm = { viewModel.confirmStoreAction() },
            onDismiss = { viewModel.dismissStoreAction() }
        )
    }
}

@Composable
private fun PendingStoreDashboardCard(
    store: AdminStoreItem,
    onApprove: () -> Unit,
    onReject: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(1.dp, shape = RoundedCornerShape(18.dp), spotColor = Color(0x14000000))
            .clip(RoundedCornerShape(18.dp))
            .background(Color.White)
            .border(1.dp, Border, RoundedCornerShape(18.dp))
            .padding(16.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = store.storeName,
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = PrimaryText
                    )
                    if (store.ownerName != null) {
                        Text(
                            text = "Owner: ${store.ownerName}${if (!store.ownerMobile.isNullOrBlank()) " · 📱 ${store.ownerMobile}" else ""}",
                            style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp),
                            color = SecondaryText
                        )
                    }
                    if (store.city != null || store.address != null) {
                        Text(
                            text = "📍 ${store.address ?: store.city ?: "Sheopur"}",
                            style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                            color = SecondaryText
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFFFEF3C7))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = "Pending",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        ),
                        color = Color(0xFFB45309)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = onApprove,
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f).height(38.dp)
                ) {
                    Text("✓ Approve", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold))
                }
                OutlinedButton(
                    onClick = onReject,
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Error),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f).height(38.dp)
                ) {
                    Text("✕ Reject", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold))
                }
            }
        }
    }
}
