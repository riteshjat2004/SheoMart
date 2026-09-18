package com.sheomart.mobile.ui.admin.analytics

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sheomart.mobile.ui.admin.components.*
import com.sheomart.mobile.ui.components.SectionEmptyView
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.components.ShimmerPlaceholder
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@Composable
fun AdminAnalyticsScreen(
    viewModel: AdminAnalyticsViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val scrollState = rememberScrollState()

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            AdminTopAppBar(
                title = "Business Analytics",
                subtitle = "Platform performance, revenue & trends",
                onBack = onBack,
                actions = {
                    IconButton(onClick = { viewModel.loadAnalytics() }) {
                        Text(text = "🔄", fontSize = 16.sp)
                    }
                }
            )
        },
        containerColor = Background
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(scrollState)
        ) {
            // Reporting Range Presets
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp)
            ) {
                Text(
                    text = "REPORTING TIMEFRAME",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    ),
                    color = SecondaryText
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf(7 to "Last 7 Days", 30 to "Last 30 Days", 90 to "Last 90 Days").forEach { (days, label) ->
                        AdminFilterChip(
                            selected = uiState.selectedPresetDays == days,
                            label = label,
                            onClick = { viewModel.selectPreset(days) }
                        )
                    }
                }
            }

            when (val state = uiState.overviewState) {
                is UiState.Loading -> {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        repeat(4) {
                            ShimmerPlaceholder(
                                modifier = Modifier.fillMaxWidth().height(120.dp),
                                shape = RoundedCornerShape(20.dp)
                            )
                        }
                    }
                }
                is UiState.Success -> {
                    val overview = state.data
                    val kpis = overview.kpis

                    // ==========================================
                    // 1. BUSINESS PERFORMANCE KPIS
                    // ==========================================
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 20.dp)
                    ) {
                        Text(
                            text = "BUSINESS PERFORMANCE",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                            ),
                            color = SecondaryText
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            AdminStatCard(
                                title = "Gross Revenue",
                                value = "₹${kpis.revenue.toInt()}",
                                description = "Paid orders by date",
                                icon = "💰",
                                accentColor = Color(0xFFD97706),
                                modifier = Modifier.weight(1f)
                            )
                            AdminStatCard(
                                title = "Paid Orders",
                                value = "${kpis.orders}",
                                description = "Completed checkouts",
                                icon = "🧾",
                                modifier = Modifier.weight(1f)
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            AdminStatCard(
                                title = "Customers",
                                value = "${kpis.customers}",
                                description = "Joined in range",
                                icon = "👥",
                                modifier = Modifier.weight(1f)
                            )
                            AdminStatCard(
                                title = "Stores",
                                value = "${kpis.stores}",
                                description = "Registered in range",
                                icon = "🏪",
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // ==========================================
                    // 2. OPERATIONAL STATUS BREAKDOWNS
                    // ==========================================
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 20.dp)
                    ) {
                        Text(
                            text = "OPERATIONAL BREAKDOWNS",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                            ),
                            color = SecondaryText
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        // Orders by Status card
                        val ordersBreakdown = overview.breakdowns.ordersByStatus
                        val totalOrdersCount = ordersBreakdown.sumOf { it.count }
                        BreakdownContainerCard(title = "Orders by Status", countText = "$totalOrdersCount orders") {
                            if (ordersBreakdown.isEmpty()) {
                                Text("No order status records in this period.", style = MaterialTheme.typography.bodySmall, color = SecondaryText)
                            } else {
                                ordersBreakdown.forEach { pt ->
                                    AdminBarBreakdownItem(
                                        label = pt.status,
                                        count = pt.count,
                                        total = totalOrdersCount,
                                        barColor = when (pt.status.lowercase()) {
                                            "delivered" -> PrimaryGreen
                                            "cancelled" -> Error
                                            else -> Color(0xFFD97706)
                                        }
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Stores by Status card
                        val storesBreakdown = overview.breakdowns.storesByStatus
                        val totalStoresCount = storesBreakdown.sumOf { it.count }
                        BreakdownContainerCard(title = "Stores by Status", countText = "$totalStoresCount stores") {
                            if (storesBreakdown.isEmpty()) {
                                Text("No store status records in this period.", style = MaterialTheme.typography.bodySmall, color = SecondaryText)
                            } else {
                                storesBreakdown.forEach { pt ->
                                    AdminBarBreakdownItem(
                                        label = pt.status,
                                        count = pt.count,
                                        total = totalStoresCount,
                                        barColor = when (pt.status.lowercase()) {
                                            "approved" -> PrimaryGreen
                                            "rejected" -> Error
                                            "pending" -> Color(0xFFD97706)
                                            else -> Color(0xFF6B7280)
                                        }
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Products by Status card
                        val productsBreakdown = overview.breakdowns.productsByStatus
                        val totalProductsCount = productsBreakdown.sumOf { it.count }
                        BreakdownContainerCard(title = "Products by Status", countText = "$totalProductsCount products") {
                            if (productsBreakdown.isEmpty()) {
                                Text("No product status records in this period.", style = MaterialTheme.typography.bodySmall, color = SecondaryText)
                            } else {
                                productsBreakdown.forEach { pt ->
                                    AdminBarBreakdownItem(
                                        label = pt.status,
                                        count = pt.count,
                                        total = totalProductsCount,
                                        barColor = when (pt.status.lowercase()) {
                                            "in_stock" -> PrimaryGreen
                                            "low_stock" -> Color(0xFFD97706)
                                            "out_of_stock" -> Error
                                            else -> Color(0xFF6B7280)
                                        }
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(36.dp))
                }
                is UiState.Empty -> {
                    Box(modifier = Modifier.fillMaxSize().padding(20.dp), contentAlignment = Alignment.Center) {
                        SectionEmptyView(
                            title = "No business data",
                            description = "Try expanding the reporting timeframe to see available marketplace metrics."
                        )
                    }
                }
                is UiState.Error -> {
                    Box(modifier = Modifier.fillMaxSize().padding(20.dp), contentAlignment = Alignment.Center) {
                        SectionErrorView(
                            message = state.message,
                            onRetry = { viewModel.loadAnalytics() }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun BreakdownContainerCard(
    title: String,
    countText: String,
    content: @Composable ColumnScope.() -> Unit
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
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = PrimaryText
                )
                Text(
                    text = countText,
                    style = MaterialTheme.typography.labelSmall.copy(color = SecondaryText, fontWeight = FontWeight.SemiBold)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))
            content()
        }
    }
}
