package com.sheomart.mobile.ui.seller.reconciliation

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import com.sheomart.mobile.data.model.DailyCashSummary
import com.sheomart.mobile.ui.components.PrimaryButton
import com.sheomart.mobile.ui.components.SectionErrorView
import com.sheomart.mobile.ui.state.UiState
import com.sheomart.mobile.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SellerCashRegisterScreen(
    viewModel: SellerCashRegisterViewModel,
    onBack: () -> Unit
) {
    val colorScheme = MaterialTheme.colorScheme

    val state by viewModel.summaryState.collectAsState()
    val countedCash by viewModel.countedCash.collectAsState()
    val actionMsg by viewModel.actionMessage.collectAsState()

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(actionMsg) {
        actionMsg?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearActionMessage()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Register & Cash Reconciliation",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = colorScheme.onSurface
                        )
                        Text(
                            text = "Daily Register Balancing & Drawer Count",
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
                colors = TopAppBarDefaults.topAppBarColors(containerColor = colorScheme.surface)
            )
        },
        containerColor = colorScheme.background
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when (val res = state) {
                is UiState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = colorScheme.primary)
                    }
                }
                is UiState.Error -> {
                    Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                        SectionErrorView(message = res.message, onRetry = { viewModel.loadCashSummary() })
                    }
                }
                is UiState.Empty, null -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("No cash summary available.", color = colorScheme.onSurfaceVariant)
                    }
                }
                is UiState.Success -> {
                    val summary = res.data
                    val countedVal = countedCash.toDoubleOrNull()
                    val diff = if (countedVal != null) countedVal - summary.expectedCash else null

                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .verticalScroll(rememberScrollState())
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Overview Metrics
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            CashMetricCard(
                                title = "Opening Float",
                                value = "₹${summary.openingCash.toInt()}",
                                icon = "🏦",
                                color = colorScheme.primary,
                                modifier = Modifier.weight(1f)
                            )
                            CashMetricCard(
                                title = "Cash Sales",
                                value = "₹${summary.cashSales.toInt()}",
                                icon = "💵",
                                color = colorScheme.primary,
                                modifier = Modifier.weight(1f)
                            )
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            CashMetricCard(
                                title = "UPI Sales",
                                value = "₹${summary.upiSales.toInt()}",
                                icon = "📱",
                                color = Color(0xFF2563EB),
                                modifier = Modifier.weight(1f)
                            )
                            CashMetricCard(
                                title = "Total Gross Sales",
                                value = "₹${summary.totalSales.toInt()}",
                                icon = "📊",
                                color = colorScheme.primary,
                                modifier = Modifier.weight(1f)
                            )
                        }

                        // Expected vs Counted Card
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(16.dp))
                                .background(colorScheme.surface)
                                .border(1.dp, colorScheme.outlineVariant, RoundedCornerShape(16.dp))
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Text(
                                text = "Drawer Balancing",
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                color = colorScheme.onSurface
                            )

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Expected Cash in Drawer", style = MaterialTheme.typography.bodyMedium, color = colorScheme.onSurfaceVariant)
                                Text(
                                    text = "₹${summary.expectedCash.toInt()}",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                    color = colorScheme.primary
                                )
                            }

                            HorizontalDivider(color = colorScheme.outlineVariant.copy(alpha = 0.5f), thickness = 0.5.dp)

                            OutlinedTextField(
                                value = countedCash,
                                onValueChange = { viewModel.setCountedCash(it) },
                                label = { Text("Actual Cash Counted (₹)") },
                                placeholder = { Text("Enter total physical notes & coins") },
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(10.dp)
                            )

                            if (diff != null) {
                                val (diffText, diffColor, diffBg) = when {
                                    diff == 0.0 -> Triple("✓ Drawer Balanced (₹0 discrepancy)", colorScheme.primary, colorScheme.primary.copy(alpha = 0.12f))
                                    diff > 0.0 -> Triple("▲ Surplus: +₹${diff.toInt()}", Color(0xFFD97706), Color(0xFFFEF3C7))
                                    else -> Triple("▼ Shortage: -₹${(-diff).toInt()}", colorScheme.error, colorScheme.error.copy(alpha = 0.12f))
                                }

                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(diffBg)
                                        .padding(12.dp)
                                ) {
                                    Text(
                                        text = diffText,
                                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                                        color = diffColor
                                    )
                                }
                            }

                            PrimaryButton(
                                text = "Close Register & Reconcile Day",
                                onClick = { viewModel.reconcileRegister() },
                                modifier = Modifier.fillMaxWidth(),
                                enabled = countedCash.isNotBlank()
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CashMetricCard(
    title: String,
    value: String,
    icon: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    val colorScheme = MaterialTheme.colorScheme
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(colorScheme.surface)
            .border(1.dp, colorScheme.outlineVariant, RoundedCornerShape(16.dp))
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(title, style = MaterialTheme.typography.bodySmall, color = colorScheme.onSurfaceVariant)
            Text(icon, fontSize = 16.sp)
        }
        Text(
            text = value,
            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold),
            color = color
        )
    }
}
