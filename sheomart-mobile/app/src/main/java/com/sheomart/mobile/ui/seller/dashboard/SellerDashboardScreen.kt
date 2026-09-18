package com.sheomart.mobile.ui.seller.dashboard

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
import com.sheomart.mobile.data.model.AuthUser
import com.sheomart.mobile.data.model.SellerDashboardStats
import com.sheomart.mobile.data.model.SellerStoreProfile
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SellerDashboardScreen(
    user: AuthUser?,
    viewModel: SellerDashboardViewModel,
    onNavigateProducts: () -> Unit,
    onNavigateOrders: () -> Unit,
    onNavigateInventory: () -> Unit,
    onLogout: () -> Unit
) {
    val storeState by viewModel.storeState.collectAsState()
    val statsState by viewModel.statsState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Merchant Control Center",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                        )
                        Text(
                            text = user?.name ?: "Store Owner",
                            style = MaterialTheme.typography.bodySmall,
                            color = SecondaryText
                        )
                    }
                },
                actions = {
                    IconButton(onClick = onLogout) {
                        Text("🚪", fontSize = 18.sp)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        containerColor = Background
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Store Banner / Header Card
            val store = (storeState as? UiState.Success)?.data
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color(0xFF065F46))
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(Color.White.copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("🏪", fontSize = 24.sp)
                        }
                        Column {
                            Text(
                                text = store?.storeName ?: "SheoMart Store",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = Color.White
                            )
                            Text(
                                text = "${store?.city ?: "Sheopur"}, MP",
                                style = MaterialTheme.typography.bodySmall,
                                color = Color.White.copy(alpha = 0.8f)
                            )
                        }
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFFF59E0B))
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = (store?.badge ?: "Verified").uppercase(),
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                            color = Color(0xFF065F46)
                        )
                    }
                }
            }

            // Stats Metrics
            val stats = (statsState as? UiState.Success)?.data ?: SellerDashboardStats()

            Text(
                text = "Overview Performance",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = PrimaryText
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                SellerMetricCard(
                    title = "Revenue",
                    value = "₹${stats.todaysRevenue.toInt()}",
                    icon = "💰",
                    color = PrimaryGreen,
                    modifier = Modifier.weight(1f)
                )
                SellerMetricCard(
                    title = "Pending Orders",
                    value = "${stats.pendingOrdersCount}",
                    icon = "📦",
                    color = if (stats.pendingOrdersCount > 0) Color(0xFFD97706) else PrimaryGreen,
                    modifier = Modifier.weight(1f)
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                SellerMetricCard(
                    title = "Low Stock Items",
                    value = "${stats.lowStockCount}",
                    icon = "⚠️",
                    color = if (stats.lowStockCount > 0) Color(0xFFDC2626) else PrimaryGreen,
                    modifier = Modifier.weight(1f)
                )
                SellerMetricCard(
                    title = "Active Products",
                    value = "${stats.activeProductsCount}",
                    icon = "🏷️",
                    color = PrimaryGreen,
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Quick Operations Navigation
            Text(
                text = "Store Operations",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = PrimaryText
            )

            SellerActionTile(
                title = "Manage Products & Pricing",
                subtitle = "Add new products, adjust selling prices, and edit photos.",
                icon = "📦",
                onClick = onNavigateProducts
            )

            SellerActionTile(
                title = "Customer Orders",
                subtitle = "Fulfill live delivery & pickup orders, update ETA timelines.",
                icon = "🛵",
                badge = if (stats.pendingOrdersCount > 0) "${stats.pendingOrdersCount} NEW" else null,
                onClick = onNavigateOrders
            )

            SellerActionTile(
                title = "Inventory & Stock Levels",
                subtitle = "Update shelf quantities, restock items, and prevent stockouts.",
                icon = "📊",
                onClick = onNavigateInventory
            )
        }
    }
}

@Composable
private fun SellerMetricCard(
    title: String,
    value: String,
    icon: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .border(1.dp, Border, RoundedCornerShape(16.dp))
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(title, style = MaterialTheme.typography.bodySmall, color = SecondaryText)
            Text(icon, fontSize = 16.sp)
        }
        Text(
            text = value,
            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold),
            color = color
        )
    }
}

@Composable
private fun SellerActionTile(
    title: String,
    subtitle: String,
    icon: String,
    badge: String? = null,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .border(1.dp, Border, RoundedCornerShape(16.dp))
            .clickable(onClick = onClick)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(CircleShape)
                .background(Surface),
            contentAlignment = Alignment.Center
        ) {
            Text(icon, fontSize = 20.sp)
        }

        Column(modifier = Modifier.weight(1f)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryText
                )
                if (badge != null) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(Color(0xFFFEF3C7))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = badge,
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold
                            ),
                            color = Color(0xFFD97706)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(2.dp))

            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = SecondaryText
            )
        }

        Text("→", color = PrimaryGreen, fontWeight = FontWeight.Bold, fontSize = 16.sp)
    }
}
